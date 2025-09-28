import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from './Canvas/Canvas';
import { LeftToolbar } from './Toolbars/LeftToolbar';
import { RightPanel } from './Panels/RightPanel';
import { TopNavigation } from './Navigation/TopNavigation';
import { BottomDrawer } from './Drawers/BottomDrawer';
import { SpecialDisplayPanel } from './Panels/SpecialDisplayPanel';
import { ToolProvider } from './Context/ToolContext';
import { ImageProvider } from './Context/ImageContext';
import { LayerProvider } from './Context/LayerContext';

export const ImageEditor: React.FC = () => {
  const [activeView, setActiveView] = useState<'main' | 'compare'>('main');
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState(true);
  const [specialPanelOpen, setSpecialPanelOpen] = useState(false);

  return (
    <ImageProvider>
      <LayerProvider>
        <ToolProvider>
          <div className="min-h-screen bg-editor-bg text-foreground flex flex-col">
            {/* Top Navigation */}
            <TopNavigation 
              activeView={activeView}
              onViewChange={setActiveView}
              onToggleSpecialPanel={() => setSpecialPanelOpen(!specialPanelOpen)}
            />

            {/* Main Editor Layout */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Toolbar */}
              <LeftToolbar />

              {/* Central Canvas Area */}
              <div className="flex-1 flex flex-col relative">
                <div className="flex-1 flex">
                  <div className="flex-1 p-4">
                    <Canvas />
                  </div>
                  
                  {/* Right Panel */}
                  {rightPanelOpen && (
                    <div className="w-80 animate-panel-slide">
                      <RightPanel />
                    </div>
                  )}
                </div>

                {/* Special Display Panel */}
                {specialPanelOpen && (
                  <div className="h-80 border-t border-border animate-panel-slide">
                    <SpecialDisplayPanel onClose={() => setSpecialPanelOpen(false)} />
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Drawer */}
            {bottomDrawerOpen && (
              <div className="h-60 border-t border-border animate-panel-slide">
                <BottomDrawer onClose={() => setBottomDrawerOpen(false)} />
              </div>
            )}

            {/* Floating Toggle for Right Panel */}
            {!rightPanelOpen && (
              <button
                onClick={() => setRightPanelOpen(true)}
                className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 bg-primary text-primary-foreground p-2 rounded-l-lg shadow-tool hover:bg-primary/90 transition-[var(--transition-smooth)]"
                title="Open Settings Panel"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Floating Toggle for Bottom Drawer */}
            <button
              onClick={() => setBottomDrawerOpen(!bottomDrawerOpen)}
              className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-tool hover:bg-primary/90 transition-[var(--transition-smooth)]"
              title="Toggle Assets"
            >
              {bottomDrawerOpen ? 'Hide Assets' : 'Show Assets'}
            </button>
          </div>
        </ToolProvider>
      </LayerProvider>
    </ImageProvider>
  );
};