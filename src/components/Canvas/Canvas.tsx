import React, { useRef, useEffect, useState, useCallback, forwardRef } from 'react';
import { useImageContext } from '../Context/ImageContext';
import { useToolContext } from '../Context/ToolContext';
import { MagicWandTool } from '../Tools/MagicWandTool';
import { MagicLassoAdvanced } from '../Tools/MagicLassoAdvanced';
import { PenTool } from '../Tools/PenTool';
import { CanvasRenderer } from './CanvasRenderer';

export const Canvas = forwardRef<HTMLCanvasElement>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Merge refs
  React.useImperativeHandle(ref, () => canvasRef.current!);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const { currentImage, loadDefaultImage } = useImageContext();
  const { activeTool, currentSelection } = useToolContext();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Load default image on mount if no image is loaded
  useEffect(() => {
    if (!currentImage) {
      loadDefaultImage();
    }
  }, [currentImage, loadDefaultImage]);

  // Initialize canvas with image
  useEffect(() => {
    if (!currentImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = currentImage.width;
    canvas.height = currentImage.height;
    ctx.putImageData(currentImage.data, 0, 0);
  }, [currentImage]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    
    setMousePos({ x, y });
  }, []);

  const getCursorStyle = () => {
    switch (activeTool) {
      case 'magicWand':
        return 'crosshair';
      case 'magicLasso':
        return 'crosshair';
      case 'pen':
        return 'crosshair';
      case 'eyedropper':
        return 'crosshair';
      case 'zoom':
        return 'zoom-in';
      default:
        return 'default';
    }
  };

  if (!currentImage) {
    return (
      <div className="canvas-container relative overflow-auto rounded-lg p-4 flex items-center justify-center min-h-96">
        <div className="text-center text-muted-foreground">
          <div className="text-lg mb-2">Loading test image...</div>
          <div className="text-sm">Click on Magic Wand or Lasso tools to start segmenting</div>
        </div>
      </div>
    );
  }

  return (
    <div className="canvas-container relative overflow-auto rounded-lg p-4">
      <div className="relative inline-block">
        <canvas
          ref={canvasRef}
          className="border border-canvas-border shadow-canvas max-w-full max-h-full block"
          style={{ cursor: getCursorStyle() }}
          onMouseMove={handleMouseMove}
        />
        
        <canvas
          ref={overlayRef}
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
        
        <CanvasRenderer
          width={currentImage.width}
          height={currentImage.height}
        />

        {activeTool === 'magicWand' && (
          <MagicWandTool 
            canvasRef={canvasRef}
            overlayRef={overlayRef}
            mousePos={mousePos}
          />
        )}
        
        {activeTool === 'magicLasso' && (
          <MagicLassoAdvanced 
            canvasRef={canvasRef}
            overlayRef={overlayRef}
          />
        )}
        
        {activeTool === 'pen' && (
          <PenTool 
            canvasRef={canvasRef}
            overlayRef={overlayRef}
          />
        )}
      </div>

      <div className="absolute top-2 right-2 bg-editor-panel text-foreground px-3 py-1 rounded text-sm border border-border">
        <div>{currentImage.width} × {currentImage.height}</div>
        <div>Mouse: {mousePos.x}, {mousePos.y}</div>
        {currentSelection && (
          <div className="text-xs text-editor-accent">
            Selected: {currentSelection.pixels.filter(Boolean).length} pixels
          </div>
        )}
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';
