import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Plus, X, Image as ImageIcon, Upload, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useLayerContext } from '@/components/Context/LayerContext';

interface Reference {
  id: string;
  type: 'layer' | 'canvas' | 'asset' | 'upload';
  name: string;
  prompt: string;
  imageUrl?: string;
}

const MAX_REFERENCES = 8; // Nano Banana limit

export const AdvancedAIGeneratePanel: React.FC = () => {
  const { layers } = useLayerContext();
  const [mainPrompt, setMainPrompt] = useState('');
  const [references, setReferences] = useState<Reference[]>([]);
  const [realism, setRealism] = useState([50]);
  const [quality, setQuality] = useState('balanced');
  const [showFinalPrompt, setShowFinalPrompt] = useState(false);

  const addReference = (type: Reference['type']) => {
    if (references.length >= MAX_REFERENCES) {
      alert(`Maximum ${MAX_REFERENCES} references allowed`);
      return;
    }

    const newRef: Reference = {
      id: `ref-${Date.now()}`,
      type,
      name: `Reference ${references.length + 1}`,
      prompt: ''
    };

    setReferences([...references, newRef]);
  };

  const updateReference = (id: string, updates: Partial<Reference>) => {
    setReferences(refs => refs.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const removeReference = (id: string) => {
    setReferences(refs => refs.filter(r => r.id !== id));
  };

  const assembleFinalPrompt = (): string => {
    let final = mainPrompt;
    
    references.forEach((ref, idx) => {
      if (ref.prompt) {
        final += `\n[Reference ${idx + 1} - ${ref.name}]: ${ref.prompt}`;
      }
    });

    return final;
  };

  const handleGenerate = () => {
    const finalPrompt = assembleFinalPrompt();
    console.log('Generating with prompt:', finalPrompt);
    console.log('References:', references);
    // TODO: Implement actual generation
  };

  return (
    <div className="w-96 bg-editor-panel border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-editor-accent" />
          Advanced AI Generation
        </h3>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Main Prompt */}
        <div className="space-y-2">
          <Label className="text-xs">Main Prompt</Label>
          <Textarea
            placeholder="Describe the image you want to generate..."
            value={mainPrompt}
            onChange={(e) => setMainPrompt(e.target.value)}
            className="min-h-[100px] text-xs"
          />
        </div>

        <Separator />

        {/* Add References */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">
              References ({references.length}/{MAX_REFERENCES})
            </Label>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={() => addReference('layer')}
                disabled={references.length >= MAX_REFERENCES}
              >
                <Layers className="w-3 h-3 mr-1" />
                Layer
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={() => addReference('canvas')}
                disabled={references.length >= MAX_REFERENCES}
              >
                <ImageIcon className="w-3 h-3 mr-1" />
                Canvas
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={() => addReference('upload')}
                disabled={references.length >= MAX_REFERENCES}
              >
                <Upload className="w-3 h-3 mr-1" />
                Upload
              </Button>
            </div>
          </div>

          {/* Reference List */}
          <div className="space-y-2">
            {references.map((ref, idx) => (
              <div
                key={ref.id}
                className="bg-editor-toolbar rounded border border-border p-2 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded border border-border flex items-center justify-center flex-shrink-0">
                    {ref.type === 'layer' && <Layers className="w-4 h-4" />}
                    {ref.type === 'canvas' && <ImageIcon className="w-4 h-4" />}
                    {ref.type === 'upload' && <Upload className="w-4 h-4" />}
                  </div>

                  <div className="flex-1">
                    <input
                      type="text"
                      value={ref.name}
                      onChange={(e) => updateReference(ref.id, { name: e.target.value })}
                      className="w-full bg-transparent text-xs font-medium border-none outline-none"
                      placeholder="Reference name"
                    />
                    
                    {/* Source Selection */}
                    {ref.type === 'layer' && (
                      <Select
                        value={ref.imageUrl}
                        onValueChange={(value) => updateReference(ref.id, { imageUrl: value })}
                      >
                        <SelectTrigger className="h-6 text-xs mt-1">
                          <SelectValue placeholder="Select layer" />
                        </SelectTrigger>
                        <SelectContent>
                          {layers.map(layer => (
                            <SelectItem key={layer.id} value={layer.id} className="text-xs">
                              {layer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6"
                    onClick={() => removeReference(ref.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                {/* Reference Prompt */}
                <Textarea
                  placeholder="Specific instructions for this reference..."
                  value={ref.prompt}
                  onChange={(e) => updateReference(ref.id, { prompt: e.target.value })}
                  className="min-h-[60px] text-xs"
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Style Settings */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Style (Cartoon → Realistic → 3D)</Label>
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
              <span>Artistic</span>
              <span>Real</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Quality</Label>
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

          <div className="space-y-2">
            <Label className="text-xs">Camera Quality</Label>
            <Select defaultValue="dslr">
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
        </div>

        <Separator />

        {/* Final Prompt Preview */}
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => setShowFinalPrompt(!showFinalPrompt)}
          >
            {showFinalPrompt ? 'Hide' : 'Show'} Final Prompt
          </Button>

          {showFinalPrompt && (
            <div className="bg-muted rounded p-3 text-xs font-mono max-h-40 overflow-auto">
              {assembleFinalPrompt() || 'No prompt entered yet...'}
            </div>
          )}
        </div>

        {/* Generate Button */}
        <Button className="w-full" onClick={handleGenerate}>
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Image
        </Button>
      </div>
    </div>
  );
};
