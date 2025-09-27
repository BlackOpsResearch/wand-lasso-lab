// Advanced segmentation algorithms for Magic Wand and Magic Lasso tools

export interface ColorSpace {
  name: 'RGB' | 'HSV' | 'LAB';
  converter: (r: number, g: number, b: number) => [number, number, number];
}

export const colorSpaces: Record<string, ColorSpace> = {
  RGB: {
    name: 'RGB',
    converter: (r: number, g: number, b: number) => [r, g, b]
  },
  HSV: {
    name: 'HSV',
    converter: (r: number, g: number, b: number) => {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const diff = max - min;
      
      let h = 0;
      if (diff !== 0) {
        if (max === r) h = ((g - b) / diff + 6) % 6;
        else if (max === g) h = (b - r) / diff + 2;
        else h = (r - g) / diff + 4;
      }
      h *= 60;
      
      const s = max === 0 ? 0 : diff / max;
      const v = max;
      
      return [h, s * 100, v * 100];
    }
  },
  LAB: {
    name: 'LAB',
    converter: (r: number, g: number, b: number) => {
      // Simplified LAB conversion
      r /= 255; g /= 255; b /= 255;
      
      // Apply gamma correction
      r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
      g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
      b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
      
      // Convert to XYZ
      let x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
      let y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) / 1.00000;
      let z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) / 1.08883;
      
      // Apply LAB transformation
      x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116);
      y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116);
      z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116);
      
      const L = (116 * y) - 16;
      const a = 500 * (x - y);
      const b_lab = 200 * (y - z);
      
      return [L, a, b_lab];
    }
  }
};

export interface MagicWandParams {
  tolerance: number;
  contiguous: boolean;
  colorSpace: 'RGB' | 'HSV' | 'LAB';
  connectivity: 4 | 8;
  antiAlias: boolean;
}

export class MagicWandSegmentation {
  static floodFill(
    imageData: ImageData,
    startX: number,
    startY: number,
    params: MagicWandParams
  ): boolean[] {
    const { data, width, height } = imageData;
    const { tolerance, contiguous, colorSpace, connectivity } = params;
    
    const visited = new Array(width * height).fill(false);
    const result = new Array(width * height).fill(false);
    
    const getPixelIndex = (x: number, y: number) => (y * width + x) * 4;
    const getPixelColor = (x: number, y: number) => {
      const idx = getPixelIndex(x, y);
      return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
    };

    const colorDistance = (c1: number[], c2: number[]) => {
      const converter = colorSpaces[colorSpace].converter;
      const conv1 = converter(c1[0], c1[1], c1[2]);
      const conv2 = converter(c2[0], c2[1], c2[2]);
      
      return Math.sqrt(
        Math.pow(conv1[0] - conv2[0], 2) +
        Math.pow(conv1[1] - conv2[1], 2) +
        Math.pow(conv1[2] - conv2[2], 2)
      );
    };

    const targetColor = getPixelColor(startX, startY);
    
    if (contiguous) {
      // Flood fill algorithm for contiguous selection
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
          
          // Add neighbors based on connectivity
          if (connectivity === 4) {
            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
          } else {
            stack.push(
              [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1],
              [x + 1, y + 1], [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1]
            );
          }
        }
      }
    } else {
      // Global selection - select all similar colors
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const pixelIndex = y * width + x;
          const currentColor = getPixelColor(x, y);
          const distance = colorDistance(currentColor, targetColor);
          
          if (distance <= tolerance) {
            result[pixelIndex] = true;
          }
        }
      }
    }

    return result;
  }

  static createSelectionMask(selection: boolean[], width: number, height: number): ImageData {
    const maskData = new Uint8ClampedArray(width * height * 4);
    
    for (let i = 0; i < selection.length; i++) {
      const alpha = selection[i] ? 255 : 0;
      maskData[i * 4] = 100;     // R
      maskData[i * 4 + 1] = 200; // G
      maskData[i * 4 + 2] = 255; // B
      maskData[i * 4 + 3] = alpha * 0.3; // A
    }
    
    return new ImageData(maskData, width, height);
  }
}

export interface MagicLassoParams {
  contrast: number;
  frequency: number;
  elasticity: number;
  nodeDropTime: number;
}

export class MagicLassoSegmentation {
  private static calculateEdgeCost(
    imageData: ImageData,
    x1: number, y1: number,
    x2: number, y2: number
  ): number {
    const { data, width } = imageData;
    
    const getPixel = (x: number, y: number) => {
      const idx = (y * width + x) * 4;
      return [data[idx], data[idx + 1], data[idx + 2]];
    };
    
    const pixel1 = getPixel(x1, y1);
    const pixel2 = getPixel(x2, y2);
    
    // Calculate gradient magnitude using Sobel-like operation
    const gradientX = Math.abs(pixel2[0] - pixel1[0]) + 
                     Math.abs(pixel2[1] - pixel1[1]) + 
                     Math.abs(pixel2[2] - pixel1[2]);
    
    // Convert to cost (lower gradient = higher cost for edge detection)
    return 255 - gradientX;
  }

  static findOptimalPath(
    imageData: ImageData,
    startX: number, startY: number,
    endX: number, endY: number,
    params: MagicLassoParams
  ): Array<{x: number, y: number}> {
    const { width, height } = imageData;
    const { contrast } = params;
    
    // Simplified A* pathfinding for live-wire
    const path: Array<{x: number, y: number}> = [];
    
    // For now, implement a simple line with edge snapping
    const dx = Math.abs(endX - startX);
    const dy = Math.abs(endY - startY);
    const sx = startX < endX ? 1 : -1;
    const sy = startY < endY ? 1 : -1;
    let err = dx - dy;
    
    let x = startX;
    let y = startY;
    
    while (true) {
      // Try to snap to nearby edges
      let bestX = x, bestY = y;
      let bestCost = Infinity;
      
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const cost = this.calculateEdgeCost(imageData, x, y, nx, ny);
            if (cost < bestCost) {
              bestCost = cost;
              bestX = nx;
              bestY = ny;
            }
          }
        }
      }
      
      // Use edge-snapped position if cost is below threshold
      if (bestCost < contrast) {
        path.push({ x: bestX, y: bestY });
        x = bestX;
        y = bestY;
      } else {
        path.push({ x, y });
      }
      
      if (x === endX && y === endY) break;
      
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
    
    return path;
  }

  static createPathMask(
    path: Array<{x: number, y: number}>,
    width: number,
    height: number
  ): boolean[] {
    const mask = new Array(width * height).fill(false);
    
    for (const point of path) {
      const index = point.y * width + point.x;
      if (index >= 0 && index < mask.length) {
        mask[index] = true;
      }
    }
    
    return mask;
  }
}