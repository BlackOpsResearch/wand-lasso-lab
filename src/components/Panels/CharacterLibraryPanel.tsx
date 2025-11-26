import React from 'react';
import { Users } from 'lucide-react';

export const CharacterLibraryPanel: React.FC = () => {
  return (
    <div className="w-80 bg-editor-panel border-l border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Users className="w-4 h-4 text-editor-accent" />
          Character Library
        </h3>
      </div>
      <div className="flex-1 p-4">
        <p className="text-xs text-muted-foreground">Browse and manage characters</p>
      </div>
    </div>
  );
};
