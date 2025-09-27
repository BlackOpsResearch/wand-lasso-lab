import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useImageContext } from '../Context/ImageContext';
import { useToolContext } from '../Context/ToolContext';
import { MagicWandTool } from '../Tools/MagicWandTool';
import { MagicLassoTool } from '../Tools/MagicLassoTool';

export const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const { currentImage } = useImageContext();
  const { activeTool, isDrawing } = useToolContext();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

    if (activeTool === 'magicWand') {
      // Magic Wand tool logic will be handled by MagicWandTool component
    }
  }, [activeTool, currentImage]);

  const getCursorStyle = () => {
    switch (activeTool) {
      case 'magicWand':
        return 'crosshair';
      case 'magicLasso':
        return 'crosshair';
      case 'eyedropper':
        return 'crosshair';
      case 'zoom':
        return 'zoom-in';
      default:
        return 'default';
    }
  };

  return (
    <div className="canvas-container relative overflow-auto rounded-lg p-4">
      <div className="relative inline-block">
        {/* Main Canvas */}
        <canvas
          ref={canvasRef}
          className="border border-canvas-border shadow-canvas max-w-full max-h-full"
          style={{ cursor: getCursorStyle() }}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        />
        
        {/* Overlay Canvas for tool previews */}
        <canvas
          ref={overlayRef}
          className="absolute top-0 left-0 pointer-events-none"
          style={{ zIndex: 10 }}
        />

        {/* Tool-specific overlays */}
        {activeTool === 'magicWand' && (
          <MagicWandTool 
            canvasRef={canvasRef}
            overlayRef={overlayRef}
            mousePos={mousePos}
          />
        )}
        
        {activeTool === 'magicLasso' && (
          <MagicLassoTool 
            canvasRef={canvasRef}
            overlayRef={overlayRef}
            mousePos={mousePos}
          />
        )}
      </div>

      {/* Canvas Info */}
      {currentImage && (
        <div className="absolute top-2 right-2 bg-editor-panel text-foreground px-2 py-1 rounded text-sm">
          {currentImage.width} × {currentImage.height} | {mousePos.x}, {mousePos.y}
        </div>
      )}
    </div>
  );
};