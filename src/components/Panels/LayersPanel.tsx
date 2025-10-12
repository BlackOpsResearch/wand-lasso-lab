import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Eye, EyeOff, Lock, Unlock, Trash2, Settings, Plus, Upload } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLayerContext } from '@/components/Context/LayerContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Modifier {
  id: string;
  type: 'transparency' | 'mask' | 'effect' | 'filter';
  name: string;
  enabled: boolean;
  settings: Record<string, any>;
}

export const LayersPanel: React.FC = () => {
  const { layers, activeLayerId, setActiveLayer, updateLayer, removeLayer, reorderLayers, addLayer } = useLayerContext();
  const [draggedLayer, setDraggedLayer] = useState<string | null>(null);
  const [layerModifiers, setLayerModifiers] = useState<Record<string, Modifier[]>>({});
  const [expandedModifiers, setExpandedModifiers] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = (layerId: string) => {
    setDraggedLayer(layerId);
  };

  const handleDragOver = (e: React.DragEvent, targetLayerId: string) => {
    e.preventDefault();
    if (!draggedLayer || draggedLayer === targetLayerId) return;
    
    const sourceIndex = layers.findIndex(l => l.id === draggedLayer);
    const targetIndex = layers.findIndex(l => l.id === targetLayerId);
    
    if (sourceIndex !== -1 && targetIndex !== -1) {
      reorderLayers(sourceIndex, targetIndex);
    }
  };

  const handleDrop = () => {
    setDraggedLayer(null);
  };

  const addModifier = (layerId: string, type: Modifier['type']) => {
    const newModifier: Modifier = {
      id: `${layerId}-${type}-${Date.now()}`,
      type,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      enabled: true,
      settings: {}
    };
    
    setLayerModifiers(prev => ({
      ...prev,
      [layerId]: [...(prev[layerId] || []), newModifier]
    }));
  };

  const toggleModifier = (layerId: string, modifierId: string) => {
    setLayerModifiers(prev => ({
      ...prev,
      [layerId]: prev[layerId]?.map(m => 
        m.id === modifierId ? { ...m, enabled: !m.enabled } : m
      ) || []
    }));
  };

  const removeModifier = (layerId: string, modifierId: string) => {
    setLayerModifiers(prev => ({
      ...prev,
      [layerId]: prev[layerId]?.filter(m => m.id !== modifierId) || []
    }));
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          addLayer(`Uploaded: ${file.name}`, imageData);
          toast.success('Image uploaded to new layer');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-80 bg-editor-panel border-l border-border flex flex-col h-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold">Layers</h3>
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-6 h-6"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Upload Image</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-6 h-6"
                onClick={() => addLayer('New Layer')}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>New Layer</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {layers.map((layer, index) => {
          const isActive = layer.id === activeLayerId;
          const modifiers = layerModifiers[layer.id] || [];
          const isExpanded = expandedModifiers[layer.id];

          return (
            <div
              key={layer.id}
              className={cn(
                "rounded border transition-colors",
                isActive ? "bg-primary/10 border-primary" : "bg-editor-toolbar border-border hover:border-primary/50"
              )}
              draggable
              onDragStart={() => handleDragStart(layer.id)}
              onDragOver={(e) => handleDragOver(e, layer.id)}
              onDrop={handleDrop}
            >
              {/* Layer Header */}
              <div
                className="p-2 cursor-pointer"
                onClick={() => setActiveLayer(layer.id)}
              >
                <div className="flex items-center gap-2">
                  {/* Thumbnail */}
                  <div className="w-10 h-10 bg-muted rounded border border-border flex-shrink-0">
                    {layer.data && (
                      <canvas
                        width={40}
                        height={40}
                        ref={(canvas) => {
                          if (canvas && layer.data) {
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              ctx.putImageData(layer.data, 0, 0);
                            }
                          }
                        }}
                        className="w-full h-full rounded"
                      />
                    )}
                  </div>

                  {/* Layer Name */}
                  <span className="text-xs flex-1 truncate">{layer.name}</span>

                  {/* Controls */}
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-5 h-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateLayer(layer.id, { visible: !layer.visible });
                          }}
                        >
                          {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Toggle visibility</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-5 h-5"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedModifiers(prev => ({ ...prev, [layer.id]: !prev[layer.id] }));
                          }}
                        >
                          <Settings className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Settings</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-5 h-5"
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            removeLayer(layer.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Double-click to delete</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Opacity Slider */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-12">Opacity</span>
                  <Slider
                    value={[layer.opacity]}
                    onValueChange={([value]) => updateLayer(layer.id, { opacity: value })}
                    min={0}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-8">{layer.opacity}%</span>
                </div>
              </div>

              {/* Modifiers */}
              {isExpanded && (
                <div className="border-t border-border p-2 space-y-1">
                  <div className="text-xs font-medium mb-1">Modifiers ({modifiers.length})</div>
                  
                  {/* Add Modifier Buttons */}
                  <div className="flex gap-1 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-6 flex-1"
                      onClick={() => addModifier(layer.id, 'transparency')}
                    >
                      +Trans
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-6 flex-1"
                      onClick={() => addModifier(layer.id, 'mask')}
                    >
                      +Mask
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-6 flex-1"
                      onClick={() => addModifier(layer.id, 'effect')}
                    >
                      +Effect
                    </Button>
                  </div>

                  {/* Modifier List */}
                  {modifiers.map((modifier) => (
                    <div
                      key={modifier.id}
                      className="bg-muted rounded p-2 flex items-center gap-2"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-5 h-5"
                        onClick={() => toggleModifier(layer.id, modifier.id)}
                      >
                        <Eye className={cn("w-3 h-3", !modifier.enabled && "opacity-30")} />
                      </Button>
                      <span className={cn("text-xs flex-1", !modifier.enabled && "opacity-50")}>
                        {modifier.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-5 h-5"
                        onClick={() => removeModifier(layer.id, modifier.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
