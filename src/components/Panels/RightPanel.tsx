import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Settings, Layers, Palette } from 'lucide-react';
import { useToolContext } from '../Context/ToolContext';
import { useLayerContext } from '../Context/LayerContext';

interface RightPanelProps {
  onClose: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ onClose }) => {
  const { activeTool, toolSettings, updateToolSettings } = useToolContext();
  const { layers, activeLayerId, setActiveLayer, updateLayer } = useLayerContext();

  return (
    <div className="editor-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold">Settings</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="tools" className="w-full">
          <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
            <TabsTrigger value="tools">
              <Settings className="w-4 h-4 mr-1" />
              Tools
            </TabsTrigger>
            <TabsTrigger value="layers">
              <Layers className="w-4 h-4 mr-1" />
              Layers
            </TabsTrigger>
            <TabsTrigger value="presets">
              <Palette className="w-4 h-4 mr-1" />
              Presets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tools" className="p-4 space-y-4">
            {activeTool === 'magicWand' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Magic Wand Settings</CardTitle>
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
                      step={1}
                      className="mt-2"
                    />
                    <span className="text-xs text-muted-foreground">
                      {toolSettings.magicWand.tolerance}
                    </span>
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
                        <SelectItem value="Quaternion">Quaternion</SelectItem>
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
            )}

            {activeTool === 'magicLasso' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Magic Lasso Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Node Drop Time (ms)</label>
                    <Slider
                      value={[toolSettings.magicLasso.nodeDropTime]}
                      onValueChange={([value]) =>
                        updateToolSettings('magicLasso', { nodeDropTime: value })
                      }
                      min={50}
                      max={500}
                      step={50}
                      className="mt-2"
                    />
                    <span className="text-xs text-muted-foreground">
                      {toolSettings.magicLasso.nodeDropTime}ms
                    </span>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Elasticity</label>
                    <Slider
                      value={[toolSettings.magicLasso.elasticity * 100]}
                      onValueChange={([value]) =>
                        updateToolSettings('magicLasso', { elasticity: value / 100 })
                      }
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                    <span className="text-xs text-muted-foreground">
                      {Math.round(toolSettings.magicLasso.elasticity * 100)}%
                    </span>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Cost Function</label>
                    <Select
                      value={toolSettings.magicLasso.costFunction}
                      onValueChange={(value: any) =>
                        updateToolSettings('magicLasso', { costFunction: value })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sobel">Sobel Edge</SelectItem>
                        <SelectItem value="gradient">Gradient</SelectItem>
                        <SelectItem value="texture">Texture</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="layers" className="p-4 space-y-2">
            {layers.map((layer) => (
              <Card
                key={layer.id}
                className={`cursor-pointer transition-colors ${
                  activeLayerId === layer.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setActiveLayer(layer.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{layer.name}</span>
                    <Switch
                      checked={layer.visible}
                      onCheckedChange={(checked) =>
                        updateLayer(layer.id, { visible: checked })
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="mt-2">
                    <label className="text-xs text-muted-foreground">Opacity</label>
                    <Slider
                      value={[layer.opacity]}
                      onValueChange={([value]) =>
                        updateLayer(layer.id, { opacity: value })
                      }
                      max={100}
                      step={1}
                      className="mt-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="presets" className="p-4 space-y-2">
            <Card className="cursor-pointer hover:bg-accent">
              <CardContent className="p-3">
                <h4 className="text-sm font-medium">Green Screen</h4>
                <p className="text-xs text-muted-foreground">High saturation tolerance, global selection</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-accent">
              <CardContent className="p-3">
                <h4 className="text-sm font-medium">Texture Fusion</h4>
                <p className="text-xs text-muted-foreground">QGF enabled, GLCM homogeneity</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-accent">
              <CardContent className="p-3">
                <h4 className="text-sm font-medium">Precise Edge</h4>
                <p className="text-xs text-muted-foreground">Low tolerance, 8-connectivity</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};