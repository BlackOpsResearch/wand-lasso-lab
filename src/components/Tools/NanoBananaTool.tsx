import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useImageContext } from '../Context/ImageContext';
import { useToolContext } from '../Context/ToolContext';
import { useLayerContext } from '../Context/LayerContext';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { toast } from 'sonner';
import { Sparkles, Loader2, Download, Undo2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NanoBananaToolProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const NanoBananaTool: React.FC<NanoBananaToolProps> = ({ canvasRef }) => {
  const { currentImage } = useImageContext();
  const { currentSelection } = useToolContext();
  const { layers, activeLayerId, addLayer } = useLayerContext();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [featherRadius, setFeatherRadius] = useState(3);
  const [referenceType, setReferenceType] = useState<'canvas' | 'layer' | 'none'>('canvas');
  const [selectedLayerRef, setSelectedLayerRef] = useState<string | null>(null);
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

      // Get reference image based on selection
      let baseImageUrl: string | null = null;
      
      if (referenceType === 'canvas') {
        baseImageUrl = await canvasToWebP(canvasRef.current);
      } else if (referenceType === 'layer' && selectedLayerRef) {
        const layer = layers.find(l => l.id === selectedLayerRef);
        if (layer?.imageUrl) {
          baseImageUrl = layer.imageUrl;
        } else if (layer?.data) {
          // Convert layer data to canvas and then to WebP
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvasRef.current.width;
          tempCanvas.height = canvasRef.current.height;
          const ctx = tempCanvas.getContext('2d');
          if (ctx) {
            ctx.putImageData(layer.data, 0, 0);
            baseImageUrl = await canvasToWebP(tempCanvas);
          }
        }
      }

      // Generate mask from selection (if any)
      const maskImageUrl = await generateMask();

      // Use Supabase client to invoke the edge function
      const { data, error } = await supabase.functions.invoke('nano-banana-edit', {
        body: {
          baseImage: baseImageUrl,
          maskImage: maskImageUrl,
          prompt: prompt,
          mode: maskImageUrl ? 'targeted-edit' : 'full-edit'
        },
      });

      if (error) {
        throw new Error(error.message || 'Generation failed');
      }
      
      if (data?.success && data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        // Automatically create a new layer with the generated image
        addLayer(`AI Gen ${Date.now()}`, null, data.imageUrl);
        toast.success('Image generated and added as new layer!');
      } else {
        throw new Error(data?.error || 'No image returned');
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

      // Resize canvas to match generated image dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the generated image
      ctx.drawImage(img, 0, 0);
      toast.success('Applied to canvas');
      setGeneratedImage(null);
    };
    img.src = generatedImage;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-editor-accent" />
        <h3 className="text-lg font-semibold">Nano Banana AI</h3>
        <Badge variant="secondary" className="ml-auto">Phase 1</Badge>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          {/* Reference Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Reference Image
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  variant={referenceType === 'canvas' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReferenceType('canvas')}
                  className="flex-1"
                >
                  Canvas
                </Button>
                <Button
                  variant={referenceType === 'layer' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReferenceType('layer')}
                  className="flex-1"
                >
                  Layer
                </Button>
                <Button
                  variant={referenceType === 'none' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReferenceType('none')}
                  className="flex-1"
                >
                  None
                </Button>
              </div>
              {referenceType === 'layer' && (
                <select
                  value={selectedLayerRef || ''}
                  onChange={(e) => setSelectedLayerRef(e.target.value)}
                  className="w-full p-2 rounded bg-background border border-border"
                >
                  <option value="">Select a layer</option>
                  {layers.map(layer => (
                    <option key={layer.id} value={layer.id}>
                      {layer.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

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
              <li>Choose reference (canvas, layer, or none)</li>
              <li>Use Magic Wand/Lasso to select an area (optional)</li>
              <li>Enter your editing prompt</li>
              <li>Adjust feathering for smooth edges</li>
              <li>Click Generate - result will be added as a new layer</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};