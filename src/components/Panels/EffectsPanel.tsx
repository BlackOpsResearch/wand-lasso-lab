import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sparkles } from 'lucide-react';

export const EffectsPanel: React.FC = () => {
  const [brightness, setBrightness] = useState([0]);
  const [contrast, setContrast] = useState([0]);
  const [saturation, setSaturation] = useState([0]);
  const [blur, setBlur] = useState([0]);
  const [sharpen, setSharpen] = useState([0]);

  return (
    <div className="w-80 bg-editor-panel border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-editor-accent" />
          Effects
        </h3>
      </div>

      <Tabs defaultValue="adjust" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 rounded-none border-b border-border bg-transparent">
          <TabsTrigger value="adjust" className="text-xs">Adjust</TabsTrigger>
          <TabsTrigger value="filters" className="text-xs">Filters</TabsTrigger>
          <TabsTrigger value="edges" className="text-xs">Edges</TabsTrigger>
        </TabsList>

        {/* Adjustments */}
        <TabsContent value="adjust" className="flex-1 overflow-auto p-4 space-y-4 mt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Brightness</Label>
              <span className="text-xs text-muted-foreground">{brightness[0]}</span>
            </div>
            <Slider
              value={brightness}
              onValueChange={setBrightness}
              min={-100}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Contrast</Label>
              <span className="text-xs text-muted-foreground">{contrast[0]}</span>
            </div>
            <Slider
              value={contrast}
              onValueChange={setContrast}
              min={-100}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Saturation</Label>
              <span className="text-xs text-muted-foreground">{saturation[0]}</span>
            </div>
            <Slider
              value={saturation}
              onValueChange={setSaturation}
              min={-100}
              max={100}
              step={1}
            />
          </div>

          <Button className="w-full" size="sm">
            Apply Adjustments
          </Button>
        </TabsContent>

        {/* Filters */}
        <TabsContent value="filters" className="flex-1 overflow-auto p-4 space-y-4 mt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Blur</Label>
              <span className="text-xs text-muted-foreground">{blur[0]}px</span>
            </div>
            <Slider
              value={blur}
              onValueChange={setBlur}
              min={0}
              max={50}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Sharpen</Label>
              <span className="text-xs text-muted-foreground">{sharpen[0]}</span>
            </div>
            <Slider
              value={sharpen}
              onValueChange={setSharpen}
              min={0}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Quick Filters</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs">Grayscale</Button>
              <Button variant="outline" size="sm" className="text-xs">Sepia</Button>
              <Button variant="outline" size="sm" className="text-xs">Invert</Button>
              <Button variant="outline" size="sm" className="text-xs">Posterize</Button>
            </div>
          </div>

          <Button className="w-full" size="sm">
            Apply Filter
          </Button>
        </TabsContent>

        {/* Edge Effects */}
        <TabsContent value="edges" className="flex-1 overflow-auto p-4 space-y-4 mt-0">
          <div className="space-y-2">
            <Label className="text-xs">Feathering</Label>
            <div className="flex items-center justify-between mb-2">
              <Switch defaultChecked />
              <span className="text-xs text-muted-foreground">Enabled</span>
            </div>
            <Slider defaultValue={[10]} min={0} max={50} step={1} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Anti-aliasing</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="text-xs">Fast</Button>
              <Button variant="outline" size="sm" className="text-xs">Balanced</Button>
              <Button variant="outline" size="sm" className="text-xs">High</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Alpha Matting</Label>
            <Switch />
          </div>

          <Button className="w-full" size="sm">
            Apply Edge Effects
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};
