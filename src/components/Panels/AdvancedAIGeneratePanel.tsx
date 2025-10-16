import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Plus, X, Image as ImageIcon, Upload, Layers, Paintbrush, Link2, ChevronDown, ChevronUp, Activity, Palette, Pencil, Brush, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLayerContext } from '@/components/Context/LayerContext';
import { toast } from 'sonner';

interface Reference {
  id: string;
  type: 'layer' | 'canvas' | 'asset' | 'upload' | 'sketch';
  name: string;
  prompt: string;
  negative?: string;
  imageUrl?: string;
  sketchColor?: string;
  linkedTo?: string;
  expanded?: boolean;
}

const MAX_REFERENCES = 8;
const SKETCH_COLORS = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'];

export const AdvancedAIGeneratePanel: React.FC = () => {
  const { layers } = useLayerContext();
  const [basePrompt, setBasePrompt] = useState('');
  const [references, setReferences] = useState<Reference[]>([]);
  const [styleType, setStyleType] = useState('photo');
  const [quality, setQuality] = useState('high');
  const [cameraQuality, setCameraQuality] = useState('dslr');
  const [generationQuality, setGenerationQuality] = useState('balanced');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [enforceAspect, setEnforceAspect] = useState(true);
  const [cameraSettings, setCameraSettings] = useState({
    lens: '50mm',
    aperture: 'f/1.8',
    shutter: '1/125s'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addReference = (type: Reference['type']) => {
    if (references.length >= MAX_REFERENCES) {
      toast.error(`Maximum ${MAX_REFERENCES} references allowed`);
      return;
    }
    
    if (type === 'upload') {
      fileInputRef.current?.click();
      return;
    }

    const newRef: Reference = {
      id: `ref-${Date.now()}`,
      type,
      name: type === 'sketch' ? `Sketch Layer (${SKETCH_COLORS[0]})` : `${type.charAt(0).toUpperCase() + type.slice(1)} Reference`,
      prompt: '',
      expanded: true,
      sketchColor: type === 'sketch' ? SKETCH_COLORS[0] : undefined,
    };
    
    setReferences([...references, newRef]);
    toast.success(`${type} reference added`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (references.length >= MAX_REFERENCES) {
      toast.error(`Maximum ${MAX_REFERENCES} references allowed`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const newRef: Reference = {
        id: `ref-${Date.now()}`,
        type: 'upload',
        name: file.name,
        prompt: '',
        imageUrl: event.target?.result as string,
        expanded: true,
      };
      setReferences([...references, newRef]);
      toast.success('Image uploaded');
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeReference = (id: string) => {
    setReferences(references.filter(ref => ref.id !== id));
    toast.success('Reference removed');
  };

  const updateReference = (id: string, updates: Partial<Reference>) => {
    setReferences(references.map(ref => 
      ref.id === id ? { ...ref, ...updates } : ref
    ));
  };

  const assembleFinalPrompt = () => {
    let finalPrompt = `BASE PROMPT: ${basePrompt}\n\n`;
    
    finalPrompt += `COMPOSITION STACK (${references.length} references):\n\n`;
    
    references.forEach((ref, index) => {
      const imageNum = index + 1;
      finalPrompt += `IMAGE ${imageNum}: ${ref.name}\n`;
      
      if (ref.type === 'sketch' && ref.sketchColor) {
        finalPrompt += `  - Type: ${ref.sketchColor} sketch overlay\n`;
        finalPrompt += `  - Purpose: Defines composition/pose structure\n`;
      } else {
        finalPrompt += `  - Type: ${ref.type} reference\n`;
      }
      
      if (ref.prompt) {
        finalPrompt += `  - Instructions: ${ref.prompt}\n`;
      }
      
      if (ref.linkedTo) {
        const linkedRef = references.find(r => r.id === ref.linkedTo);
        if (linkedRef && linkedRef.sketchColor) {
          finalPrompt += `  - Linked to: ${linkedRef.name} [${linkedRef.sketchColor}]\n`;
          finalPrompt += `  - Action: Apply this reference to the ${linkedRef.sketchColor} sketch structure\n`;
        }
      }
      
      if (ref.negative) {
        finalPrompt += `  - Negative: ${ref.negative}\n`;
      }
      
      finalPrompt += '\n';
    });

    finalPrompt += `TECHNICAL SETTINGS:\n`;
    finalPrompt += `  - Style: ${styleType}\n`;
    finalPrompt += `  - Aspect Ratio: ${aspectRatio}${enforceAspect ? ' (enforced)' : ''}\n`;
    finalPrompt += `  - Camera: ${cameraSettings.lens}, ${cameraSettings.aperture}, ${cameraSettings.shutter}\n`;
    finalPrompt += `  - Camera Quality: ${cameraQuality}\n`;
    finalPrompt += `  - Generation Quality: ${generationQuality}\n`;

    return finalPrompt;
  };

  const analyzeComplexity = () => {
    let complexity = 0;
    if (basePrompt.length > 50) complexity += 20;
    complexity += references.length * 10;
    complexity += references.filter(r => r.prompt).length * 5;
    complexity += references.filter(r => r.linkedTo).length * 10;
    return Math.min(100, complexity);
  };

  const handleGenerate = () => {
    if (!basePrompt.trim()) {
      toast.error('Please enter a base prompt');
      return;
    }
    
    const finalPrompt = assembleFinalPrompt();
    console.log('Generating with ICE prompt:', finalPrompt);
    toast.success('Generation started!');
  };

  const sketchRefs = references.filter(r => r.type === 'sketch');

  return (
    <div className="w-96 bg-editor-panel border-l border-border flex flex-col h-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-editor-accent" />
          ICE - AI Generator
        </h3>
        <p className="text-[10px] text-muted-foreground mt-1">Instructional Composition Environment</p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* User Idea (Base Prompt) */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">User Idea (Base Prompt)</Label>
          <Textarea
            value={basePrompt}
            onChange={(e) => setBasePrompt(e.target.value)}
            placeholder="A futuristic cityscape at dusk, cinematic lighting..."
            className="text-xs min-h-[70px] resize-none"
          />
        </div>

        <Separator />

        {/* Add Reference Buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Composition Stack ({references.length}/{MAX_REFERENCES})</Label>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex-1"
              onClick={() => addReference('layer')}
              disabled={references.length >= MAX_REFERENCES}
            >
              <Plus className="w-3 h-3 mr-1" />
              Reference
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex-1"
              onClick={() => addReference('sketch')}
              disabled={references.length >= MAX_REFERENCES}
            >
              <Plus className="w-3 h-3 mr-1" />
              Sketch
            </Button>
          </div>
        </div>

        {/* Reference Stack */}
        {references.length > 0 && (
          <div className="space-y-2">
            {references.map((ref) => (
              <Collapsible
                key={ref.id}
                open={ref.expanded}
                onOpenChange={(open) => updateReference(ref.id, { expanded: open })}
              >
                <div className="bg-editor-toolbar rounded border border-border overflow-hidden">
                  {/* Reference Header */}
                  <div className="flex items-center gap-2 p-2 border-b border-border">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-5 h-5">
                        {ref.expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                      </Button>
                    </CollapsibleTrigger>

                    {ref.type === 'sketch' && ref.sketchColor && (
                      <div className="px-1.5 py-0.5 bg-primary/20 text-primary rounded text-[9px] font-bold">
                        {ref.sketchColor}
                      </div>
                    )}

                    <Input
                      value={ref.name}
                      onChange={(e) => updateReference(ref.id, { name: e.target.value })}
                      className="flex-1 h-6 text-xs"
                      placeholder="Reference name"
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-5 h-5"
                      onClick={() => removeReference(ref.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>

                  <CollapsibleContent>
                    <div className="p-3 space-y-2">
                      {/* Sketch Color Selector */}
                      {ref.type === 'sketch' && (
                        <div className="space-y-1">
                          <Label className="text-xs">Sketch Color</Label>
                          <Select
                            value={ref.sketchColor}
                            onValueChange={(value) => updateReference(ref.id, { sketchColor: value })}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SKETCH_COLORS.map(color => (
                                <SelectItem key={color} value={color} className="text-xs">
                                  {color}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Link to Sketch */}
                      {ref.type !== 'sketch' && sketchRefs.length > 0 && (
                        <div className="space-y-1">
                          <Label className="text-xs flex items-center gap-1">
                            <Link2 className="w-3 h-3" />
                            Link to Sketch
                          </Label>
                          <Select
                            value={ref.linkedTo || ''}
                            onValueChange={(value) => updateReference(ref.id, { linkedTo: value || undefined })}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder="No link" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="" className="text-xs">No link</SelectItem>
                              {sketchRefs.map(sketch => (
                                <SelectItem key={sketch.id} value={sketch.id} className="text-xs">
                                  {sketch.name} {sketch.sketchColor && `[${sketch.sketchColor}]`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Prompt */}
                      <div className="space-y-1">
                        <Label className="text-xs">Prompt Instructions</Label>
                        <Textarea
                          value={ref.prompt}
                          onChange={(e) => updateReference(ref.id, { prompt: e.target.value })}
                          placeholder="How should this reference be used?"
                          className="min-h-[50px] text-xs resize-none"
                        />
                      </div>

                      {/* Negative Prompt */}
                      <div className="space-y-1">
                        <Label className="text-xs">Negative Prompt</Label>
                        <Input
                          value={ref.negative || ''}
                          onChange={(e) => updateReference(ref.id, { negative: e.target.value })}
                          placeholder="What to avoid..."
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        )}

        <Separator />

        {/* Advanced Settings - Always Open */}
        <div className="space-y-3">
          {/* Camera Settings */}
          <div className="space-y-2">
            <Label className="text-xs">Camera Settings</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select value={cameraSettings.lens} onValueChange={(v) => setCameraSettings(prev => ({...prev, lens: v}))}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24mm">24mm</SelectItem>
                  <SelectItem value="35mm">35mm</SelectItem>
                  <SelectItem value="50mm">50mm</SelectItem>
                  <SelectItem value="85mm">85mm</SelectItem>
                  <SelectItem value="135mm">135mm</SelectItem>
                </SelectContent>
              </Select>
              <Select value={cameraSettings.aperture} onValueChange={(v) => setCameraSettings(prev => ({...prev, aperture: v}))}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="f/1.4">f/1.4</SelectItem>
                  <SelectItem value="f/1.8">f/1.8</SelectItem>
                  <SelectItem value="f/2.8">f/2.8</SelectItem>
                  <SelectItem value="f/4">f/4</SelectItem>
                  <SelectItem value="f/5.6">f/5.6</SelectItem>
                </SelectContent>
              </Select>
              <Select value={cameraSettings.shutter} onValueChange={(v) => setCameraSettings(prev => ({...prev, shutter: v}))}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1/30s">1/30s</SelectItem>
                  <SelectItem value="1/60s">1/60s</SelectItem>
                  <SelectItem value="1/125s">1/125s</SelectItem>
                  <SelectItem value="1/250s">1/250s</SelectItem>
                  <SelectItem value="1/500s">1/500s</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Aspect Ratio & Enforce */}
          <div className="flex gap-2">
            <Select value={aspectRatio} onValueChange={setAspectRatio} >
              <SelectTrigger className="flex-1 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1">1:1 Square</SelectItem>
                <SelectItem value="4:3">4:3 Standard</SelectItem>
                <SelectItem value="16:9">16:9 Widescreen</SelectItem>
                <SelectItem value="21:9">21:9 Cinematic</SelectItem>
                <SelectItem value="9:16">9:16 Portrait</SelectItem>
              </SelectContent>
            </Select>
            <TooltipProvider>
              <Tooltip delayDuration={2000}>
                <TooltipTrigger asChild>
                  <Button
                    variant={enforceAspect ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEnforceAspect(!enforceAspect)}
                    className="h-7 px-3 text-xs"
                  >
                    Enforce
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Enforce aspect ratio on all references</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Style Selection - Icon Buttons */}
          <div className="space-y-2">
            <Label className="text-xs">Style</Label>
            <div className="grid grid-cols-4 gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={styleType === "cartoon" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStyleType("cartoon")}
                      className="h-9 flex flex-col gap-0.5 p-1"
                    >
                      <Palette className="w-4 h-4" />
                      <span className="text-[9px]">Cartoon</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Cartoon/Manga style</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={styleType === "drawing" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStyleType("drawing")}
                      className="h-9 flex flex-col gap-0.5 p-1"
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="text-[9px]">Drawing</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Hand-drawn sketch</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={styleType === "painting" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStyleType("painting")}
                      className="h-9 flex flex-col gap-0.5 p-1"
                    >
                      <Brush className="w-4 h-4" />
                      <span className="text-[9px]">Painting</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Oil/watercolor painting</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={styleType === "photo" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStyleType("photo")}
                      className="h-9 flex flex-col gap-0.5 p-1"
                    >
                      <Camera className="w-4 h-4" />
                      <span className="text-[9px]">Photo</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Photorealistic</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Quality Settings - Side by Side */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Camera Quality</Label>
              <Select value={cameraQuality} onValueChange={setCameraQuality}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="dslr">DSLR</SelectItem>
                  <SelectItem value="imax">IMAX</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Gen Quality</Label>
              <Select value={generationQuality} onValueChange={setGenerationQuality}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Analysis & Final Prompt */}
        <div className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('AI analyzing prompt...')}
            className="w-full text-xs"
          >
            <Activity className="w-3 h-3 mr-2" />
            Analyze Prompt (AI Co-pilot)
          </Button>

          {/* Complexity Meter */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Complexity Meter</Label>
              <span className="text-xs text-muted-foreground">{analyzeComplexity()}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${analyzeComplexity()}%` }}
              />
            </div>
          </div>

          {/* Assembled Prompt - Always Visible */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Assembled Prompt</Label>
            <div className="p-3 bg-muted/50 rounded border border-border max-h-40 overflow-y-auto">
              <div className="text-[10px] space-y-1 font-mono whitespace-pre-wrap">
                {assembleFinalPrompt()}
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button className="w-full" size="lg" onClick={handleGenerate}>
          <Sparkles className="w-4 h-4 mr-2" />
          GENERATE
        </Button>
      </div>
    </div>
  );
};
