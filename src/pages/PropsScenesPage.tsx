import React, { useState } from 'react';
import { CDETopBar } from '@/components/Navigation/CDETopBar';
import { PropsScenesLeftToolbar } from '@/components/Toolbars/PropsScenesLeftToolbar';
import { RightPanelBar } from '@/components/Panels/RightPanelBar';
import { BottomBar } from '@/components/Bars/BottomBar';
import { AIChatPanel } from '@/components/Panels/AIChatPanel';
import { AssetsPanel } from '@/components/Panels/AssetsPanel';
import { PropsLibraryPanel } from '@/components/Panels/PropsLibraryPanel';
import { SceneComposerPanel } from '@/components/Panels/SceneComposerPanel';
import { ToolSettingsPanelCompact } from '@/components/Panels/ToolSettingsPanelCompact';

export const PropsScenesPage: React.FC = () => {
  const [settingsCollapsed, setSettingsCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState<'props' | 'scenes' | 'ai-chat' | 'assets' | null>(null);

  return (
    <div className="min-h-screen bg-editor-bg text-foreground flex flex-col w-full">
      <CDETopBar />

      <div className="flex-1 flex overflow-hidden">
        <ToolSettingsPanelCompact collapsed={settingsCollapsed} />
        
        <PropsScenesLeftToolbar 
          onToggleSettings={setSettingsCollapsed}
          settingsCollapsed={settingsCollapsed}
        />

        {/* Main Props/Scenes Canvas */}
        <div className="flex-1 flex items-center justify-center bg-editor-canvas">
          <div className="text-center">
            <div className="text-6xl mb-4">🎪</div>
            <h2 className="text-2xl font-semibold mb-2">Props & Scenes Workspace</h2>
            <p className="text-muted-foreground">Asset Creation & Scene Composition</p>
          </div>
        </div>

        {/* Dynamic Right Panels */}
        {activePanel === 'props' && <PropsLibraryPanel />}
        {activePanel === 'scenes' && <SceneComposerPanel />}
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
  );
};
