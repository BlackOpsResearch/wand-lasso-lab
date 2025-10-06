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
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="w-4 h-4" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Invert
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Grow
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
              Shrink
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="w-4 h-4" />
            Presets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" size="sm" className="h-9 justify-start">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Green
            </Button>
            <Button variant="ghost" size="sm" className="h-9 justify-start">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Portrait
            </Button>
            <Button variant="ghost" size="sm" className="h-9 justify-start">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              Sky
            </Button>
            <Button variant="ghost" size="sm" className="h-9 justify-start">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Object
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};