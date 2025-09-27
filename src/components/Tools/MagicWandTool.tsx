import React, { useCallback, useEffect, useState } from 'react';
import { useToolContext } from '../Context/ToolContext';
import { MagicWandSegmentation } from './SegmentationAlgorithms';

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
  const { 
    toolSettings, 
    setCurrentSelection, 
    previewSelection, 
    setPreviewSelection 
  } = useToolContext();
  
  const [isHovering, setIsHovering] = useState(false);

  // Preview on hover
  const showPreview = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const selection = MagicWandSegmentation.floodFill(
        imageData,
        x,
        y,
        {
          tolerance: toolSettings.magicWand.tolerance,
          contiguous: toolSettings.magicWand.contiguous,
          colorSpace: toolSettings.magicWand.colorSpace,
          connectivity: toolSettings.magicWand.connectivity,
          antiAlias: toolSettings.magicWand.antiAlias,
        }
      );
      
      setPreviewSelection(selection);
    } catch (error) {
      console.error('Preview error:', error);
    }
  }, [canvasRef, toolSettings.magicWand, setPreviewSelection]);

  // Render selection overlay
  const renderSelection = useCallback((selection: boolean[], isPreview = false) => {
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    if (!overlay || !canvas) return;
    
    overlay.width = canvas.width;
    overlay.height = canvas.height;
    const overlayCtx = overlay.getContext('2d');
    if (!overlayCtx) return;

    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
    
    // Create selection visualization
    const alpha = isPreview ? 0.2 : 0.4;
    overlayCtx.fillStyle = `rgba(100, 200, 255, ${alpha})`;
    
    // Draw marching ants pattern
    const time = Date.now() * 0.01;
    overlayCtx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
    overlayCtx.lineWidth = 1;
    overlayCtx.setLineDash([4, 4]);
    overlayCtx.lineDashOffset = time % 8;

    // Find and draw selection bounds
    const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    const selectedPixels: Array<{x: number, y: number}> = [];
    
    for (let i = 0; i < selection.length; i++) {
      if (selection[i]) {
        const x = i % canvas.width;
        const y = Math.floor(i / canvas.width);
        selectedPixels.push({x, y});
        bounds.minX = Math.min(bounds.minX, x);
        bounds.minY = Math.min(bounds.minY, y);
        bounds.maxX = Math.max(bounds.maxX, x);
        bounds.maxY = Math.max(bounds.maxY, y);
      }
    }

    // Fill selected pixels
    for (const pixel of selectedPixels) {
      overlayCtx.fillRect(pixel.x, pixel.y, 1, 1);
    }

    // Draw marching ants border
    if (bounds.minX < Infinity) {
      overlayCtx.strokeRect(bounds.minX - 0.5, bounds.minY - 0.5, 
                           bounds.maxX - bounds.minX + 1, 
                           bounds.maxY - bounds.minY + 1);
    }
  }, [overlayRef, canvasRef]);

  // Handle mouse events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
      const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
      
      if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
        setIsHovering(true);
        // Throttle preview updates
        const throttleId = setTimeout(() => showPreview(x, y), 50);
        return () => clearTimeout(throttleId);
      } else {
        setIsHovering(false);
        setPreviewSelection(null);
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      setPreviewSelection(null);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
      const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const selection = MagicWandSegmentation.floodFill(
          imageData,
          x,
          y,
          {
            tolerance: toolSettings.magicWand.tolerance,
            contiguous: toolSettings.magicWand.contiguous,
            colorSpace: toolSettings.magicWand.colorSpace,
            connectivity: toolSettings.magicWand.connectivity,
            antiAlias: toolSettings.magicWand.antiAlias,
          }
        );

        // Calculate bounds
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (let i = 0; i < selection.length; i++) {
          if (selection[i]) {
            const px = i % canvas.width;
            const py = Math.floor(i / canvas.width);
            minX = Math.min(minX, px);
            minY = Math.min(minY, py);
            maxX = Math.max(maxX, px);
            maxY = Math.max(maxY, py);
          }
        }

        const newSelection = {
          id: crypto.randomUUID(),
          pixels: selection,
          bounds: {
            x: minX === Infinity ? 0 : minX,
            y: minY === Infinity ? 0 : minY,
            width: maxX === -Infinity ? 0 : maxX - minX + 1,
            height: maxY === -Infinity ? 0 : maxY - minY + 1,
          },
          timestamp: Date.now(),
        };
        
        setCurrentSelection(newSelection);
        setPreviewSelection(null);
        
        console.log(`Magic Wand: Selected ${selection.filter(Boolean).length} pixels`);
      } catch (error) {
        console.error('Magic Wand error:', error);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
    };
  }, [canvasRef, toolSettings.magicWand, showPreview, setCurrentSelection, setPreviewSelection]);

  // Render current selection or preview
  useEffect(() => {
    if (previewSelection) {
      renderSelection(previewSelection, true);
    }
  }, [previewSelection, renderSelection]);

  return null;
};