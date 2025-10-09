import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLayerContext } from '../Context/LayerContext';
import { Eye, EyeOff, Lock, Settings2, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export const SpecialLayersBar: React.FC = () => {
  const { layers, activeLayerId, setActiveLayer, updateLayer, removeLayer } = useLayerContext();
  const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  return (
    <div className="w-20 bg-editor-panel border-l border-border flex flex-col gap-2 p-2 overflow-auto">
      {layers.map((layer) => {
        const isActive = layer.id === activeLayerId;
        const isHovered = layer.id === hoveredLayerId;
        const isSelected = layer.id === selectedLayerId;

        return (
          <div
            key={layer.id}
            className={`
              relative group rounded-lg overflow-hidden cursor-pointer
              ${isActive ? 'ring-2 ring-primary' : 'ring-1 ring-border'}
              ${isHovered ? 'ring-primary/50' : ''}
            `}
            onMouseEnter={() => setHoveredLayerId(layer.id)}
            onMouseLeave={() => setHoveredLayerId(null)}
            onClick={() => {
              setActiveLayer(layer.id);
              setSelectedLayerId(layer.id === selectedLayerId ? null : layer.id);
            }}
          >
            {/* Layer Thumbnail */}
            <div className="w-full aspect-square bg-canvas-bg border-b border-border flex items-center justify-center">
              {layer.data ? (
                <canvas
                  ref={(canvas) => {
                    if (canvas && layer.data) {
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        canvas.width = layer.data.width;
                        canvas.height = layer.data.height;
                        ctx.putImageData(layer.data, 0, 0);
                      }
                    }
                  }}
                  className="max-w-full max-h-full"
                />
              ) : (
                <span className="text-xs text-muted-foreground">Empty</span>
              )}
            </div>

            {/* Modifier Count Badge */}
            {isHovered && (
              <div className="absolute top-1 right-1">
                <Button
                  variant="secondary"
                  size="icon"
                  className="w-6 h-6 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLayerId(layer.id);
                  }}
                >
                  0
                </Button>
              </div>
            )}

            {/* Layer Controls Pop-up */}
            {isSelected && (
              <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg p-2 shadow-panel z-50 space-y-2 min-w-[160px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium truncate">{layer.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLayerId(null);
                    }}
                  >
                    ×
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateLayer(layer.id, { visible: !layer.visible });
                        }}
                      >
                        {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Toggle Visibility</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-7 h-7">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Toggle Mask</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-7 h-7">
                        <Lock className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Lock Layer</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-7 h-7">
                        <Settings2 className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Settings</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLayer(layer.id);
                          setSelectedLayerId(null);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={layer.opacity}
                    onChange={(e) => updateLayer(layer.id, { opacity: parseInt(e.target.value) })}
                    className="w-full h-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-xs">{layer.opacity}%</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
