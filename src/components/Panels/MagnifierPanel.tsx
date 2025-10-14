import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const MagnifierPanel: React.FC = () => {
  const [zoom, setZoom] = useState([100]);
  const [preset, setPreset] = useState('100');

  const zoomPresets = [
    { value: '25', label: '25%' },
    { value: '50', label: '50%' },
    { value: '100', label: '100%' },
    { value: '200', label: '200%' },
    { value: '400', label: '400%' },
    { value: '800', label: '800%' },
    { value: 'fit', label: 'Fit Screen' },
    { value: 'fill', label: 'Fill Screen' },
  ];

  const handlePresetChange = (value: string) => {
    setPreset(value);
    if (value !== 'fit' && value !== 'fill') {
      setZoom([parseInt(value)]);
    }
  };

  return (
    <div className="w-80 bg-editor-panel border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <ZoomIn className="w-4 h-4 text-editor-accent" />
          Magnifier & Zoom
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Zoom Level */}
        <div className="space-y-2">
          <Label className="text-xs">Zoom Level</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8"
              onClick={() => setZoom([Math.max(25, zoom[0] - 25)])}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Slider
              value={zoom}
              onValueChange={setZoom}
              min={25}
              max={800}
              step={25}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8"
              onClick={() => setZoom([Math.min(800, zoom[0] + 25)])}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-center text-sm text-muted-foreground">{zoom[0]}%</div>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <Label className="text-xs">Quick Presets</Label>
          <Select value={preset} onValueChange={handlePresetChange}>
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {zoomPresets.map((p) => (
                <SelectItem key={p.value} value={p.value} className="text-xs">
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Options */}
        <div className="space-y-2">
          <Label className="text-xs">View Mode</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Maximize2 className="w-3 h-3 mr-1" />
              Fit Width
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Maximize2 className="w-3 h-3 mr-1" />
              Fit Height
            </Button>
          </div>
        </div>

        {/* Magnifier Window */}
        <div className="space-y-2">
          <Label className="text-xs">Magnifier Window</Label>
          <div className="aspect-square bg-muted rounded border border-border flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Magnifier Preview</span>
          </div>
          <Slider
            defaultValue={[200]}
            min={100}
            max={400}
            step={25}
            className="mt-2"
          />
          <div className="text-xs text-muted-foreground text-center">Window Size</div>
        </div>
      </div>
    </div>
  );
};
