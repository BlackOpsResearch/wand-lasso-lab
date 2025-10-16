import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, Focus, Settings } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MagnifierPanelProps {
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  cursorPos?: { x: number; y: number };
}

export const MagnifierPanel: React.FC<MagnifierPanelProps> = ({ canvasRef, cursorPos }) => {
  const [magnification, setMagnification] = useState(300);
  const [bufferZone, setBufferZone] = useState(30); // percentage of panel size
  const [showSettings, setShowSettings] = useState(false);
  const viewerRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewPosition, setViewPosition] = useState({ x: 0, y: 0 });
  const [lastCursorPos, setLastCursorPos] = useState({ x: 0, y: 0 });

  // Buffered follow mechanism
  useEffect(() => {
    if (!cursorPos || !containerRef.current || !viewerRef.current) return;

    const container = containerRef.current;
    const viewWidth = container.clientWidth;
    const viewHeight = container.clientHeight;

    // Calculate buffer zone in pixels
    const bufferX = (viewWidth * bufferZone) / 100;
    const bufferY = (viewHeight * bufferZone) / 100;

    // Calculate cursor position relative to view
    const relativeX = cursorPos.x - viewPosition.x;
    const relativeY = cursorPos.y - viewPosition.y;

    // Check if cursor is in buffer zone
    let newViewX = viewPosition.x;
    let newViewY = viewPosition.y;

    // Left buffer
    if (relativeX < bufferX) {
      newViewX = cursorPos.x - bufferX;
    }
    // Right buffer
    else if (relativeX > viewWidth - bufferX) {
      newViewX = cursorPos.x - (viewWidth - bufferX);
    }

    // Top buffer
    if (relativeY < bufferY) {
      newViewY = cursorPos.y - bufferY;
    }
    // Bottom buffer
    else if (relativeY > viewHeight - bufferY) {
      newViewY = cursorPos.y - (viewHeight - bufferY);
    }

    if (newViewX !== viewPosition.x || newViewY !== viewPosition.y) {
      setViewPosition({ x: newViewX, y: newViewY });
    }

    setLastCursorPos(cursorPos);
  }, [cursorPos, viewPosition, bufferZone]);

  // Render magnified view
  useEffect(() => {
    if (!canvasRef?.current || !viewerRef.current || !containerRef.current) return;

    const sourceCanvas = canvasRef.current;
    const viewCanvas = viewerRef.current;
    const ctx = viewCanvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const container = containerRef.current;
    viewCanvas.width = container.clientWidth;
    viewCanvas.height = container.clientHeight;

    // Disable smoothing for crisp pixels
    ctx.imageSmoothingEnabled = false;

    // Calculate source area
    const sourceWidth = viewCanvas.width / (magnification / 100);
    const sourceHeight = viewCanvas.height / (magnification / 100);
    const sourceX = viewPosition.x - sourceWidth / 2;
    const sourceY = viewPosition.y - sourceHeight / 2;

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

    // Draw crosshair at center
    const centerX = viewCanvas.width / 2;
    const centerY = viewCanvas.height / 2;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(viewCanvas.width, centerY);
    ctx.stroke();
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, viewCanvas.height);
    ctx.stroke();

  }, [canvasRef, viewPosition, magnification]);

  // Handle scroll zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -25 : 25;
    setMagnification(prev => Math.max(100, Math.min(800, prev + delta)));
  };

  return (
    <div className="w-full h-full bg-editor-panel border-l border-border flex flex-col">
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
        
        {/* Buffer zone indicator */}
        <div 
          className="absolute border-2 border-dashed border-primary/20 pointer-events-none"
          style={{
            top: `${bufferZone}%`,
            left: `${bufferZone}%`,
            right: `${bufferZone}%`,
            bottom: `${bufferZone}%`,
          }}
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
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-editor-panel/80 rounded text-xs font-mono">
          {magnification}%
        </div>
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
                onClick={() => setMagnification(prev => Math.max(100, prev - 50))}
              >
                <ZoomOut className="w-3 h-3" />
              </Button>
              <Slider
                value={[magnification]}
                onValueChange={([val]) => setMagnification(val)}
                min={100}
                max={800}
                step={25}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                className="w-7 h-7"
                onClick={() => setMagnification(prev => Math.min(800, prev + 50))}
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Buffer Zone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Buffer Zone</Label>
              <span className="text-xs text-muted-foreground">{bufferZone}%</span>
            </div>
            <Slider
              value={[bufferZone]}
              onValueChange={([val]) => setBufferZone(val)}
              min={10}
              max={50}
              step={5}
              className="w-full"
            />
            <p className="text-[10px] text-muted-foreground">
              View follows cursor when it enters buffer zone
            </p>
          </div>

          <p className="text-[10px] text-muted-foreground italic">
            Scroll on view to adjust zoom
          </p>
        </div>
      )}
    </div>
  );
};
