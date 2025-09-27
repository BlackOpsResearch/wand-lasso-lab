import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ToolType = 'magicWand' | 'magicLasso' | 'brush' | 'eraser' | 'eyedropper' | 'zoom' | 'hand';

interface ToolSettings {
  magicWand: {
    tolerance: number;
    contiguous: boolean;
    antiAlias: boolean;
    sampleAllLayers: boolean;
    colorSpace: 'RGB' | 'HSV' | 'LAB';
    connectivity: 4 | 8;
  };
  magicLasso: {
    width: number;
    contrast: number;
    frequency: number;
    elasticity: number;
    nodeDropTime: number;
  };
  brush: {
    size: number;
    hardness: number;
    opacity: number;
  };
}

interface Selection {
  id: string;
  pixels: boolean[];
  bounds: { x: number; y: number; width: number; height: number };
  timestamp: number;
}

interface ToolContextType {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  toolSettings: ToolSettings;
  updateToolSettings: <T extends keyof ToolSettings>(
    tool: T,
    settings: Partial<ToolSettings[T]>
  ) => void;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  currentSelection: Selection | null;
  setCurrentSelection: (selection: Selection | null) => void;
  previewSelection: boolean[] | null;
  setPreviewSelection: (selection: boolean[] | null) => void;
}

const ToolContext = createContext<ToolContextType | undefined>(undefined);

export const useToolContext = () => {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error('useToolContext must be used within a ToolProvider');
  }
  return context;
};

interface ToolProviderProps {
  children: ReactNode;
}

export const ToolProvider: React.FC<ToolProviderProps> = ({ children }) => {
  const [activeTool, setActiveTool] = useState<ToolType>('magicWand');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<Selection | null>(null);
  const [previewSelection, setPreviewSelection] = useState<boolean[] | null>(null);
  
  const [toolSettings, setToolSettings] = useState<ToolSettings>({
    magicWand: {
      tolerance: 30,
      contiguous: true,
      antiAlias: true,
      sampleAllLayers: false,
      colorSpace: 'RGB',
      connectivity: 4,
    },
    magicLasso: {
      width: 1,
      contrast: 40,
      frequency: 57,
      elasticity: 0.5,
      nodeDropTime: 200,
    },
    brush: {
      size: 5,
      hardness: 100,
      opacity: 100,
    },
  });

  const updateToolSettings = <T extends keyof ToolSettings>(
    tool: T,
    settings: Partial<ToolSettings[T]>
  ) => {
    setToolSettings(prev => ({
      ...prev,
      [tool]: { ...prev[tool], ...settings },
    }));
  };

  return (
    <ToolContext.Provider value={{
      activeTool,
      setActiveTool,
      toolSettings,
      updateToolSettings,
      isDrawing,
      setIsDrawing,
      currentSelection,
      setCurrentSelection,
      previewSelection,
      setPreviewSelection,
    }}>
      {children}
    </ToolContext.Provider>
  );
};