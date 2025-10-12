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
                  className="relative w-10 h-10"
                  onMouseEnter={() => setHoveredButton(panel.id)}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  {/* Hover overlay with 3-rectangle split */}
                  {isHovered && (
                    <div className="absolute inset-0 z-10 flex">
                      {/* Left half - Full panel */}
                      <button
                        className="w-1/2 h-full bg-primary/10 hover:bg-primary/20 border-r border-border/50 transition-colors"
                        onClick={() => handlePanelToggle(panel.id, 'full')}
                        title="Full Panel"
                      />
                      {/* Right half split */}
                      <div className="w-1/2 h-full flex flex-col">
                        <button
                          className="flex-1 bg-accent/10 hover:bg-accent/20 border-b border-border/50 transition-colors"
                          onClick={() => handlePanelToggle(panel.id, 'top')}
                          title="Top Half"
                        />
                        <button
                          className="flex-1 bg-accent/10 hover:bg-accent/20 transition-colors"
                          onClick={() => handlePanelToggle(panel.id, 'bottom')}
                          title="Bottom Half"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Main icon button */}
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="icon"
                    className="w-full h-full relative"
                    onClick={() => handlePanelToggle(panel.id, 'full')}
                  >
                    <Icon className="w-5 h-5" />
                  </Button>
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
