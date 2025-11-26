import React, { useState } from 'react';
import { CDETopBar } from '@/components/Navigation/CDETopBar';
import { StoryboardLeftToolbar } from '@/components/Toolbars/StoryboardLeftToolbar';
import { RightPanelBar } from '@/components/Panels/RightPanelBar';
import { BottomBar } from '@/components/Bars/BottomBar';
import { AIChatPanel } from '@/components/Panels/AIChatPanel';
import { AssetsPanel } from '@/components/Panels/AssetsPanel';
import { StoryboardFramesPanel } from '@/components/Panels/StoryboardFramesPanel';
import { StoryboardScenesPanel } from '@/components/Panels/StoryboardScenesPanel';
import { ToolSettingsPanelCompact } from '@/components/Panels/ToolSettingsPanelCompact';

export const StoryboardPage: React.FC = () => {
  const [settingsCollapsed, setSettingsCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState<'frames' | 'scenes' | 'ai-chat' | 'assets' | null>(null);

  return (
    <div className="min-h-screen bg-editor-bg text-foreground flex flex-col w-full">
      <CDETopBar />

      <div className="flex-1 flex overflow-hidden">
        <ToolSettingsPanelCompact collapsed={settingsCollapsed} />
        
        <StoryboardLeftToolbar 
          onToggleSettings={setSettingsCollapsed}
          settingsCollapsed={settingsCollapsed}
        />

        {/* Main Storyboard Canvas */}
        <div className="flex-1 flex items-center justify-center bg-editor-canvas">
          <div className="text-center">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-2xl font-semibold mb-2">Storyboard Workspace</h2>
            <p className="text-muted-foreground">Scene Planning & Shot Sequencing</p>
          </div>
        </div>

        {/* Dynamic Right Panels */}
        {activePanel === 'frames' && <StoryboardFramesPanel />}
        {activePanel === 'scenes' && <StoryboardScenesPanel />}
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
