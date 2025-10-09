import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from './Canvas/Canvas';
import { CDELeftToolbar } from './Toolbars/CDELeftToolbar';
import { CDETopBar } from './Navigation/CDETopBar';
import { RightPanelBar } from './Panels/RightPanelBar';
import { BottomBar } from './Bars/BottomBar';
import { AIToolsPanel } from './Panels/AIToolsPanel';
import { SpecialLayersBar } from './Panels/SpecialLayersBar';
import { ToolProvider } from './Context/ToolContext';
import { ImageProvider } from './Context/ImageContext';
import { LayerProvider } from './Context/LayerContext';

export const ImageEditor: React.FC = () => {
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showLayersBar, setShowLayersBar] = useState(true);
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
              {/* CDE Left Toolbar */}
              <CDELeftToolbar />

              {/* Central Canvas Area */}
              <div className="flex-1 flex">
                <Canvas ref={canvasRef} />
              </div>

              {/* Special Layers Bar */}
              {showLayersBar && <SpecialLayersBar />}

              {/* AI Tools Panel */}
              {showAIPanel && <AIToolsPanel />}

              {/* Right Panel Bar */}
              <RightPanelBar />
            </div>

            {/* Bottom Bar */}
            <BottomBar />
          </div>
        </ToolProvider>
      </LayerProvider>
    </ImageProvider>
  );
};