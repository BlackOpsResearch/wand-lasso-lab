import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Layers, Settings, Wand2, X } from 'lucide-react';

type PanelType = 'layers' | 'inspector' | 'effects' | null;
type PanelSize = 'full' | 'top' | 'bottom';

interface RightPanelBarProps {
  onPanelChange?: (panel: PanelType, size: PanelSize) => void;
}

export const RightPanelBar: React.FC<RightPanelBarProps> = ({ onPanelChange }) => {
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [panelSize, setPanelSize] = useState<PanelSize>('full');
  const [hoveredButton, setHoveredButton] = useState<PanelType>(null);

  const handlePanelToggle = (panel: PanelType, size: PanelSize) => {
    if (activePanel === panel && panelSize === size) {
      setActivePanel(null);
      onPanelChange?.(null, 'full');
    } else {
      setActivePanel(panel);
      setPanelSize(size);
      onPanelChange?.(panel, size);
    }
  };

  const panels = [
    { id: 'layers' as PanelType, icon: Layers, label: 'Layers' },
    { id: 'inspector' as PanelType, icon: Settings, label: 'Inspector' },
    { id: 'effects' as PanelType, icon: Wand2, label: 'Effects' },
  ];

  return (
    <div className="w-12 bg-editor-toolbar border-l border-border flex flex-col items-center py-4 gap-2">
      {panels.map((panel) => {
        const Icon = panel.icon;
        const isActive = activePanel === panel.id;
        const isHovered = hoveredButton === panel.id;

        return (
          <div key={panel.id} className="relative group">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="relative"
                  onMouseEnter={() => setHoveredButton(panel.id)}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="icon"
                    className="w-10 h-10"
                    onClick={() => handlePanelToggle(panel.id, 'full')}
                  >
                    <Icon className="w-5 h-5" />
                  </Button>

                  {/* Split buttons on hover */}
                  {isHovered && (
                    <div className="absolute right-full mr-1 top-0 flex flex-col gap-1 bg-popover border border-border rounded-lg p-1 shadow-panel">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-4 text-xs"
                        onClick={() => handlePanelToggle(panel.id, 'top')}
                        title="Half (Top)"
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-4 text-xs"
                        onClick={() => handlePanelToggle(panel.id, 'bottom')}
                        title="Half (Bottom)"
                      >
                        ↓
                      </Button>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">{panel.label}</TooltipContent>
            </Tooltip>
          </div>
        );
      })}

      {activePanel && (
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 mt-auto"
          onClick={() => handlePanelToggle(null, 'full')}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
