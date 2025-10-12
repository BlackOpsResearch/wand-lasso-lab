import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToolContext } from '@/components/Context/ToolContext';
import { cn } from '@/lib/utils';

export const ToolSettingsPanel: React.FC = () => {
  const { activeTool, toolSettings, updateToolSettings } = useToolContext();

  const renderMagicWandSettings = () => (
    <div className="space-y-2">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-[10px]">Tolerance</Label>
          <span className="text-[10px] text-muted-foreground">{toolSettings.magicWand.tolerance}</span>
        </div>
        <Slider
          value={[toolSettings.magicWand.tolerance]}
          onValueChange={([val]) => updateToolSettings('magicWand', { tolerance: val })}
          min={0}
          max={255}
          step={1}
          className="h-1"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-[10px]">Contiguous</Label>
        <Switch
          checked={toolSettings.magicWand.contiguous}
          onCheckedChange={(val) => updateToolSettings('magicWand', { contiguous: val })}
          className="scale-75"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-[10px]">Anti-alias</Label>
        <Switch
          checked={toolSettings.magicWand.antiAlias}
          onCheckedChange={(val) => updateToolSettings('magicWand', { antiAlias: val })}
          className="scale-75"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-[10px]">Color Space</Label>
        <Select
          value={toolSettings.magicWand.colorSpace}
          onValueChange={(val: 'RGB' | 'HSV' | 'LAB') => updateToolSettings('magicWand', { colorSpace: val })}
        >
          <SelectTrigger className="h-6 text-[10px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="RGB" className="text-[10px]">RGB</SelectItem>
            <SelectItem value="HSV" className="text-[10px]">HSV</SelectItem>
            <SelectItem value="LAB" className="text-[10px]">LAB</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderMagicLassoSettings = () => (
    <div className="space-y-2">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-[10px]">Width</Label>
          <span className="text-[10px] text-muted-foreground">{toolSettings.magicLasso.width}</span>
        </div>
        <Slider
          value={[toolSettings.magicLasso.width]}
          onValueChange={([val]) => updateToolSettings('magicLasso', { width: val })}
          min={1}
          max={10}
          step={1}
          className="h-1"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-[10px]">Contrast</Label>
          <span className="text-[10px] text-muted-foreground">{toolSettings.magicLasso.contrast}</span>
        </div>
        <Slider
          value={[toolSettings.magicLasso.contrast]}
          onValueChange={([val]) => updateToolSettings('magicLasso', { contrast: val })}
          min={0}
          max={100}
          step={1}
          className="h-1"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-[10px]">Frequency</Label>
          <span className="text-[10px] text-muted-foreground">{toolSettings.magicLasso.frequency}</span>
        </div>
        <Slider
          value={[toolSettings.magicLasso.frequency]}
          onValueChange={([val]) => updateToolSettings('magicLasso', { frequency: val })}
          min={0}
          max={100}
          step={1}
          className="h-1"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-[10px]">Predictive</Label>
        <Switch
          checked={toolSettings.magicLasso.predictiveMode}
          onCheckedChange={(val) => updateToolSettings('magicLasso', { predictiveMode: val })}
          className="scale-75"
        />
      </div>
    </div>
  );

  const renderBrushSettings = () => (
    <div className="space-y-2">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-[10px]">Size</Label>
          <span className="text-[10px] text-muted-foreground">{toolSettings.brush.size}px</span>
        </div>
        <Slider
          value={[toolSettings.brush.size]}
          onValueChange={([val]) => updateToolSettings('brush', { size: val })}
          min={1}
          max={100}
          step={1}
          className="h-1"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-[10px]">Hardness</Label>
          <span className="text-[10px] text-muted-foreground">{toolSettings.brush.hardness}%</span>
        </div>
        <Slider
          value={[toolSettings.brush.hardness]}
          onValueChange={([val]) => updateToolSettings('brush', { hardness: val })}
          min={0}
          max={100}
          step={1}
          className="h-1"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-[10px]">Opacity</Label>
          <span className="text-[10px] text-muted-foreground">{toolSettings.brush.opacity}%</span>
        </div>
        <Slider
          value={[toolSettings.brush.opacity]}
          onValueChange={([val]) => updateToolSettings('brush', { opacity: val })}
          min={0}
          max={100}
          step={1}
          className="h-1"
        />
      </div>
    </div>
  );

  const renderPenSettings = () => (
    <div className="space-y-2">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-[10px]">Thickness</Label>
          <span className="text-[10px] text-muted-foreground">{toolSettings.pen.thickness}px</span>
        </div>
        <Slider
          value={[toolSettings.pen.thickness]}
          onValueChange={([val]) => updateToolSettings('pen', { thickness: val })}
          min={1}
          max={20}
          step={1}
          className="h-1"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-[10px]">Style</Label>
        <Select
          value={toolSettings.pen.style}
          onValueChange={(val: 'solid' | 'dashed' | 'dotted') => updateToolSettings('pen', { style: val })}
        >
          <SelectTrigger className="h-6 text-[10px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid" className="text-[10px]">Solid</SelectItem>
            <SelectItem value="dashed" className="text-[10px]">Dashed</SelectItem>
            <SelectItem value="dotted" className="text-[10px]">Dotted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-[10px]">Color</Label>
        <input
          type="color"
          value={toolSettings.pen.color}
          onChange={(e) => updateToolSettings('pen', { color: e.target.value })}
          className="w-full h-6 rounded cursor-pointer"
        />
      </div>
    </div>
  );

  const getToolSettings = () => {
    switch (activeTool) {
      case 'magicWand':
        return renderMagicWandSettings();
      case 'magicLasso':
        return renderMagicLassoSettings();
      case 'brush':
      case 'eraser':
        return renderBrushSettings();
      case 'pen':
        return renderPenSettings();
      default:
        return (
          <div className="text-[10px] text-muted-foreground text-center py-4">
            Select a tool to see its settings
          </div>
        );
    }
  };

  return (
    <div className="w-16 bg-editor-toolbar border-r border-border flex flex-col h-full overflow-auto">
      <div className="p-2 border-b border-border">
        <h4 className="text-[10px] font-semibold truncate">{activeTool || 'Tool'}</h4>
      </div>
      
      <div className="flex-1 p-2">
        {getToolSettings()}
      </div>
    </div>
  );
};
