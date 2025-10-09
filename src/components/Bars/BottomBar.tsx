import React from 'react';
import { Separator } from '@/components/ui/separator';

interface BottomBarProps {
  toolHint?: string;
  coordinates?: { x: number; y: number };
  zoomLevel?: number;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  toolHint = 'Select a tool to begin',
  coordinates = { x: 0, y: 0 },
  zoomLevel = 100,
}) => {
  return (
    <div className="h-8 bg-editor-toolbar border-t border-border flex items-center px-4 gap-4 text-xs">
      {/* Tool Hints */}
      <div className="flex-1 text-muted-foreground">
        {toolHint}
      </div>

      <Separator orientation="vertical" className="h-4" />

      {/* Coordinates */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <span>X: {coordinates.x.toFixed(0)}</span>
        <span>Y: {coordinates.y.toFixed(0)}</span>
      </div>

      <Separator orientation="vertical" className="h-4" />

      {/* Zoom Level */}
      <div className="text-muted-foreground">
        Zoom: {zoomLevel}%
      </div>

      <Separator orientation="vertical" className="h-4" />

      {/* Undo Preview Timeline */}
      <div className="w-48 h-4 bg-editor-bg rounded-sm border border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40" style={{ width: '60%' }} />
        <div className="absolute left-[60%] top-0 bottom-0 w-0.5 bg-primary" />
      </div>
    </div>
  );
};
