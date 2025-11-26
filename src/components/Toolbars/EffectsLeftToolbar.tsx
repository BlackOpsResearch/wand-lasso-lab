import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sparkles, Flame, Droplet, Wind, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

const tools = [
  { id: 'library', icon: Sparkles, label: 'Effects Library', shortcut: 'L' },
  { id: 'fire', icon: Flame, label: 'Fire Effects', shortcut: 'F' },
  { id: 'water', icon: Droplet, label: 'Water Effects', shortcut: 'W' },
  { id: 'atmospheric', icon: Wind, label: 'Atmospheric', shortcut: 'A' },
  { id: 'energy', icon: Zap, label: 'Energy Effects', shortcut: 'E' },
];

interface EffectsLeftToolbarProps {
  onToggleSettings: (collapsed: boolean) => void;
  settingsCollapsed: boolean;
}

export const EffectsLeftToolbar: React.FC<EffectsLeftToolbarProps> = ({ 
  onToggleSettings, 
  settingsCollapsed 
}) => {
  return (
    <div className="w-14 bg-editor-toolbar border-r border-border flex flex-col items-center py-4 gap-2">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10"
              >
                <Icon className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{tool.label}</p>
              <span className="text-xs text-muted-foreground">{tool.shortcut}</span>
            </TooltipContent>
          </Tooltip>
        );
      })}

      <div className="mt-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10"
              onClick={() => onToggleSettings(!settingsCollapsed)}
            >
              {settingsCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {settingsCollapsed ? 'Expand Settings' : 'Collapse Settings'}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
