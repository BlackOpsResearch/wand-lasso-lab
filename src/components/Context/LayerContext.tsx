import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay';
  data: ImageData | null;
}

interface LayerContextType {
  layers: Layer[];
  activeLayerId: string | null;
  addLayer: (name: string) => void;
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

  const addLayer = (name: string) => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      name,
      visible: true,
      opacity: 100,
      blendMode: 'normal',
      data: null,
    };
    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
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