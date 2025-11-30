import React, { useState } from 'react';
import { CDETopBar } from '@/components/Navigation/CDETopBar';
import { VideoLeftToolbar } from '@/components/Toolbars/VideoLeftToolbar';
import { RightPanelBar } from '@/components/Panels/RightPanelBar';
import { BottomBar } from '@/components/Bars/BottomBar';
import { AIChatPanel } from '@/components/Panels/AIChatPanel';
import { AssetsPanel } from '@/components/Panels/AssetsPanel';
import { VideoTimelinePanel } from '@/components/Panels/VideoTimelinePanel';
import { VideoEffectsPanel } from '@/components/Panels/VideoEffectsPanel';
import { ToolSettingsPanelCompact } from '@/components/Panels/ToolSettingsPanelCompact';
import { ToolProvider } from '@/components/Context/ToolContext';

export const VideoPage: React.FC = () => {
  const [settingsCollapsed, setSettingsCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState<'timeline' | 'effects' | 'ai-chat' | 'assets' | null>(null);

  return (
    <ToolProvider>
      <div className="min-h-screen bg-editor-bg text-foreground flex flex-col w-full">
        <CDETopBar />

      <div className="flex-1 flex overflow-hidden">
        <ToolSettingsPanelCompact collapsed={settingsCollapsed} />
        
        <VideoLeftToolbar 
          onToggleSettings={setSettingsCollapsed}
          settingsCollapsed={settingsCollapsed}
        />

        {/* Main Video Canvas */}
        <div className="flex-1 flex items-center justify-center bg-editor-canvas">
          <div className="text-center">
            <div className="text-6xl mb-4">📽️</div>
            <h2 className="text-2xl font-semibold mb-2">Video Workspace</h2>
            <p className="text-muted-foreground">Cinematic Production & Timeline Editor</p>
          </div>
        </div>

        {/* Dynamic Right Panels */}
        {activePanel === 'timeline' && <VideoTimelinePanel />}
        {activePanel === 'effects' && <VideoEffectsPanel />}
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
