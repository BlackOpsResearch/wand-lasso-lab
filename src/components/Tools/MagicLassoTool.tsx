import React, { useCallback, useEffect, useState } from 'react';
import { useToolContext } from '../Context/ToolContext';

interface MagicLassoToolProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  overlayRef: React.RefObject<HTMLCanvasElement>;
  mousePos: { x: number; y: number };
}

export const MagicLassoTool: React.FC<MagicLassoToolProps> = ({
  canvasRef,
  overlayRef,
  mousePos,
}) => {
  const { toolSettings, isDrawing, setIsDrawing } = useToolContext();
  const [pathPoints, setPathPoints] = useState<{ x: number; y: number }[]>([]);
  const [lastNodeTime, setLastNodeTime] = useState(0);

  const calculateEdgeCost = useCallback((x1: number, y1: number, x2: number, y2: number, imageData: ImageData) => {
    const { data, width } = imageData;
    
    // Simple Sobel edge detection
    const getPixelIndex = (x: number, y: number) => (y * width + x) * 4;
    
    if (x2 < 0 || x2 >= width || y2 < 0 || y2 >= imageData.height) {
      return Infinity;
    }

    const idx1 = getPixelIndex(x1, y1);
    const idx2 = getPixelIndex(x2, y2);
    
    const gray1 = (data[idx1] + data[idx1 + 1] + data[idx1 + 2]) / 3;
    const gray2 = (data[idx2] + data[idx2 + 1] + data[idx2 + 2]) / 3;
    
    const edgeStrength = Math.abs(gray1 - gray2);
    return 255 - edgeStrength; // Lower cost for stronger edges
  }, []);

  const findOptimalPath = useCallback((
    start: { x: number; y: number },
    end: { x: number; y: number },
    imageData: ImageData
  ) => {
    // Simplified Live-Wire pathfinding using A*
    const { width, height } = imageData;
    const costs = new Map<string, number>();
    const previous = new Map<string, { x: number; y: number }>();
    const queue: { x: number; y: number; cost: number }[] = [];
    
    const getKey = (x: number, y: number) => `${x},${y}`;
    const heuristic = (x: number, y: number) => 
      Math.abs(x - end.x) + Math.abs(y - end.y);

    queue.push({ x: start.x, y: start.y, cost: 0 });
    costs.set(getKey(start.x, start.y), 0);

    while (queue.length > 0) {
      queue.sort((a, b) => (a.cost + heuristic(a.x, a.y)) - (b.cost + heuristic(b.x, b.y)));
      const current = queue.shift()!;
      
      if (current.x === end.x && current.y === end.y) {
        // Reconstruct path
        const path: { x: number; y: number }[] = [];
        let node = end;
        while (previous.has(getKey(node.x, node.y))) {
          path.unshift(node);
          node = previous.get(getKey(node.x, node.y))!;
        }
        path.unshift(start);
        return path;
      }

      // Check neighbors (8-connectivity)
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          
          const nx = current.x + dx;
          const ny = current.y + dy;
          
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          
          const edgeCost = calculateEdgeCost(current.x, current.y, nx, ny, imageData);
          const newCost = current.cost + edgeCost;
          const key = getKey(nx, ny);
          
          if (!costs.has(key) || newCost < costs.get(key)!) {
            costs.set(key, newCost);
            previous.set(key, { x: current.x, y: current.y });
            queue.push({ x: nx, y: ny, cost: newCost });
          }
        }
      }
    }

    return [start, end]; // Fallback to straight line
  }, [calculateEdgeCost]);

  const updateOverlay = useCallback(() => {
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    if (!overlay || !canvas || pathPoints.length === 0) return;

    overlay.width = canvas.width;
    overlay.height = canvas.height;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, overlay.width, overlay.height);
    
    // Draw the lasso path
    ctx.strokeStyle = 'rgba(255, 100, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    if (pathPoints.length > 0) {
      ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
      for (let i = 1; i < pathPoints.length; i++) {
        ctx.lineTo(pathPoints[i].x, pathPoints[i].y);
      }
    }
    ctx.stroke();

    // Draw nodes
    ctx.fillStyle = 'rgba(255, 100, 255, 1)';
    pathPoints.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [overlayRef, canvasRef, pathPoints]);

  // Handle mouse events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
      const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

      setIsDrawing(true);
      setPathPoints([{ x, y }]);
      setLastNodeTime(Date.now());
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing) return;

      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
      const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

      const currentTime = Date.now();
      if (currentTime - lastNodeTime >= toolSettings.magicLasso.nodeDropTime) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const lastPoint = pathPoints[pathPoints.length - 1];
        
        if (lastPoint) {
          const optimalPath = findOptimalPath(lastPoint, { x, y }, imageData);
          setPathPoints(prev => [...prev, ...optimalPath.slice(1)]);
          setLastNodeTime(currentTime);
        }
      }
    };

    const handleMouseUp = () => {
      if (isDrawing && pathPoints.length > 2) {
        // Close the path for selection
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const lastPoint = pathPoints[pathPoints.length - 1];
          const firstPoint = pathPoints[0];
          
          const closingPath = findOptimalPath(lastPoint, firstPoint, imageData);
          setPathPoints(prev => [...prev, ...closingPath.slice(1)]);
        }
      }
      setIsDrawing(false);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [canvasRef, isDrawing, pathPoints, lastNodeTime, toolSettings.magicLasso, setIsDrawing, findOptimalPath]);

  // Update overlay when path changes
  useEffect(() => {
    updateOverlay();
  }, [updateOverlay]);

  return null; // This component doesn't render UI directly
};