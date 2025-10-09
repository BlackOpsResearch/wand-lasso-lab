import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Wand2, PenTool, Lasso, Pin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const AIToolsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('instruct');
  const [prompt, setPrompt] = useState('');
  const [realism, setRealism] = useState([50]);
  const [quality, setQuality] = useState('balanced');

  return (
    <div className="w-80 bg-editor-panel border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-editor-accent" />
          AI Tools
        </h3>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-5 rounded-none border-b border-border bg-transparent h-10">
          <TabsTrigger value="instruct" className="text-xs">Instruct</TabsTrigger>
          <TabsTrigger value="generate" className="text-xs">Generate</TabsTrigger>
          <TabsTrigger value="enhance" className="text-xs">Enhance</TabsTrigger>
          <TabsTrigger value="inpaint" className="text-xs">Inpaint</TabsTrigger>
          <TabsTrigger value="lighting" className="text-xs">Lighting</TabsTrigger>
        </TabsList>

        {/* Marking Tools */}
        <div className="p-3 border-b border-border bg-editor-toolbar">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Pin className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Wand2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Lasso className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <PenTool className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground ml-auto">Mark areas</span>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          <TabsContent value="instruct" className="p-4 space-y-3 mt-0">
            <div className="space-y-2">
              <Label className="text-xs">1-Click Tools</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-xs">Remove Blemish</Button>
                <Button variant="outline" size="sm" className="text-xs">Add Object</Button>
                <Button variant="outline" size="sm" className="text-xs">Remove Object</Button>
                <Button variant="outline" size="sm" className="text-xs">Change Color</Button>
                <Button variant="outline" size="sm" className="text-xs">Fix/Enhance</Button>
                <Button variant="outline" size="sm" className="text-xs">Restore</Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs">Custom Instruction</Label>
              <Textarea 
                placeholder="Describe what you want to change..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[80px] text-xs"
              />
              <Button className="w-full" size="sm">
                <Sparkles className="w-3 h-3 mr-1" />
                Apply
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="generate" className="p-4 space-y-3 mt-0">
            <div className="space-y-2">
              <Label className="text-xs">Text Prompt</Label>
              <Textarea 
                placeholder="Describe the image you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Reference Layers</Label>
              <Select defaultValue="none">
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="all">All Visible</SelectItem>
                  <SelectItem value="selected">Selected Layer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

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

            <Button className="w-full">
              <Sparkles className="w-3 h-3 mr-1" />
              Generate
            </Button>
          </TabsContent>

          <TabsContent value="enhance" className="p-4 space-y-3 mt-0">
            <div className="space-y-2">
              <Label className="text-xs">Enhancement Options</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-xs">Upscale 2x</Button>
                <Button variant="outline" size="sm" className="text-xs">Upscale 4x</Button>
                <Button variant="outline" size="sm" className="text-xs">Denoise</Button>
                <Button variant="outline" size="sm" className="text-xs">Sharpen</Button>
                <Button variant="outline" size="sm" className="text-xs">Color Enhance</Button>
                <Button variant="outline" size="sm" className="text-xs">Face Enhance</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inpaint" className="p-4 space-y-3 mt-0">
            <div className="space-y-2">
              <Label className="text-xs">Inpaint Instructions</Label>
              <Textarea 
                placeholder="Describe what to paint in the masked area..."
                className="min-h-[80px] text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Use marking tools above to select the area to inpaint
              </p>
            </div>
            <Button className="w-full">
              <Sparkles className="w-3 h-3 mr-1" />
              Inpaint
            </Button>
          </TabsContent>

          <TabsContent value="lighting" className="p-4 space-y-3 mt-0">
            <div className="space-y-2">
              <Label className="text-xs">Lighting Adjustments</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="text-xs">Add Light</Button>
                <Button variant="outline" size="sm" className="text-xs">Remove Shadow</Button>
                <Button variant="outline" size="sm" className="text-xs">Golden Hour</Button>
                <Button variant="outline" size="sm" className="text-xs">Studio Light</Button>
                <Button variant="outline" size="sm" className="text-xs">Dramatic</Button>
                <Button variant="outline" size="sm" className="text-xs">Natural</Button>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
