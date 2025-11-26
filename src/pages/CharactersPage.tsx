import React, { useState } from 'react';
import { CDETopBar } from '@/components/Navigation/CDETopBar';
import { CharactersLeftToolbar } from '@/components/Toolbars/CharactersLeftToolbar';
import { RightPanelBar } from '@/components/Panels/RightPanelBar';
import { BottomBar } from '@/components/Bars/BottomBar';
import { AIChatPanel } from '@/components/Panels/AIChatPanel';
import { AssetsPanel } from '@/components/Panels/AssetsPanel';
import { CharacterDesignPanel } from '@/components/Panels/CharacterDesignPanel';
import { CharacterLibraryPanel } from '@/components/Panels/CharacterLibraryPanel';
import { ToolSettingsPanelCompact } from '@/components/Panels/ToolSettingsPanelCompact';

export const CharactersPage: React.FC = () => {
  const [settingsCollapsed, setSettingsCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState<'design' | 'library' | 'ai-chat' | 'assets' | null>(null);

  return (
    <div className="min-h-screen bg-editor-bg text-foreground flex flex-col w-full">
      <CDETopBar />

      <div className="flex-1 flex overflow-hidden">
        <ToolSettingsPanelCompact collapsed={settingsCollapsed} />
        
        <CharactersLeftToolbar 
          onToggleSettings={setSettingsCollapsed}
          settingsCollapsed={settingsCollapsed}
        />

        {/* Main Character Canvas */}
        <div className="flex-1 flex items-center justify-center bg-editor-canvas">
          <div className="text-center">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-semibold mb-2">Character Workspace</h2>
            <p className="text-muted-foreground">Character Design & Consistency System</p>
          </div>
        </div>

        {/* Dynamic Right Panels */}
        {activePanel === 'design' && <CharacterDesignPanel />}
        {activePanel === 'library' && <CharacterLibraryPanel />}
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
