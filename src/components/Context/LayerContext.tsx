import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay';
  data: ImageData | null;
  imageUrl?: string;
}

interface LayerContextType {
  layers: Layer[];
  activeLayerId: string | null;
  addLayer: (name: string, data?: ImageData | null, imageUrl?: string) => void;
  addLayerFromSelection: (name: string, selection: boolean[], canvasRef: React.RefObject<HTMLCanvasElement>) => void;
  removeLayer: (id: string) => void;
  setActiveLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  reorderLayers: (sourceIndex: number, destIndex: number) => void;
}

const LayerContext = createContext<LayerContextType | undefined>(undefined);

export const useLayerContext = () => {
  const context = useContext(LayerContext);
  if (!context) {
    throw new Error('useLayerContext must be used within a LayerProvider');
  }
  return context;
};

interface LayerProviderProps {
  children: ReactNode;
}

export const LayerProvider: React.FC<LayerProviderProps> = ({ children }) => {
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 'background',
      name: 'Background',
      visible: true,
      opacity: 100,
      blendMode: 'normal',
      data: null,
    },
  ]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>('background');

  const addLayer = (name: string, data: ImageData | null = null, imageUrl?: string) => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      name,
      visible: true,
      opacity: 100,
      blendMode: 'normal',
      data,
      imageUrl,
    };
    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
  };

  const addLayerFromSelection = (name: string, selection: boolean[], canvasRef: React.RefObject<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const layerData = ctx.createImageData(canvas.width, canvas.height);

    // Copy only selected pixels to the new layer
    for (let i = 0; i < selection.length; i++) {
      if (selection[i]) {
        const idx = i * 4;
        layerData.data[idx] = imageData.data[idx];
        layerData.data[idx + 1] = imageData.data[idx + 1];
        layerData.data[idx + 2] = imageData.data[idx + 2];
        layerData.data[idx + 3] = imageData.data[idx + 3];
      }
    }

    addLayer(name, layerData);
  };

  const removeLayer = (id: string) => {
    if (id === 'background') return; // Don't allow removing background
    setLayers(prev => prev.filter(layer => layer.id !== id));
    if (activeLayerId === id) {
      setActiveLayerId('background');
    }
  };

  const setActiveLayer = (id: string) => {
    setActiveLayerId(id);
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === id ? { ...layer, ...updates } : layer
      )
    );
  };

  const reorderLayers = (sourceIndex: number, destIndex: number) => {
    setLayers(prev => {
      const newLayers = [...prev];
      const [removed] = newLayers.splice(sourceIndex, 1);
      newLayers.splice(destIndex, 0, removed);
      return newLayers;
    });
  };

  return (
    <LayerContext.Provider
      value={{
        layers,
        activeLayerId,
        addLayer,
        addLayerFromSelection,
        removeLayer,
        setActiveLayer,
        updateLayer,
        reorderLayers,
      }}
    >
      {children}
    </LayerContext.Provider>
  );
};