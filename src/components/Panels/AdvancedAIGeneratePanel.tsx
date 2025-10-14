import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Plus, X, Image as ImageIcon, Upload, Layers, Paintbrush, Link2, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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

const MAX_REFERENCES = 8; // Nano Banana limit
const SKETCH_COLORS = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'];

export const AdvancedAIGeneratePanel: React.FC = () => {
  const { layers } = useLayerContext();
  const [basePrompt, setBasePrompt] = useState('');
  const [references, setReferences] = useState<Reference[]>([]);
  const [realism, setRealism] = useState([50]);
  const [quality, setQuality] = useState('high');
  const [cameraQuality, setCameraQuality] = useState('dslr');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [enforceAspect, setEnforceAspect] = useState(true);
  const [cameraLens, setCameraLens] = useState('50mm');
  const [aperture, setAperture] = useState('f/1.8');
  const [shutter, setShutter] = useState('1/125s');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [showFinalPrompt, setShowFinalPrompt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addReference = (type: Reference['type']) => {
    if (references.length >= MAX_REFERENCES) {
      toast.error(`Maximum ${MAX_REFERENCES} references allowed (Nano Banana limit)`);
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
        if (linkedRef) {
          finalPrompt += `  - Linked to: ${linkedRef.name}\n`;
          finalPrompt += `  - Action: Apply this reference content to the linked sketch structure\n`;
        }
      }
      
      if (ref.negative) {
        finalPrompt += `  - Negative: ${ref.negative}\n`;
      }
      
      finalPrompt += '\n';
    });

    finalPrompt += `TECHNICAL SETTINGS:\n`;
    finalPrompt += `  - Aspect Ratio: ${aspectRatio}${enforceAspect ? ' (enforced on all refs)' : ''}\n`;
    finalPrompt += `  - Camera: ${cameraLens}, ${aperture}, ${shutter}\n`;
    finalPrompt += `  - Camera Quality: ${cameraQuality.toUpperCase()}\n`;
    finalPrompt += `  - Quality: ${quality}\n`;
    finalPrompt += `  - Style Realism: ${realism[0]}%\n`;

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

          <div className="grid grid-cols-4 gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => addReference('layer')}
              disabled={references.length >= MAX_REFERENCES}
              title="Add Layer"
            >
              <Layers className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => addReference('canvas')}
              disabled={references.length >= MAX_REFERENCES}
              title="Add Canvas"
            >
              <ImageIcon className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => addReference('asset')}
              disabled={references.length >= MAX_REFERENCES}
              title="Add Asset"
            >
              <Sparkles className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => addReference('upload')}
              disabled={references.length >= MAX_REFERENCES}
              title="Upload Image"
            >
              <Upload className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Reference Stack */}
        {references.length > 0 && (
          <div className="space-y-2">
            {references.map((ref, index) => (
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

                    <div className="w-6 h-6 bg-muted rounded border border-border flex items-center justify-center flex-shrink-0">
                      {ref.type === 'sketch' && <Paintbrush className="w-3 h-3" />}
                      {ref.type === 'layer' && <Layers className="w-3 h-3" />}
                      {ref.type === 'canvas' && <ImageIcon className="w-3 h-3" />}
                      {ref.type === 'upload' && <Upload className="w-3 h-3" />}
                    </div>

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

                      {/* Layer/Asset Selection */}
                      {(ref.type === 'layer' || ref.type === 'asset') && (
                        <div className="space-y-1">
                          <Label className="text-xs">Source {ref.type === 'layer' ? 'Layer' : 'Asset'}</Label>
                          <Select
                            value={ref.imageUrl}
                            onValueChange={(value) => updateReference(ref.id, { imageUrl: value })}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder={`Select ${ref.type}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {layers.map(layer => (
                                <SelectItem key={layer.id} value={layer.id} className="text-xs">
                                  {layer.name}
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
                                  {sketch.name}
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
                        <Label className="text-xs">Negative Prompt (Optional)</Label>
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

        {/* Advanced Settings */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full text-xs">
              {advancedOpen ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
              Advanced Settings
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-3 mt-3">
            {/* Smart Aspect Ratio */}
            <div className="space-y-2">
              <Label className="text-xs">Smart Aspect Ratio System</Label>
              <div className="flex gap-2">
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger className="text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1" className="text-xs">1:1 Square</SelectItem>
                    <SelectItem value="4:3" className="text-xs">4:3 Standard</SelectItem>
                    <SelectItem value="16:9" className="text-xs">16:9 Widescreen</SelectItem>
                    <SelectItem value="21:9" className="text-xs">21:9 Ultrawide</SelectItem>
                    <SelectItem value="9:16" className="text-xs">9:16 Portrait</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant={enforceAspect ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => setEnforceAspect(!enforceAspect)}
                >
                  Enforce
                </Button>
              </div>
            </div>

            {/* Camera Settings */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Lens</Label>
                <Select value={cameraLens} onValueChange={setCameraLens}>
                  <SelectTrigger className="text-xs h-7">
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
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Aperture</Label>
                <Select value={aperture} onValueChange={setAperture}>
                  <SelectTrigger className="text-xs h-7">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="f/1.4">f/1.4</SelectItem>
                    <SelectItem value="f/1.8">f/1.8</SelectItem>
                    <SelectItem value="f/2.8">f/2.8</SelectItem>
                    <SelectItem value="f/5.6">f/5.6</SelectItem>
                    <SelectItem value="f/8">f/8</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Shutter</Label>
                <Select value={shutter} onValueChange={setShutter}>
                  <SelectTrigger className="text-xs h-7">
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

            {/* Camera Quality */}
            <div className="space-y-1">
              <Label className="text-xs">Camera Quality</Label>
              <Select value={cameraQuality} onValueChange={setCameraQuality}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="cellphone">Cellphone</SelectItem>
                  <SelectItem value="polaroid">Polaroid</SelectItem>
                  <SelectItem value="dslr">DSLR</SelectItem>
                  <SelectItem value="imax">IMAX</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quality */}
            <div className="space-y-1">
              <Label className="text-xs">Generation Quality</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="high">High Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Style Realism Slider */}
            <div className="space-y-2">
              <Label className="text-xs">Style Realism</Label>
              <Slider
                value={realism}
                onValueChange={setRealism}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Cartoon</span>
                <span>{realism[0]}%</span>
                <span>Photorealistic</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Analysis & Final Prompt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Analysis & Final Prompt</Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => toast.success('AI Co-pilot analyzing...')}
            >
              <Activity className="w-3 h-3 mr-1" />
              Analyze
            </Button>
          </div>

          {/* Complexity Meter */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Complexity</span>
              <span className="font-medium">{analyzeComplexity()}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${analyzeComplexity()}%` }}
              />
            </div>
          </div>

          {/* Final Prompt */}
          <Collapsible open={showFinalPrompt} onOpenChange={setShowFinalPrompt}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full text-xs">
                {showFinalPrompt ? 'Hide' : 'Show'} Assembled Prompt
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-2">
              <div className="bg-muted rounded p-3 text-xs font-mono max-h-60 overflow-auto whitespace-pre-wrap">
                {assembleFinalPrompt()}
              </div>
            </CollapsibleContent>
          </Collapsible>
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
