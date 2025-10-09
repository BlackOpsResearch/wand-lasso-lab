import React from 'react';
import { useToolContext, ToolType } from '../Context/ToolContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  MousePointer, Sparkles, Lasso, Crop, Pen, Brush, Eraser,
  Stamp, Sun, Moon, Droplets, Focus, Palette, Shapes, Type,
  Ruler, ZoomIn, Layers, Pipette
} from 'lucide-react';

const tools = [
  { id: 'select' as ToolType, icon: MousePointer, label: 'Select/Transform', shortcut: 'V' },
  { id: 'magicWand' as ToolType, icon: Sparkles, label: 'Magic Wand', shortcut: 'W' },
  { id: 'magicLasso' as ToolType, icon: Lasso, label: 'Magic Lasso', shortcut: 'L' },
  { id: 'crop' as ToolType, icon: Crop, label: 'Crop/Marquee', shortcut: 'M' },
  { id: 'pen' as ToolType, icon: Pen, label: 'Pen/Path', shortcut: 'P' },
  { id: 'brush' as ToolType, icon: Brush, label: 'Brush', shortcut: 'B' },
  { id: 'eraser' as ToolType, icon: Eraser, label: 'Eraser', shortcut: 'E' },
  { id: 'clone' as ToolType, icon: Stamp, label: 'Clone/Stamp', shortcut: 'S' },
  { id: 'dodge' as ToolType, icon: Sun, label: 'Dodge', shortcut: 'O' },
  { id: 'burn' as ToolType, icon: Moon, label: 'Burn', shortcut: 'U' },
  { id: 'blur' as ToolType, icon: Droplets, label: 'Blur', shortcut: 'R' },
  { id: 'sharpen' as ToolType, icon: Focus, label: 'Sharpen', shortcut: 'H' },
  { id: 'gradient' as ToolType, icon: Palette, label: 'Gradient/Fill', shortcut: 'G' },
  { id: 'shapes' as ToolType, icon: Shapes, label: 'Shapes', shortcut: 'U' },
  { id: 'text' as ToolType, icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'nanoBanana' as ToolType, icon: Sparkles, label: 'Nano Banana AI', shortcut: 'N' },
  { id: 'measure' as ToolType, icon: Ruler, label: 'Measure/Guide', shortcut: 'I' },
  { id: 'magnifier' as ToolType, icon: ZoomIn, label: 'Magnifier', shortcut: 'Z' },
];

export const CDELeftToolbar: React.FC = () => {
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
    <div className="w-16 bg-editor-toolbar border-r border-border flex flex-col items-center py-4 gap-1">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant={getToolButtonVariant(tool.id)}
                size="icon"
                className={`
                  w-12 h-12 tool-button
                  ${activeTool === tool.id ? 'animate-tool-select' : ''}
                  ${tool.id === 'magicWand' && activeTool === tool.id ? 'tool-button-wand' : ''}
                  ${tool.id === 'magicLasso' && activeTool === tool.id ? 'tool-button-lasso' : ''}
                  ${tool.id === 'nanoBanana' && activeTool === tool.id ? 'bg-gradient-to-br from-editor-accent to-primary' : ''}
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
    </div>
  );
};
