import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useToolContext } from '../Context/ToolContext';
import { useLayerContext } from '../Context/LayerContext';

interface PenToolProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  overlayRef: React.RefObject<HTMLCanvasElement>;
}

interface Point {
  x: number;
  y: number;
}

export const PenTool: React.FC<PenToolProps> = ({ canvasRef, overlayRef }) => {
  const { toolSettings } = useToolContext();
  const { addLayer } = useLayerContext();
  const [points, setPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize drawing canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    if (!drawingCanvasRef.current) {
      drawingCanvasRef.current = document.createElement('canvas');
    }
    
    const canvas = canvasRef.current;
    drawingCanvasRef.current.width = canvas.width;
    drawingCanvasRef.current.height = canvas.height;
  }, [canvasRef]);

  // Render preview
  const renderPreview = useCallback((currentPoints: Point[]) => {
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    if (!overlay || !canvas || currentPoints.length < 2) return;

    overlay.width = canvas.width;
    overlay.height = canvas.height;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, overlay.width, overlay.height);
    
    // Draw preview line
    ctx.strokeStyle = toolSettings.pen?.color || '#000000';
    ctx.lineWidth = toolSettings.pen?.thickness || 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const style = toolSettings.pen?.style || 'solid';
    if (style === 'dashed') {
      ctx.setLineDash([10, 5]);
    } else if (style === 'dotted') {
      ctx.setLineDash([2, 5]);
    } else {
      ctx.setLineDash([]);
    }

    ctx.beginPath();
    ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
    for (let i = 1; i < currentPoints.length; i++) {
      ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
    }
    ctx.stroke();

    // Draw control points
    ctx.fillStyle = toolSettings.pen?.color || '#000000';
    currentPoints.forEach((point, i) => {
      const radius = i === 0 || i === currentPoints.length - 1 ? 5 : 3;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [overlayRef, canvasRef, toolSettings.pen]);

  // Create layer from drawn line
  const createLineLayer = useCallback((linePoints: Point[]) => {
    if (!drawingCanvasRef.current || linePoints.length < 2) return;

    const ctx = drawingCanvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear and redraw on drawing canvas
    ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
    
    ctx.strokeStyle = toolSettings.pen?.color || '#000000';
    ctx.lineWidth = toolSettings.pen?.thickness || 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const style = toolSettings.pen?.style || 'solid';
    if (style === 'dashed') {
      ctx.setLineDash([10, 5]);
    } else if (style === 'dotted') {
      ctx.setLineDash([2, 5]);
    } else {
      ctx.setLineDash([]);
    }

    ctx.beginPath();
    ctx.moveTo(linePoints[0].x, linePoints[0].y);
    for (let i = 1; i < linePoints.length; i++) {
      ctx.lineTo(linePoints[i].x, linePoints[i].y);
    }
    ctx.stroke();

    // Get image data and create layer
    const imageData = ctx.getImageData(
      0, 
      0, 
      drawingCanvasRef.current.width, 
      drawingCanvasRef.current.height
    );

    addLayer(`Line ${Date.now()}`, imageData);
  }, [toolSettings.pen, addLayer]);

  // Handle mouse events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getMousePos = (e: MouseEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: Math.floor((e.clientX - rect.left) * (canvas.width / rect.width)),
        y: Math.floor((e.clientY - rect.top) * (canvas.height / rect.height)),
      };
    };

    const handleMouseDown = (e: MouseEvent) => {
      const pos = getMousePos(e);
      setIsDrawing(true);
      setPoints([pos]);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing) return;
      const pos = getMousePos(e);
      setPoints(prev => {
        const newPoints = [...prev, pos];
        renderPreview(newPoints);
        return newPoints;
      });
    };

    const handleMouseUp = () => {
      if (isDrawing && points.length >= 2) {
        createLineLayer(points);
      }
      setIsDrawing(false);
      setPoints([]);
      
      // Clear overlay
      const overlay = overlayRef.current;
      if (overlay) {
        const ctx = overlay.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, overlay.width, overlay.height);
        }
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [canvasRef, overlayRef, isDrawing, points, renderPreview, createLineLayer]);

  return null;
};
