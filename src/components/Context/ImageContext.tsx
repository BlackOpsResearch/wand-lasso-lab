import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ImageInfo {
  id: string;
  name: string;
  width: number;
  height: number;
  data: ImageData;
  url: string;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  data: ImageData;
  type: 'image' | 'mask' | 'adjustment';
}

interface ImageContextType {
  currentImage: ImageInfo | null;
  layers: Layer[];
  activeLayerIndex: number;
  setCurrentImage: (image: ImageInfo | null) => void;
  addLayer: (layer: Layer) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, updates: Partial<Layer>) => void;
  setActiveLayer: (index: number) => void;
  loadImageFromFile: (file: File) => Promise<void>;
  loadImageFromUrl: (url: string, name?: string) => Promise<void>;
  loadDefaultImage: () => Promise<void>;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const useImageContext = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImageContext must be used within an ImageProvider');
  }
  return context;
};

interface ImageProviderProps {
  children: ReactNode;
}

export const ImageProvider: React.FC<ImageProviderProps> = ({ children }) => {
  const [currentImage, setCurrentImage] = useState<ImageInfo | null>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerIndex, setActiveLayerIndex] = useState<number>(0);

  const loadImageFromFile = async (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        
        const imageInfo: ImageInfo = {
          id: crypto.randomUUID(),
          name: file.name,
          width: img.width,
          height: img.height,
          data: imageData,
          url
        };
        
        setCurrentImage(imageInfo);
        URL.revokeObjectURL(url);
        resolve();
      };
      
      img.src = url;
    });
  };

  const loadImageFromUrl = async (url: string, name?: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        
        const imageInfo: ImageInfo = {
          id: crypto.randomUUID(),
          name: name || url.split('/').pop() || 'image',
          width: img.width,
          height: img.height,
          data: imageData,
          url
        };
        
        setCurrentImage(imageInfo);
        resolve();
      };
      
      img.src = url;
    });
  };

  const loadDefaultImage = async (): Promise<void> => {
    // Create a sample test image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = 400;
    canvas.height = 300;
    
    // Create a test pattern
    const gradient = ctx.createLinearGradient(0, 0, 400, 300);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(0.3, '#4ecdc4');
    gradient.addColorStop(0.6, '#45b7d1');
    gradient.addColorStop(1, '#96ceb4');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 300);
    
    // Add some geometric shapes for testing
    ctx.fillStyle = '#ff9999';
    ctx.fillRect(50, 50, 100, 80);
    
    ctx.fillStyle = '#99ff99';
    ctx.beginPath();
    ctx.arc(250, 150, 60, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#9999ff';
    ctx.beginPath();
    ctx.moveTo(320, 80);
    ctx.lineTo(380, 80);
    ctx.lineTo(350, 140);
    ctx.closePath();
    ctx.fill();
    
    const imageData = ctx.getImageData(0, 0, 400, 300);
    
    const imageInfo: ImageInfo = {
      id: crypto.randomUUID(),
      name: 'Test Pattern',
      width: 400,
      height: 300,
      data: imageData,
      url: canvas.toDataURL()
    };
    
    setCurrentImage(imageInfo);
  };

  const addLayer = (layer: Layer) => {
    setLayers(prev => [...prev, layer]);
  };

  const removeLayer = (layerId: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== layerId));
  };

  const updateLayer = (layerId: string, updates: Partial<Layer>) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, ...updates } : layer
    ));
  };

  const setActiveLayer = (index: number) => {
    setActiveLayerIndex(index);
  };

  return (
    <ImageContext.Provider value={{
      currentImage,
      layers,
      activeLayerIndex,
      setCurrentImage,
      addLayer,
      removeLayer,
      updateLayer,
      setActiveLayer,
      loadImageFromFile,
      loadImageFromUrl,
      loadDefaultImage,
    }}>
      {children}
    </ImageContext.Provider>
  );
};