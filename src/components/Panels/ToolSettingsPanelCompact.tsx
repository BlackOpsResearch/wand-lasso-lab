import React from 'react';
import { Button } from '@/components/ui/button';
import { Maximize2 } from 'lucide-react';
import { useToolContext } from '@/components/Context/ToolContext';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface ToolSettingsPanelCompactProps {
  collapsed: boolean;
  onExpand?: () => void;
}

export const ToolSettingsPanelCompact: React.FC<ToolSettingsPanelCompactProps> = ({ 
  collapsed,
  onExpand
}) => {
  const { activeTool, toolSettings, updateToolSettings } = useToolContext();

  if (collapsed) return null;

  return (
    <div className="w-48 bg-editor-toolbar border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold truncate">{activeTool || 'Tool Settings'}</span>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          onClick={onExpand}
          title="Expand Settings"
        >
          <Maximize2 className="w-3 h-3" />
        </Button>
      </div>

      {/* Compact Settings */}
      <div className="flex-1 overflow-auto p-2 space-y-3">
        {activeTool === 'magicWand' && (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Tolerance</span>
                <span className="text-muted-foreground">{toolSettings.magicWand.tolerance}</span>
              </div>
              <Slider
                value={[toolSettings.magicWand.tolerance]}
                onValueChange={([val]) => updateToolSettings('magicWand', { tolerance: val })}
                min={0}
                max={255}
                className="h-1.5"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs">Contiguous</span>
              <Switch
                checked={toolSettings.magicWand.contiguous}
                onCheckedChange={(val) => updateToolSettings('magicWand', { contiguous: val })}
                className="scale-90"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs">Anti-alias</span>
              <Switch
                checked={toolSettings.magicWand.antiAlias}
                onCheckedChange={(val) => updateToolSettings('magicWand', { antiAlias: val })}
                className="scale-90"
              />
            </div>
          </>
        )}

        {activeTool === 'magicLasso' && (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Width</span>
                <span className="text-muted-foreground">{toolSettings.magicLasso.width}</span>
              </div>
              <Slider
                value={[toolSettings.magicLasso.width]}
                onValueChange={([val]) => updateToolSettings('magicLasso', { width: val })}
                min={1}
                max={10}
                className="h-1.5"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Contrast</span>
                <span className="text-muted-foreground">{toolSettings.magicLasso.contrast}</span>
              </div>
              <Slider
                value={[toolSettings.magicLasso.contrast]}
                onValueChange={([val]) => updateToolSettings('magicLasso', { contrast: val })}
                min={0}
                max={100}
                className="h-1.5"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs">Predictive</span>
              <Switch
                checked={toolSettings.magicLasso.predictiveMode}
                onCheckedChange={(val) => updateToolSettings('magicLasso', { predictiveMode: val })}
                className="scale-90"
              />
            </div>
          </>
        )}

        {(activeTool === 'brush' || activeTool === 'eraser') && (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Size</span>
                <span className="text-muted-foreground">{toolSettings.brush.size}px</span>
              </div>
              <Slider
                value={[toolSettings.brush.size]}
                onValueChange={([val]) => updateToolSettings('brush', { size: val })}
                min={1}
                max={100}
                className="h-1.5"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Hardness</span>
                <span className="text-muted-foreground">{toolSettings.brush.hardness}%</span>
              </div>
              <Slider
                value={[toolSettings.brush.hardness]}
                onValueChange={([val]) => updateToolSettings('brush', { hardness: val })}
                min={0}
                max={100}
                className="h-1.5"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Opacity</span>
                <span className="text-muted-foreground">{toolSettings.brush.opacity}%</span>
              </div>
              <Slider
                value={[toolSettings.brush.opacity]}
                onValueChange={([val]) => updateToolSettings('brush', { opacity: val })}
                min={0}
                max={100}
                className="h-1.5"
              />
            </div>
          </>
        )}

        {activeTool === 'pen' && (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Thickness</span>
                <span className="text-muted-foreground">{toolSettings.pen.thickness}px</span>
              </div>
              <Slider
                value={[toolSettings.pen.thickness]}
                onValueChange={([val]) => updateToolSettings('pen', { thickness: val })}
                min={1}
                max={20}
                className="h-1.5"
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs">Color</span>
              <input
                type="color"
                value={toolSettings.pen.color}
                onChange={(e) => updateToolSettings('pen', { color: e.target.value })}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
          </>
        )}

        {!['magicWand', 'magicLasso', 'brush', 'eraser', 'pen'].includes(activeTool) && (
          <div className="text-xs text-muted-foreground text-center py-8">
            No settings for this tool
          </div>
        )}
      </div>
    </div>
  );
};
