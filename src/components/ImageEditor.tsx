import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from './Canvas/Canvas';
import { CDELeftToolbar } from './Toolbars/CDELeftToolbar';
import { CDETopBar } from './Navigation/CDETopBar';
import { RightPanelBar } from './Panels/RightPanelBar';
import { BottomBar } from './Bars/BottomBar';
import { LayersPanel } from './Panels/LayersPanel';
import { InspectorPanel } from './Panels/InspectorPanel';
import { EffectsPanel } from './Panels/EffectsPanel';
import { AdvancedAIGeneratePanel } from './Panels/AdvancedAIGeneratePanel';
import { AIChatPanel } from './Panels/AIChatPanel';
import { MagnifierPanel } from './Panels/MagnifierPanel';
import { MicroscopePanel } from './Panels/MicroscopePanel';
import { AssetsPanel } from './Panels/AssetsPanel';
import { SpecialLayersBar } from './Panels/SpecialLayersBar';
import { ToolSettingsPanelCompact } from './Panels/ToolSettingsPanelCompact';
import { ToolProvider } from './Context/ToolContext';
import { ImageProvider } from './Context/ImageContext';
import { LayerProvider } from './Context/LayerContext';

export const ImageEditor: React.FC = () => {
  const [settingsCollapsed, setSettingsCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState<'layers' | 'inspector' | 'effects' | 'ai-generate' | 'ai-chat' | 'magnifier' | 'microscope' | 'assets' | null>(null);
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
              <ToolSettingsPanelCompact 
                collapsed={settingsCollapsed}
              />
              
              {/* CDE Left Toolbar */}
              <CDELeftToolbar 
                onToggleSettings={setSettingsCollapsed}
                settingsCollapsed={settingsCollapsed}
              />

              {/* Central Canvas Area */}
              <div className="flex-1 flex">
                <Canvas ref={canvasRef} />
              </div>

              {/* Special Layers Bar */}
              <SpecialLayersBar />

              {/* Dynamic Right Panels */}
              {activePanel === 'layers' && <LayersPanel />}
              {activePanel === 'inspector' && <InspectorPanel />}
              {activePanel === 'effects' && <EffectsPanel />}
              {activePanel === 'ai-generate' && <AdvancedAIGeneratePanel />}
              {activePanel === 'ai-chat' && <AIChatPanel />}
              {activePanel === 'magnifier' && <MagnifierPanel canvasRef={canvasRef} />}
              {activePanel === 'microscope' && <MicroscopePanel canvasRef={canvasRef} />}
              {activePanel === 'assets' && <AssetsPanel />}

              {/* Right Panel Bar */}
              <RightPanelBar 
                onPanelChange={(panel, size) => {
                  setActivePanel(panel);
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