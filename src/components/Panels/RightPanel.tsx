import React from 'react';
import { useToolContext } from '../Context/ToolContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { 
  Wand2, 
  Lasso, 
  Brush, 
  Eraser, 
  ZoomIn,
  Hand,
  Settings,
  Layers,
  Palette
} from 'lucide-react';

export const RightPanel: React.FC = () => {
  const { activeTool, toolSettings, updateToolSettings } = useToolContext();

  const renderMagicWandSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-4 h-4" />
          Magic Wand Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Tolerance</label>
          <Slider
            value={[toolSettings.magicWand.tolerance]}
            onValueChange={([value]) =>
              updateToolSettings('magicWand', { tolerance: value })
            }
            max={100}
            min={0}
            step={1}
            className="mt-2"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {toolSettings.magicWand.tolerance}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Contiguous</label>
          <Switch
            checked={toolSettings.magicWand.contiguous}
            onCheckedChange={(checked) =>
              updateToolSettings('magicWand', { contiguous: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Anti-Alias</label>
          <Switch
            checked={toolSettings.magicWand.antiAlias}
            onCheckedChange={(checked) =>
              updateToolSettings('magicWand', { antiAlias: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Sample All Layers</label>
          <Switch
            checked={toolSettings.magicWand.sampleAllLayers}
            onCheckedChange={(checked) =>
              updateToolSettings('magicWand', { sampleAllLayers: checked })
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">Color Space</label>
          <Select
            value={toolSettings.magicWand.colorSpace}
            onValueChange={(value: any) =>
              updateToolSettings('magicWand', { colorSpace: value })
            }
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RGB">RGB</SelectItem>
              <SelectItem value="HSV">HSV</SelectItem>
              <SelectItem value="LAB">LAB</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Connectivity</label>
          <Select
            value={toolSettings.magicWand.connectivity.toString()}
            onValueChange={(value) =>
              updateToolSettings('magicWand', { connectivity: parseInt(value) as 4 | 8 })
            }
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4-Connected</SelectItem>
              <SelectItem value="8">8-Connected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  const renderMagicLassoSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lasso className="w-4 h-4" />
          Magic Lasso Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Width</label>
          <Slider
            value={[toolSettings.magicLasso.width]}
            onValueChange={([value]) =>
              updateToolSettings('magicLasso', { width: value })
            }
            max={10}
            min={1}
            step={1}
            className="mt-2"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {toolSettings.magicLasso.width}px
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Contrast</label>
          <Slider
            value={[toolSettings.magicLasso.contrast]}
            onValueChange={([value]) =>
              updateToolSettings('magicLasso', { contrast: value })
            }
            max={100}
            min={0}
            step={1}
            className="mt-2"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {toolSettings.magicLasso.contrast}%
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Frequency</label>
          <Slider
            value={[toolSettings.magicLasso.frequency]}
            onValueChange={([value]) =>
              updateToolSettings('magicLasso', { frequency: value })
            }
            max={100}
            min={0}
            step={1}
            className="mt-2"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {toolSettings.magicLasso.frequency}%
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Elasticity</label>
          <Slider
            value={[toolSettings.magicLasso.elasticity * 100]}
            onValueChange={([value]) =>
              updateToolSettings('magicLasso', { elasticity: value / 100 })
            }
            max={100}
            min={0}
            step={5}
            className="mt-2"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {Math.round(toolSettings.magicLasso.elasticity * 100)}%
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Node Drop Time</label>
          <Slider
            value={[toolSettings.magicLasso.nodeDropTime]}
            onValueChange={([value]) =>
              updateToolSettings('magicLasso', { nodeDropTime: value })
            }
            max={500}
            min={50}
            step={10}
            className="mt-2"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {toolSettings.magicLasso.nodeDropTime}ms
          </div>
        </div>

        <Separator />

        <div>
          <label className="text-sm font-medium">Perpendicular Bias</label>
          <Slider
            value={[toolSettings.magicLasso.perpBias * 100]}
            onValueChange={([value]) =>
              updateToolSettings('magicLasso', { perpBias: value / 100 })
            }
            max={100}
            min={0}
            step={5}
            className="mt-2"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {Math.round(toolSettings.magicLasso.perpBias * 100)}%
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Falloff Sigma</label>
          <Slider
            value={[toolSettings.magicLasso.falloffSigma]}
            onValueChange={([value]) =>
              updateToolSettings('magicLasso', { falloffSigma: value })
            }
            max={50}
            min={10}
            step={5}
            className="mt-2"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {toolSettings.magicLasso.falloffSigma}°
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Predictive Mode</label>
          <div className="flex items-center space-x-2 mt-2">
            <Switch
              checked={toolSettings.magicLasso.predictiveMode}
              onCheckedChange={(checked) =>
                updateToolSettings('magicLasso', { predictiveMode: checked })
              }
            />
            <span className="text-xs text-muted-foreground">
              {toolSettings.magicLasso.predictiveMode ? 'On' : 'Off'}
            </span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Hover Radius</label>
          <Slider
            value={[toolSettings.magicLasso.hoverRadius]}
            onValueChange={([value]) =>
              updateToolSettings('magicLasso', { hoverRadius: value })
            }
            max={50}
            min={5}
            step={5}
            className="mt-2"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {toolSettings.magicLasso.hoverRadius}px
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Tolerance</label>
          <Slider
            value={[toolSettings.magicLasso.tolerance]}
            onValueChange={([value]) =>
              updateToolSettings('magicLasso', { tolerance: value })
            }
            max={100}
            min={0}
            step={1}
            className="mt-2"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {toolSettings.magicLasso.tolerance}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderBrushSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brush className="w-4 h-4" />
          Brush Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Size</label>
          <Slider
            value={[toolSettings.brush.size]}
            onValueChange={([value]) =>
              updateToolSettings('brush', { size: value })
            }
            max={100}
            min={1}
            step={1}
            className="mt-2"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {toolSettings.brush.size}px
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Hardness</label>
          <Slider
            value={[toolSettings.brush.hardness]}
            onValueChange={([value]) =>
              updateToolSettings('brush', { hardness: value })
            }
            max={100}
            min={0}
            step={1}
            className="mt-2"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {toolSettings.brush.hardness}%
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Opacity</label>
          <Slider
            value={[toolSettings.brush.opacity]}
            onValueChange={([value]) =>
              updateToolSettings('brush', { opacity: value })
            }
            max={100}
            min={0}
            step={1}
            className="mt-2"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {toolSettings.brush.opacity}%
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-80 p-4 space-y-4 bg-background border-l border-border overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Tool Settings</h2>
        <Badge variant="secondary" className="ml-auto">
          {activeTool}
        </Badge>
      </div>

      {activeTool === 'magicWand' && renderMagicWandSettings()}
      {activeTool === 'magicLasso' && renderMagicLassoSettings()}
      {activeTool === 'brush' && renderBrushSettings()}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full">
            Clear Selection
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            Invert Selection
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            Grow Selection
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            Shrink Selection
          </Button>
        </CardContent>
      </Card>

      {/* Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Presets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            Green Screen
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            Portrait Subject
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            Sky Replacement
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            Object Isolation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};