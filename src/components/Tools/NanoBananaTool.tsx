import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useImageContext } from '../Context/ImageContext';
import { useToolContext } from '../Context/ToolContext';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { toast } from 'sonner';
import { Sparkles, Loader2, Download, Undo2 } from 'lucide-react';

interface NanoBananaToolProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const NanoBananaTool: React.FC<NanoBananaToolProps> = ({ canvasRef }) => {
  const { currentImage } = useImageContext();
  const { currentSelection } = useToolContext();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [featherRadius, setFeatherRadius] = useState(3);
  const sketchCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize sketch canvas
  useEffect(() => {
    if (!sketchCanvasRef.current || !canvasRef.current) return;
    
    const sketchCanvas = sketchCanvasRef.current;
    const mainCanvas = canvasRef.current;
    
    sketchCanvas.width = mainCanvas.width;
    sketchCanvas.height = mainCanvas.height;
    
    const ctx = sketchCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillRect(0, 0, sketchCanvas.width, sketchCanvas.height);
    }
  }, [canvasRef]);

  // Convert canvas to WebP with alpha channel
  const canvasToWebP = useCallback(async (canvas: HTMLCanvasElement): Promise<string> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert canvas to blob'));
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        },
        'image/webp',
        1.0 // Lossless
      );
    });
  }, []);

  // Generate mask from selection
  const generateMask = useCallback(async (): Promise<string | null> => {
    if (!currentSelection || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return null;

    // Fill with transparent black
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    // Draw selection as white with alpha channel
    const imageData = ctx.createImageData(maskCanvas.width, maskCanvas.height);
    const data = imageData.data;

    for (let i = 0; i < currentSelection.pixels.length; i++) {
      if (currentSelection.pixels[i]) {
        const idx = i * 4;
        data[idx] = 255;     // R
        data[idx + 1] = 255; // G
        data[idx + 2] = 255; // B
        data[idx + 3] = 255; // A - opaque white = mask area
      }
    }

    // Apply feathering to mask edges
    if (featherRadius > 0) {
      const feathered = applyFeathering(imageData, featherRadius);
      ctx.putImageData(feathered, 0, 0);
    } else {
      ctx.putImageData(imageData, 0, 0);
    }

    return await canvasToWebP(maskCanvas);
  }, [currentSelection, canvasRef, featherRadius, canvasToWebP]);

  // Simple feathering algorithm (Gaussian-like blur on mask edges)
  const applyFeathering = (imageData: ImageData, radius: number): ImageData => {
    const { width, height, data } = imageData;
    const output = new ImageData(width, height);
    const outData = output.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        
        // Sample surrounding pixels
        let sum = 0;
        let count = 0;
        
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = (ny * width + nx) * 4;
              sum += data[nidx + 3]; // Alpha channel
              count++;
            }
          }
        }
        
        const avgAlpha = sum / count;
        outData[idx] = 255;
        outData[idx + 1] = 255;
        outData[idx + 2] = 255;
        outData[idx + 3] = avgAlpha;
      }
    }
    
    return output;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (!canvasRef.current) {
      toast.error('Canvas not ready');
      return;
    }

    try {
      setIsGenerating(true);
      toast.info('Generating with Nano Banana AI...');

      // Convert base image to WebP
      const baseImageUrl = await canvasToWebP(canvasRef.current);

      // Generate mask from selection (if any)
      const maskImageUrl = await generateMask();

      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/nano-banana-edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          baseImage: baseImageUrl,
          maskImage: maskImageUrl,
          prompt: prompt,
          mode: maskImageUrl ? 'targeted-edit' : 'full-edit'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Generation failed');
      }

      const result = await response.json();
      
      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        toast.success('Image generated successfully!');
      } else {
        throw new Error(result.error || 'No image returned');
      }

    } catch (error) {
      console.error('Nano Banana generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `nano-banana-${Date.now()}.png`;
    link.click();
    toast.success('Image downloaded');
  };

  const handleApplyToCanvas = () => {
    if (!generatedImage || !canvasRef.current) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      toast.success('Applied to canvas');
      setGeneratedImage(null);
    };
    img.src = generatedImage;
  };

  return (
    <Card className="absolute top-4 right-4 w-96 z-20 bg-editor-panel border-border shadow-panel">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-editor-accent" />
          Nano Banana AI
          <Badge variant="secondary" className="ml-auto">Phase 1</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden sketch canvas for mask drawing */}
        <canvas
          ref={sketchCanvasRef}
          className="hidden"
        />

        {/* Prompt Input */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Editing Prompt
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to change or add to the image..."
            className="min-h-[100px] resize-none"
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {currentSelection ? 'Editing selected area' : 'Editing entire image'}
          </p>
        </div>

        {/* Feathering Control */}
        {currentSelection && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              Mask Feathering (Dilation): {featherRadius}px
            </label>
            <Slider
              value={[featherRadius]}
              onValueChange={([value]) => setFeatherRadius(value)}
              min={0}
              max={20}
              step={1}
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Smooths mask edges for seamless blending
            </p>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate with AI
            </>
          )}
        </Button>

        {/* Generated Image Preview */}
        {generatedImage && (
          <div className="space-y-3 p-3 border border-border rounded-lg bg-background">
            <div className="relative">
              <img
                src={generatedImage}
                alt="Generated result"
                className="w-full rounded border border-canvas-border"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleApplyToCanvas}
                variant="default"
                size="sm"
                className="flex-1"
              >
                <Undo2 className="w-4 h-4 mr-1" />
                Apply
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded">
          <p className="font-medium">How to use:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Use Magic Wand/Lasso to select an area (optional)</li>
            <li>Enter your editing prompt</li>
            <li>Adjust feathering for smooth edges</li>
            <li>Click Generate to create with AI</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};