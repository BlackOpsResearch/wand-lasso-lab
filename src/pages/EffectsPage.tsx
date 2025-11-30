import React, { useState } from 'react';
import { CDETopBar } from '@/components/Navigation/CDETopBar';
import { EffectsLeftToolbar } from '@/components/Toolbars/EffectsLeftToolbar';
import { RightPanelBar } from '@/components/Panels/RightPanelBar';
import { BottomBar } from '@/components/Bars/BottomBar';
import { AIChatPanel } from '@/components/Panels/AIChatPanel';
import { AssetsPanel } from '@/components/Panels/AssetsPanel';
import { EffectsLibraryPanel } from '@/components/Panels/EffectsLibraryPanel';
import { EffectsComposerPanel } from '@/components/Panels/EffectsComposerPanel';
import { ToolSettingsPanelCompact } from '@/components/Panels/ToolSettingsPanelCompact';
import { ToolProvider } from '@/components/Context/ToolContext';

export const EffectsPage: React.FC = () => {
  const [settingsCollapsed, setSettingsCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState<'library' | 'composer' | 'ai-chat' | 'assets' | null>(null);

  return (
    <ToolProvider>
      <div className="min-h-screen bg-editor-bg text-foreground flex flex-col w-full">
        <CDETopBar />

      <div className="flex-1 flex overflow-hidden">
        <ToolSettingsPanelCompact collapsed={settingsCollapsed} />
        
        <EffectsLeftToolbar 
          onToggleSettings={setSettingsCollapsed}
          settingsCollapsed={settingsCollapsed}
        />

        {/* Main Effects Canvas */}
        <div className="flex-1 flex items-center justify-center bg-editor-canvas">
          <div className="text-center">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-semibold mb-2">Effects Workspace</h2>
            <p className="text-muted-foreground">Visual Effects & Rendering System</p>
          </div>
        </div>

        {/* Dynamic Right Panels */}
        {activePanel === 'library' && <EffectsLibraryPanel />}
        {activePanel === 'composer' && <EffectsComposerPanel />}
        {activePanel === 'ai-chat' && <AIChatPanel />}
        {activePanel === 'assets' && <AssetsPanel />}

        <RightPanelBar 
          onPanelChange={(panel, size) => {
            setActivePanel(panel as any);
          }} 
        />
      </div>

        <BottomBar />
      </div>
    </ToolProvider>
  );
};
