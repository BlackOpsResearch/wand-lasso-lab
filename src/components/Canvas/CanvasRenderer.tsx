import React, { useEffect, useRef } from 'react';
import { useImageContext } from '../Context/ImageContext';
import { useToolContext } from '../Context/ToolContext';

interface CanvasRendererProps {
  width: number;
  height: number;
  onSelectionRender?: (canvas: HTMLCanvasElement) => void;
}

export const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  width,
  height,
  onSelectionRender,
}) => {
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const { currentSelection, previewSelection } = useToolContext();

  // Render selection overlay
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    overlay.width = width;
    overlay.height = height;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Render preview selection
    if (previewSelection) {
      ctx.fillStyle = 'rgba(100, 200, 255, 0.2)';
      for (let i = 0; i < previewSelection.length; i++) {
        if (previewSelection[i]) {
          const x = i % width;
          const y = Math.floor(i / width);
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    // Render current selection with marching ants
    if (currentSelection) {
      const time = Date.now() * 0.005;
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = time % 8;

      // Fill selection
      ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
      for (let i = 0; i < currentSelection.pixels.length; i++) {
        if (currentSelection.pixels[i]) {
          const x = i % width;
          const y = Math.floor(i / width);
          ctx.fillRect(x, y, 1, 1);
        }
      }

      // Draw marching ants border
      const bounds = currentSelection.bounds;
      ctx.strokeRect(bounds.x - 0.5, bounds.y - 0.5, bounds.width + 1, bounds.height + 1);
    }

    // Callback for external rendering
    if (onSelectionRender) {
      onSelectionRender(overlay);
    }
  }, [currentSelection, previewSelection, width, height, onSelectionRender]);

  return (
    <canvas
      ref={overlayRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        imageRendering: 'pixelated',
        zIndex: 10
      }}
    />
  );
};