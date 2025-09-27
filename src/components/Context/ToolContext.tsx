import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ToolType = 'select' | 'magicWand' | 'magicLasso' | 'layers' | 'eyedropper' | 'zoom';

export interface ToolSettings {
  magicWand: {
    tolerance: number;
    contiguous: boolean;
    colorSpace: 'RGB' | 'HSV' | 'LAB' | 'Quaternion';
    searchRadius: number;
    connectivity: 4 | 8;
  };
  magicLasso: {
    nodeDropTime: number;
    elasticity: number;
    costFunction: 'sobel' | 'gradient' | 'texture';
  };
}

interface ToolContextType {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  toolSettings: ToolSettings;
  updateToolSettings: <T extends keyof ToolSettings>(tool: T, settings: Partial<ToolSettings[T]>) => void;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
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
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [toolSettings, setToolSettings] = useState<ToolSettings>({
    magicWand: {
      tolerance: 30,
      contiguous: true,
      colorSpace: 'RGB',
      searchRadius: 0,
      connectivity: 4,
    },
    magicLasso: {
      nodeDropTime: 200,
      elasticity: 0.5,
      costFunction: 'sobel',
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
    <ToolContext.Provider
      value={{
        activeTool,
        setActiveTool,
        toolSettings,
        updateToolSettings,
        isDrawing,
        setIsDrawing,
      }}
    >
      {children}
    </ToolContext.Provider>
  );
};