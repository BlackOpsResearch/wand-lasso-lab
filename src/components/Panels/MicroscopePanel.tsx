import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, Settings, Microscope } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MicroscopePanelProps {
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  cursorPos?: { x: number; y: number };
}

export const MicroscopePanel: React.FC<MicroscopePanelProps> = ({ canvasRef, cursorPos }) => {
  const [magnification, setMagnification] = useState(800); // High zoom for pixel work
  const [showPixelGrid, setShowPixelGrid] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const viewerRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Render microscope view - follows cursor exactly
  useEffect(() => {
    if (!canvasRef?.current || !viewerRef.current || !containerRef.current || !cursorPos) return;

    const sourceCanvas = canvasRef.current;
    const viewCanvas = viewerRef.current;
    const ctx = viewCanvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const container = containerRef.current;
    viewCanvas.width = container.clientWidth;
    viewCanvas.height = container.clientHeight;

    // Disable smoothing for pixel-perfect view
    ctx.imageSmoothingEnabled = false;

    // Calculate source area centered on cursor
    const sourceWidth = viewCanvas.width / (magnification / 100);
    const sourceHeight = viewCanvas.height / (magnification / 100);
    const sourceX = cursorPos.x - sourceWidth / 2;
    const sourceY = cursorPos.y - sourceHeight / 2;

    // Clear and draw magnified view
    ctx.clearRect(0, 0, viewCanvas.width, viewCanvas.height);
    
    try {
      ctx.drawImage(
        sourceCanvas,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, viewCanvas.width, viewCanvas.height
      );
    } catch (e) {
      // Handle out of bounds gracefully
    }

    // Draw pixel grid if zoom is high enough
    if (showPixelGrid && magnification >= 400) {
      const pixelSize = magnification / 100;
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x < viewCanvas.width; x += pixelSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, viewCanvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < viewCanvas.height; y += pixelSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(viewCanvas.width, y);
        ctx.stroke();
      }
    }

    // Draw center crosshair
    const centerX = viewCanvas.width / 2;
    const centerY = viewCanvas.height / 2;
    
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
    ctx.lineWidth = 2;
    
    // Horizontal crosshair
    ctx.beginPath();
    ctx.moveTo(centerX - 20, centerY);
    ctx.lineTo(centerX + 20, centerY);
    ctx.stroke();
    
    // Vertical crosshair
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 20);
    ctx.lineTo(centerX, centerY + 20);
    ctx.stroke();

    // Draw center dot
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();

  }, [canvasRef, cursorPos, magnification, showPixelGrid]);

  // Handle scroll zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -50 : 50;
    setMagnification(prev => Math.max(200, Math.min(2000, prev + delta)));
  };

  return (
    <div className="w-full h-full bg-editor-panel border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Microscope className="w-4 h-4 text-editor-accent" />
          <h3 className="text-xs font-semibold">Microscope</h3>
        </div>
        <span className="text-xs text-muted-foreground">Pixel-level view</span>
      </div>

      {/* Full-size view */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-muted/20"
        onWheel={handleWheel}
      >
        <canvas
          ref={viewerRef}
          className="w-full h-full"
        />

        {/* Settings button overlay */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-2 right-2 w-8 h-8 bg-editor-panel/80 hover:bg-editor-panel",
            showSettings && "bg-primary/20"
          )}
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-4 h-4" />
        </Button>

        {/* Magnification indicator */}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-editor-panel/80 rounded text-xs font-mono flex items-center gap-2">
          <span>{magnification}%</span>
          {showPixelGrid && magnification >= 400 && (
            <span className="text-[10px] text-primary">GRID</span>
          )}
        </div>

        {/* Pixel info */}
        {cursorPos && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-editor-panel/80 rounded text-[10px] font-mono">
            x:{Math.floor(cursorPos.x)} y:{Math.floor(cursorPos.y)}
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-t border-border p-3 space-y-3 bg-editor-toolbar">
          {/* Magnification */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Zoom Level</Label>
              <span className="text-xs text-muted-foreground">{magnification}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="w-7 h-7"
                onClick={() => setMagnification(prev => Math.max(200, prev - 100))}
              >
                <ZoomOut className="w-3 h-3" />
              </Button>
              <Slider
                value={[magnification]}
                onValueChange={([val]) => setMagnification(val)}
                min={200}
                max={2000}
                step={100}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                className="w-7 h-7"
                onClick={() => setMagnification(prev => Math.min(2000, prev + 100))}
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Pixel Grid Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-xs">Pixel Grid</Label>
            <Button
              variant={showPixelGrid ? "default" : "outline"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setShowPixelGrid(!showPixelGrid)}
            >
              {showPixelGrid ? "ON" : "OFF"}
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground">
            Grid shows at 400%+ zoom. Scroll on view to adjust zoom.
          </p>
        </div>
      )}
    </div>
  );
};
