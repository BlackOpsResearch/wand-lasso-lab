import React from 'react';
import { useLayerContext } from '@/components/Context/LayerContext';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export const InspectorPanel: React.FC = () => {
  const { layers, activeLayerId, updateLayer } = useLayerContext();
  const activeLayer = layers.find(l => l.id === activeLayerId);

  if (!activeLayer) {
    return (
      <div className="w-80 bg-editor-panel border-l border-border flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold">Inspector</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-muted-foreground text-center">
            Select a layer to see its properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-editor-panel border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold">Inspector</h3>
        <p className="text-xs text-muted-foreground mt-1">{activeLayer.name}</p>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Layer Name */}
        <div className="space-y-2">
          <Label className="text-xs">Layer Name</Label>
          <Input
            value={activeLayer.name}
            onChange={(e) => updateLayer(activeLayer.id, { name: e.target.value })}
            className="text-xs"
          />
        </div>

        {/* Opacity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Opacity</Label>
            <span className="text-xs text-muted-foreground">{activeLayer.opacity}%</span>
          </div>
          <Slider
            value={[activeLayer.opacity]}
            onValueChange={([val]) => updateLayer(activeLayer.id, { opacity: val })}
            min={0}
            max={100}
            step={1}
          />
        </div>

        {/* Blend Mode */}
        <div className="space-y-2">
          <Label className="text-xs">Blend Mode</Label>
          <Select
            value={activeLayer.blendMode}
            onValueChange={(val) => updateLayer(activeLayer.id, { blendMode: val as any })}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal" className="text-xs">Normal</SelectItem>
              <SelectItem value="multiply" className="text-xs">Multiply</SelectItem>
              <SelectItem value="screen" className="text-xs">Screen</SelectItem>
              <SelectItem value="overlay" className="text-xs">Overlay</SelectItem>
              <SelectItem value="darken" className="text-xs">Darken</SelectItem>
              <SelectItem value="lighten" className="text-xs">Lighten</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dimensions */}
        {activeLayer.data && (
          <div className="space-y-2">
            <Label className="text-xs">Dimensions</Label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Width:</span>
                <span className="ml-2">{activeLayer.data.width}px</span>
              </div>
              <div>
                <span className="text-muted-foreground">Height:</span>
                <span className="ml-2">{activeLayer.data.height}px</span>
              </div>
            </div>
          </div>
        )}

        {/* Position */}
        <div className="space-y-2">
          <Label className="text-xs">Position</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">X</Label>
              <Input type="number" defaultValue={0} className="text-xs mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Y</Label>
              <Input type="number" defaultValue={0} className="text-xs mt-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
