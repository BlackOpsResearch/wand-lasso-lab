import React, { useCallback, useEffect } from 'react';
import { useToolContext } from '../Context/ToolContext';

interface MagicWandToolProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  overlayRef: React.RefObject<HTMLCanvasElement>;
  mousePos: { x: number; y: number };
}

export const MagicWandTool: React.FC<MagicWandToolProps> = ({
  canvasRef,
  overlayRef,
  mousePos,
}) => {
  const { toolSettings } = useToolContext();

  const magicWandFloodFill = useCallback((
    imageData: ImageData,
    startX: number,
    startY: number,
    tolerance: number,
    contiguous: boolean
  ) => {
    const { data, width, height } = imageData;
    const visited = new Array(width * height).fill(false);
    const result = new Array(width * height).fill(false);
    
    const getPixelIndex = (x: number, y: number) => (y * width + x) * 4;
    const getPixelColor = (x: number, y: number) => {
      const idx = getPixelIndex(x, y);
      return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
    };

    const colorDistance = (c1: number[], c2: number[]) => {
      return Math.sqrt(
        Math.pow(c1[0] - c2[0], 2) +
        Math.pow(c1[1] - c2[1], 2) +
        Math.pow(c1[2] - c2[2], 2)
      );
    };

    const targetColor = getPixelColor(startX, startY);
    const stack = [[startX, startY]];

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      
      const pixelIndex = y * width + x;
      if (visited[pixelIndex]) continue;
      
      const currentColor = getPixelColor(x, y);
      const distance = colorDistance(currentColor, targetColor);
      
      if (distance <= tolerance) {
        visited[pixelIndex] = true;
        result[pixelIndex] = true;
        
        if (contiguous) {
          // Add neighbors for contiguous selection
          stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
      }
    }

    // For non-contiguous, select all similar colors
    if (!contiguous) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const pixelIndex = y * width + x;
          if (!visited[pixelIndex]) {
            const currentColor = getPixelColor(x, y);
            const distance = colorDistance(currentColor, targetColor);
            if (distance <= tolerance) {
              result[pixelIndex] = true;
            }
          }
        }
      }
    }

    return result;
  }, []);

  // Handle click events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
      const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const selection = magicWandFloodFill(
        imageData,
        x,
        y,
        toolSettings.magicWand.tolerance,
        toolSettings.magicWand.contiguous
      );

      // Visualize selection on overlay
      const overlay = overlayRef.current;
      if (!overlay) return;
      
      overlay.width = canvas.width;
      overlay.height = canvas.height;
      const overlayCtx = overlay.getContext('2d');
      if (!overlayCtx) return;

      overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
      overlayCtx.fillStyle = 'rgba(100, 200, 255, 0.3)';
      overlayCtx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
      overlayCtx.lineWidth = 1;

      // Draw marching ants effect
      for (let i = 0; i < selection.length; i++) {
        if (selection[i]) {
          const x = i % canvas.width;
          const y = Math.floor(i / canvas.width);
          overlayCtx.fillRect(x, y, 1, 1);
        }
      }
    };

    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [canvasRef, overlayRef, magicWandFloodFill, toolSettings.magicWand]);

  return null; // This component doesn't render UI directly
};