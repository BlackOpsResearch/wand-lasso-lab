import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useToolContext } from '../Context/ToolContext';

interface MagicLassoAdvancedProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  overlayRef: React.RefObject<HTMLCanvasElement>;
  mousePos: { x: number; y: number };
}

interface Point {
  x: number;
  y: number;
}

interface Node extends Point {
  timestamp: number;
  features?: {
    dominantAngle: number;
    edgeStrength: number;
    localVariance: number;
  };
}

interface Trajectory {
  dx: number;
  dy: number;
  angle: number;
  velocity: number;
}

export const MagicLassoAdvanced: React.FC<MagicLassoAdvancedProps> = ({
  canvasRef,
  overlayRef,
  mousePos,
}) => {
  const { toolSettings, isDrawing, setIsDrawing } = useToolContext();
  const [path, setPath] = useState<Point[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [trajectory, setTrajectory] = useState<Trajectory>({ dx: 0, dy: 0, angle: 0, velocity: 0 });
  const [hoverMask, setHoverMask] = useState<boolean[] | null>(null);
  const [predictivePath, setPredictivePath] = useState<Point[]>([]);
  const [tolerance, setTolerance] = useState(toolSettings.magicLasso.tolerance);
  const lastDropTime = useRef(0);
  const velocityHistory = useRef<Point[]>([]);

  // Throttle function for performance
  const throttle = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    let lastExecTime = 0;
    return (...args: any[]) => {
      const currentTime = Date.now();
      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      }
    };
  }, []);

  // Edge detection using Sobel operator
  const detectEdges = useCallback((imageData: ImageData, x: number, y: number, radius: number) => {
    const { data, width, height } = imageData;
    const edges: { x: number; y: number; strength: number; angle: number }[] = [];
    
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    
    const startX = Math.max(0, x - radius);
    const endX = Math.min(width - 1, x + radius);
    const startY = Math.max(0, y - radius);
    const endY = Math.min(height - 1, y + radius);
    
    for (let py = startY; py <= endY; py++) {
      for (let px = startX; px <= endX; px++) {
        let gx = 0, gy = 0;
        
        for (let i = 0; i < 9; i++) {
          const kx = (i % 3) - 1;
          const ky = Math.floor(i / 3) - 1;
          const nx = px + kx;
          const ny = py + ky;
          
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4;
            const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            gx += gray * sobelX[i];
            gy += gray * sobelY[i];
          }
        }
        
        const strength = Math.sqrt(gx * gx + gy * gy);
        const angle = Math.atan2(gy, gx) * 180 / Math.PI;
        
        if (strength > 20) { // Threshold for edge detection
          edges.push({ x: px, y: py, strength, angle });
        }
      }
    }
    
    return edges;
  }, []);

  // Flood fill for hover segmentation
  const hoverFloodFill = useCallback((imageData: ImageData, startX: number, startY: number, tolerance: number, radius: number) => {
    const { data, width, height } = imageData;
    const result = new Array(width * height).fill(false);
    const visited = new Array(width * height).fill(false);
    
    const getPixelIndex = (x: number, y: number) => (y * width + x) * 4;
    const getPixelColor = (x: number, y: number) => {
      const idx = getPixelIndex(x, y);
      return [data[idx], data[idx + 1], data[idx + 2]];
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
      
      const distance = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
      if (distance > radius) continue;
      
      const pixelIndex = y * width + x;
      if (visited[pixelIndex]) continue;
      
      const currentColor = getPixelColor(x, y);
      const colorDiff = colorDistance(currentColor, targetColor);
      
      if (colorDiff <= tolerance) {
        visited[pixelIndex] = true;
        result[pixelIndex] = true;
        
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    }
    
    return result;
  }, []);

  // Calculate perpendicular bias cost
  const calculatePerpBias = useCallback((mouseAngle: number, dominantAngle: number) => {
    const { perpBias, falloffSigma } = toolSettings.magicLasso;
    const angleDiff = Math.min(
      Math.abs(mouseAngle - dominantAngle),
      180 - Math.abs(mouseAngle - dominantAngle)
    );
    const perpDiff = Math.abs(90 - angleDiff);
    
    return perpBias * Math.exp(-Math.pow(perpDiff, 2) / (2 * Math.pow(falloffSigma, 2)));
  }, [toolSettings.magicLasso]);

  // Update trajectory from path history
  const updateTrajectory = useCallback(() => {
    if (path.length < 2) return;
    
    const recent = path.slice(-3);
    if (recent.length >= 2) {
      const dx = recent[recent.length - 1].x - recent[0].x;
      const dy = recent[recent.length - 1].y - recent[0].y;
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const velocity = Math.sqrt(dx * dx + dy * dy) / recent.length;
      
      setTrajectory({ dx, dy, angle, velocity });
      velocityHistory.current.push({ x: dx, y: dy });
      if (velocityHistory.current.length > 5) {
        velocityHistory.current.shift();
      }
    }
  }, [path]);

  // Predict future path
  const predictFuture = useCallback((distance: number) => {
    if (!toolSettings.magicLasso.predictiveMode || path.length < 2) {
      setPredictivePath([]);
      return;
    }
    
    const lastPoint = path[path.length - 1];
    const normalizedDx = trajectory.dx / (trajectory.velocity || 1);
    const normalizedDy = trajectory.dy / (trajectory.velocity || 1);
    
    const predicted: Point[] = [];
    for (let i = 1; i <= distance; i++) {
      predicted.push({
        x: lastPoint.x + normalizedDx * i,
        y: lastPoint.y + normalizedDy * i
      });
    }
    
    setPredictivePath(predicted);
  }, [path, trajectory, toolSettings.magicLasso.predictiveMode]);

  // Find optimal path between two points
  const findOptimalPath = useCallback((start: Point, end: Point, edges: any[], perpCost: number) => {
    // Simplified A* pathfinding with edge awareness
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    
    if (steps === 0) return [start];
    
    const path: Point[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round(start.x + dx * t);
      const y = Math.round(start.y + dy * t);
      
      // Try to snap to nearby edges
      const nearbyEdge = edges.find(edge => 
        Math.sqrt((edge.x - x) ** 2 + (edge.y - y) ** 2) < 3
      );
      
      if (nearbyEdge && Math.random() < perpCost) {
        path.push({ x: nearbyEdge.x, y: nearbyEdge.y });
      } else {
        path.push({ x, y });
      }
    }
    
    return path;
  }, []);

  // Check if should drop node
  const shouldDropNode = useCallback((currentPoint: Point) => {
    const now = Date.now();
    const { nodeDropTime, minDropDistance } = toolSettings.magicLasso;
    
    if (now - lastDropTime.current < nodeDropTime) return false;
    if (nodes.length === 0) return true;
    
    const lastNode = nodes[nodes.length - 1];
    const distance = Math.sqrt(
      (currentPoint.x - lastNode.x) ** 2 + 
      (currentPoint.y - lastNode.y) ** 2
    );
    
    return distance >= minDropDistance;
  }, [nodes, toolSettings.magicLasso]);

  // Drop a new node
  const dropNode = useCallback((point: Point, dominantAngle: number, edgeStrength: number) => {
    const newNode: Node = {
      ...point,
      timestamp: Date.now(),
      features: {
        dominantAngle,
        edgeStrength,
        localVariance: Math.random() * 10 // Simplified variance calculation
      }
    };
    
    setNodes(prev => [...prev, newNode]);
    lastDropTime.current = Date.now();
  }, []);

  // Update overlay visualization
  const updateOverlay = useCallback(() => {
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    if (!overlay || !canvas) return;

    overlay.width = canvas.width;
    overlay.height = canvas.height;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, overlay.width, overlay.height);
    
    // Draw hover mask
    if (hoverMask && isDrawing) {
      const maskData = new ImageData(canvas.width, canvas.height);
      for (let i = 0; i < hoverMask.length; i++) {
        if (hoverMask[i]) {
          maskData.data[i * 4] = 255;     // R
          maskData.data[i * 4 + 1] = 100; // G
          maskData.data[i * 4 + 2] = 255; // B
          maskData.data[i * 4 + 3] = 80;  // A
        }
      }
      ctx.putImageData(maskData, 0, 0);
    }
    
    // Draw main path
    if (path.length > 1) {
      ctx.strokeStyle = 'rgba(255, 100, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    }
    
    // Draw predictive path
    if (predictivePath.length > 0) {
      ctx.strokeStyle = 'rgba(100, 255, 100, 0.6)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      
      ctx.beginPath();
      if (path.length > 0) {
        const lastPoint = path[path.length - 1];
        ctx.moveTo(lastPoint.x, lastPoint.y);
        for (const point of predictivePath) {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();
    }
    
    // Draw nodes
    ctx.fillStyle = 'rgba(255, 100, 255, 1)';
    nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Draw hover circle
    if (isDrawing) {
      ctx.strokeStyle = 'rgba(100, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, toolSettings.magicLasso.hoverRadius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }, [overlayRef, canvasRef, path, predictivePath, nodes, hoverMask, isDrawing, mousePos, toolSettings.magicLasso.hoverRadius]);

  // Throttled mouse move handler
  const handleMouseMove = useCallback(throttle((e: MouseEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    
    const currentPoint = { x, y };
    
    // Update path
    setPath(prev => [...prev, currentPoint]);
    
    // Update trajectory
    updateTrajectory();
    
    // Hover segmentation
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const mask = hoverFloodFill(imageData, x, y, tolerance, toolSettings.magicLasso.hoverRadius);
      setHoverMask(mask);
      
      // Edge detection for snapping
      const edges = detectEdges(imageData, x, y, toolSettings.magicLasso.hoverRadius);
      
      // Calculate dominant angle
      const angles = edges.map(e => e.angle);
      const dominantAngle = angles.length > 0 ? 
        angles.reduce((a, b, i, arr) => arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b) : 0;
      
      // Calculate perpendicular bias
      const perpCost = calculatePerpBias(trajectory.angle, dominantAngle);
      
      // Find optimal path from last point
      if (path.length > 1) {
        const optimalPath = findOptimalPath(path[path.length - 2], currentPoint, edges, perpCost);
        if (optimalPath.length > 1) {
          setPath(prev => [...prev.slice(0, -1), ...optimalPath]);
        }
      }
      
      // Drop node if needed
      if (shouldDropNode(currentPoint)) {
        const edgeStrength = edges.reduce((sum, edge) => sum + edge.strength, 0) / edges.length;
        dropNode(currentPoint, dominantAngle, edgeStrength || 0);
      }
      
      // Predict future path
      predictFuture(15);
    }
  }, 16), [isDrawing, canvasRef, tolerance, toolSettings.magicLasso, updateTrajectory, hoverFloodFill, detectEdges, calculatePerpBias, findOptimalPath, shouldDropNode, dropNode, predictFuture, path]);

  // Mouse event handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
      const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

      setIsDrawing(true);
      setPath([{ x, y }]);
      setNodes([]);
      setHoverMask(null);
      setPredictivePath([]);
      lastDropTime.current = Date.now();
      velocityHistory.current = [];
    };

    const handleMouseUp = () => {
      if (isDrawing && path.length > 2) {
        // Close the path and create final selection
        console.log('Magic Lasso completed with', path.length, 'points and', nodes.length, 'nodes');
      }
      setIsDrawing(false);
      setHoverMask(null);
      setPredictivePath([]);
    };

    const handleWheel = (e: WheelEvent) => {
      if (isDrawing) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -5 : 5;
        setTolerance(prev => Math.max(0, Math.min(100, prev + delta)));
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [canvasRef, isDrawing, path, setIsDrawing, handleMouseMove]);

  // Update overlay when path changes
  useEffect(() => {
    updateOverlay();
  }, [updateOverlay]);

  // Update tolerance when settings change
  useEffect(() => {
    setTolerance(toolSettings.magicLasso.tolerance);
  }, [toolSettings.magicLasso.tolerance]);

  return null;
};