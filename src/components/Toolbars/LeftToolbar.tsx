import React from 'react';
import { useToolContext, ToolType } from '../Context/ToolContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  MousePointer, 
  Sparkles, 
  Lasso, 
  Layers, 
  Droplet, 
  ZoomIn,
  Undo,
  Redo 
} from 'lucide-react';

const tools = [
  { id: 'select' as ToolType, icon: MousePointer, label: 'Select Tool', shortcut: 'V' },
  { id: 'magicWand' as ToolType, icon: Sparkles, label: 'Magic Wand', shortcut: 'W' },
  { id: 'magicLasso' as ToolType, icon: Lasso, label: 'Magic Lasso', shortcut: 'L' },
  { id: 'layers' as ToolType, icon: Layers, label: 'Layers', shortcut: 'F7' },
  { id: 'eyedropper' as ToolType, icon: Droplet, label: 'Eyedropper', shortcut: 'I' },
  { id: 'zoom' as ToolType, icon: ZoomIn, label: 'Zoom', shortcut: 'Z' },
];

export const LeftToolbar: React.FC = () => {
  const { activeTool, setActiveTool } = useToolContext();

  const getToolButtonVariant = (toolId: ToolType) => {
    if (activeTool === toolId) {
      if (toolId === 'magicWand') return 'wand';
      if (toolId === 'magicLasso') return 'lasso';
      return 'default';
    }
    return 'ghost';
  };

  return (
    <div className="editor-toolbar w-16 flex flex-col items-center py-4 space-y-2">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant={getToolButtonVariant(tool.id)}
                size="icon"
                className={`
                  tool-button w-12 h-12 
                  ${activeTool === tool.id ? 'animate-tool-select' : ''}
                  ${tool.id === 'magicWand' && activeTool === tool.id ? 'tool-button-wand' : ''}
                  ${tool.id === 'magicLasso' && activeTool === tool.id ? 'tool-button-lasso' : ''}
                `}
                onClick={() => setActiveTool(tool.id)}
              >
                <Icon className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{tool.label} ({tool.shortcut})</p>
            </TooltipContent>
          </Tooltip>
        );
      })}

      {/* Separator */}
      <div className="w-8 h-px bg-border my-2" />

      {/* History Tools */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="tool-button w-12 h-12">
            <Undo className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Undo (Ctrl+Z)</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="tool-button w-12 h-12">
            <Redo className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Redo (Ctrl+Y)</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};