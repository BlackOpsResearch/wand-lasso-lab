import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, Maximize2, Focus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const MagnifierPanel: React.FC = () => {
  const [magnification, setMagnification] = useState([200]);
  const [canvasZoom, setCanvasZoom] = useState([100]);
  const [preset, setPreset] = useState('100');
  const [safeZoneSize, setSafeZoneSize] = useState([50]);
  const magnifierRef = useRef<HTMLDivElement>(null);

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
      setCanvasZoom([parseInt(value)]);
    }
  };

  return (
    <div className="w-80 bg-editor-panel border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Focus className="w-4 h-4 text-editor-accent" />
          Cursor Zoom
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Magnified live view around cursor
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Live Magnifier View - Fills available space */}
        <div className="space-y-2 flex-1">
          <Label className="text-xs font-medium">Live Magnifier View</Label>
          <div 
            ref={magnifierRef}
            className="w-full bg-muted/50 rounded border-2 border-border flex items-center justify-center relative overflow-hidden"
            style={{ 
              minHeight: '300px',
              height: 'calc(100vh - 600px)',
              maxHeight: '500px'
            }}
          >
            {/* Crosshair overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-0 w-full h-px bg-primary/30" />
              <div className="absolute left-1/2 top-0 w-px h-full bg-primary/30" />
            </div>
            
            {/* Safe zone indicator */}
            <div 
              className="absolute border-2 border-dashed border-accent/40 rounded"
              style={{
                top: `${50 - safeZoneSize[0]/4}%`,
                left: `${50 - safeZoneSize[0]/4}%`,
                width: `${safeZoneSize[0]/2}%`,
                height: `${safeZoneSize[0]/2}%`
              }}
            />
            
            <div className="text-center space-y-1">
              <span className="text-xs text-muted-foreground block">
                Magnified Preview
              </span>
              <span className="text-[10px] text-muted-foreground/60 block">
                {magnification[0]}% magnification
              </span>
            </div>
          </div>
        </div>

        {/* Magnification Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Magnification</Label>
            <span className="text-xs text-muted-foreground">{magnification[0]}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="w-7 h-7 shrink-0"
              onClick={() => setMagnification([Math.max(100, magnification[0] - 50)])}
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <Slider
              value={magnification}
              onValueChange={setMagnification}
              min={100}
              max={800}
              step={50}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              className="w-7 h-7 shrink-0"
              onClick={() => setMagnification([Math.min(800, magnification[0] + 50)])}
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Buffered Follow Safe Zone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Safe Zone Size</Label>
            <span className="text-xs text-muted-foreground">{safeZoneSize[0]}%</span>
          </div>
          <Slider
            value={safeZoneSize}
            onValueChange={setSafeZoneSize}
            min={20}
            max={80}
            step={5}
            className="w-full"
          />
          <p className="text-[10px] text-muted-foreground">
            View stays stable while cursor remains in zone
          </p>
        </div>

        {/* Canvas Zoom Level */}
        <div className="space-y-2 pt-4 border-t border-border">
          <Label className="text-xs font-medium">Canvas Zoom Level</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="w-7 h-7 shrink-0"
              onClick={() => setCanvasZoom([Math.max(25, canvasZoom[0] - 25)])}
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <Slider
              value={canvasZoom}
              onValueChange={setCanvasZoom}
              min={25}
              max={800}
              step={25}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              className="w-7 h-7 shrink-0"
              onClick={() => setCanvasZoom([Math.min(800, canvasZoom[0] + 25)])}
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
          </div>
          <div className="text-center text-xs text-muted-foreground">{canvasZoom[0]}%</div>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <Label className="text-xs">Quick Presets</Label>
          <Select value={preset} onValueChange={handlePresetChange}>
            <SelectTrigger className="text-xs h-8">
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
            <Button variant="outline" size="sm" className="text-xs h-7">
              <Maximize2 className="w-3 h-3 mr-1" />
              Fit Width
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7">
              <Maximize2 className="w-3 h-3 mr-1" />
              Fit Height
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
