import React, { useState } from 'react';
import { Settings, Layers, Sparkles, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useToolContext } from '../Context/ToolContext';
import { useLayerContext } from '../Context/LayerContext';
import { NanoBananaTool } from '../Tools/NanoBananaTool';

interface RightDrawerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onClose: () => void;
}

export const RightDrawer: React.FC<RightDrawerProps> = ({ canvasRef, onClose }) => {
  const { activeTool, toolSettings, updateToolSettings } = useToolContext();
  const { layers, activeLayerId, setActiveLayer, updateLayer, removeLayer } = useLayerContext();
  const [activeTab, setActiveTab] = useState<string>('settings');

  const renderToolSettings = () => {
    switch (activeTool) {
      case 'magicWand':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Magic Wand Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Tolerance: {toolSettings.magicWand.tolerance}</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={toolSettings.magicWand.tolerance}
                  onChange={(e) => updateToolSettings('magicWand', { tolerance: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={toolSettings.magicWand.contiguous}
                  onChange={(e) => updateToolSettings('magicWand', { contiguous: e.target.checked })}
                  className="rounded"
                />
                <label className="text-xs">Contiguous</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={toolSettings.magicWand.antiAlias}
                  onChange={(e) => updateToolSettings('magicWand', { antiAlias: e.target.checked })}
                  className="rounded"
                />
                <label className="text-xs">Anti-Alias</label>
              </div>
            </div>
          </div>
        );
      case 'magicLasso':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Magic Lasso Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Width: {toolSettings.magicLasso.width}</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={toolSettings.magicLasso.width}
                  onChange={(e) => updateToolSettings('magicLasso', { width: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Contrast: {toolSettings.magicLasso.contrast}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={toolSettings.magicLasso.contrast}
                  onChange={(e) => updateToolSettings('magicLasso', { contrast: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        );
      case 'pen':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Pen Tool Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Thickness: {toolSettings.pen?.thickness || 2}</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={toolSettings.pen?.thickness || 2}
                  onChange={(e) => updateToolSettings('pen', { thickness: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Color</label>
                <input
                  type="color"
                  value={toolSettings.pen?.color || '#000000'}
                  onChange={(e) => updateToolSettings('pen', { color: e.target.value })}
                  className="w-full h-10 rounded"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Style</label>
                <select
                  value={toolSettings.pen?.style || 'solid'}
                  onChange={(e) => updateToolSettings('pen', { style: e.target.value as 'solid' | 'dashed' | 'dotted' })}
                  className="w-full p-2 rounded bg-background border border-border"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>
            </div>
          </div>
        );
      default:
        return <p className="text-sm text-muted-foreground">No settings available for this tool</p>;
    }
  };

  return (
    <div className="w-96 bg-editor-panel border-l border-border h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold">Editor Panel</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 mx-4 mt-2">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="layers" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Layers</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="settings" className="p-4 space-y-4">
            <Card className="p-4">
              {renderToolSettings()}
            </Card>
          </TabsContent>

          <TabsContent value="layers" className="p-4 space-y-2">
            <div className="text-sm font-medium mb-2">Layers ({layers.length})</div>
            <div className="space-y-2">
              {layers.map((layer) => (
                <Card
                  key={layer.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    layer.id === activeLayerId ? 'bg-accent' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => setActiveLayer(layer.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={layer.visible}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateLayer(layer.id, { visible: e.target.checked });
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{layer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={layer.opacity}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateLayer(layer.id, { opacity: Number(e.target.value) });
                        }}
                        className="w-16"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (layer.name !== 'Background') {
                            removeLayer(layer.id);
                          }
                        }}
                        disabled={layer.name === 'Background'}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ai" className="p-4">
            <NanoBananaTool canvasRef={canvasRef} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
