import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from './Canvas/Canvas';
import { CDELeftToolbar } from './Toolbars/CDELeftToolbar';
import { CDETopBar } from './Navigation/CDETopBar';
import { RightPanelBar } from './Panels/RightPanelBar';
import { BottomBar } from './Bars/BottomBar';
import { AIToolsPanel } from './Panels/AIToolsPanel';
import { LayersPanel } from './Panels/LayersPanel';
import { AdvancedAIGeneratePanel } from './Panels/AdvancedAIGeneratePanel';
import { AIChatPanel } from './Panels/AIChatPanel';
import { SpecialLayersBar } from './Panels/SpecialLayersBar';
import { ToolSettingsPanel } from './Panels/ToolSettingsPanel';
import { ToolProvider } from './Context/ToolContext';
import { ImageProvider } from './Context/ImageContext';
import { LayerProvider } from './Context/LayerContext';

export const ImageEditor: React.FC = () => {
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showLayersBar, setShowLayersBar] = useState(true);
  const [activePanel, setActivePanel] = useState<'layers' | 'inspector' | 'effects' | 'ai-generate' | 'ai-chat' | null>(null);
  const [panelSize, setPanelSize] = useState<'full' | 'top' | 'bottom'>('full');
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  return (
    <ImageProvider>
      <LayerProvider>
        <ToolProvider>
          <div className="min-h-screen bg-editor-bg text-foreground flex flex-col w-full">
            {/* CDE Top Bar */}
            <CDETopBar />

            {/* Main Editor Layout */}
            <div className="flex-1 flex overflow-hidden">
              {/* Tool Settings Panel */}
              <ToolSettingsPanel />
              
              {/* CDE Left Toolbar */}
              <CDELeftToolbar />

              {/* Central Canvas Area */}
              <div className="flex-1 flex">
                <Canvas ref={canvasRef} />
              </div>

              {/* Special Layers Bar */}
              {showLayersBar && <SpecialLayersBar />}

              {/* Dynamic Right Panels */}
              {activePanel === 'layers' && <LayersPanel />}
              {activePanel === 'ai-generate' && <AdvancedAIGeneratePanel />}
              {activePanel === 'ai-chat' && <AIChatPanel />}

              {/* Right Panel Bar */}
              <RightPanelBar 
                onPanelChange={(panel, size) => {
                  setActivePanel(panel as any);
                  setPanelSize(size);
                }} 
              />
            </div>

            {/* Bottom Bar */}
            <BottomBar />
          </div>
        </ToolProvider>
      </LayerProvider>
    </ImageProvider>
  );
};