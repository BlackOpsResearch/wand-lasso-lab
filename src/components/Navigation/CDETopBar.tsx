import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { 
  Settings, User, FileText, Plus, Ruler, Crosshair, Magnet, 
  Monitor, SplitSquareHorizontal, ZoomIn, Undo, Redo, History,
  Mic, Volume2, AlignHorizontalJustifyCenter, Image, Music, Film,
  LayoutGrid, Users, Box, Sparkles
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CDETopBarProps {
  projectName?: string;
  onNewProject?: () => void;
  onRulerToggle?: () => void;
  onCursorGuidesToggle?: () => void;
  onSnapToggle?: () => void;
  onAlignCanvas?: () => void;
  onSplitView?: () => void;
}

export const CDETopBar: React.FC<CDETopBarProps> = ({
  projectName = "Untitled Project",
  onNewProject,
  onRulerToggle,
  onCursorGuidesToggle,
  onSnapToggle,
  onAlignCanvas,
  onSplitView,
}) => {
  const [magnifier1, setMagnifier1] = useState(100);
  const [magnifier2, setMagnifier2] = useState(200);
  const [activeMagnifier, setActiveMagnifier] = useState<1 | 2>(1);
  const [showMag1Slider, setShowMag1Slider] = useState(false);
  const [showMag2Slider, setShowMag2Slider] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const pages = [
    { path: '/', label: 'Images', icon: Image },
    { path: '/audio', label: 'Audio', icon: Music },
    { path: '/video', label: 'Video', icon: Film },
    { path: '/storyboard', label: 'Storyboard', icon: LayoutGrid },
    { path: '/characters', label: 'Characters', icon: Users },
    { path: '/props-scenes', label: 'Props/Scenes', icon: Box },
    { path: '/effects', label: 'Effects', icon: Sparkles },
  ];

  return (
    <div className="h-14 bg-editor-toolbar border-b border-border flex items-center px-4 gap-3">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Settings className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>App Settings</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <User className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Account</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <FileText className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Project Settings</TooltipContent>
        </Tooltip>

      <Separator orientation="vertical" className="h-6" />

      {/* Page Navigation */}
      <div className="flex items-center gap-1">
        {pages.map((page) => {
          const Icon = page.icon;
          const isActive = location.pathname === page.path;
          return (
            <Tooltip key={page.path}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    "h-8 px-3 text-xs gap-1.5",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => navigate(page.path)}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {page.label}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{page.label} Editor</TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <Separator orientation="vertical" className="h-6" />

        <Button variant="outline" size="sm" className="text-xs">
          {projectName}
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={onNewProject}>
              <Plus className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Project</TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Right Section - Tools */}
      <div className="flex-1 flex items-center justify-end gap-2">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onRulerToggle}>
                <Ruler className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Rulers</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onCursorGuidesToggle}>
                <Crosshair className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cursor Guides</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onSnapToggle}>
                <Magnet className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Snap to Grid</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onAlignCanvas}>
                <AlignHorizontalJustifyCenter className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Canvas</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onSplitView}>
                <SplitSquareHorizontal className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Split View</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Magnifiers */}
        <div className="flex items-center gap-1 relative">
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={activeMagnifier === 1 ? "default" : "ghost"} 
                  size="sm" 
                  className="h-8 px-2 text-xs"
                  onClick={() => setActiveMagnifier(1)}
                  onMouseEnter={() => setShowMag1Slider(true)}
                  onMouseLeave={() => setShowMag1Slider(false)}
                >
                  <ZoomIn className="w-3 h-3 mr-1" />
                  1
                </Button>
              </TooltipTrigger>
              <TooltipContent>Magnifier 1</TooltipContent>
            </Tooltip>
            {showMag1Slider && (
              <div 
                className="absolute top-full left-0 mt-1 w-32 bg-popover border border-border rounded-lg p-2 shadow-panel z-50"
                onMouseEnter={() => setShowMag1Slider(true)}
                onMouseLeave={() => setShowMag1Slider(false)}
              >
                <Slider 
                  value={[magnifier1]} 
                  onValueChange={([v]) => setMagnifier1(v)}
                  min={10}
                  max={500}
                  step={10}
                />
                <div className="text-xs text-center mt-1">{magnifier1}%</div>
              </div>
            )}
          </div>

          <span className="text-xs text-muted-foreground">{activeMagnifier === 1 ? magnifier1 : magnifier2}%</span>

          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={activeMagnifier === 2 ? "default" : "ghost"} 
                  size="sm" 
                  className="h-8 px-2 text-xs"
                  onClick={() => setActiveMagnifier(2)}
                  onMouseEnter={() => setShowMag2Slider(true)}
                  onMouseLeave={() => setShowMag2Slider(false)}
                >
                  <ZoomIn className="w-3 h-3 mr-1" />
                  2
                </Button>
              </TooltipTrigger>
              <TooltipContent>Magnifier 2</TooltipContent>
            </Tooltip>
            {showMag2Slider && (
              <div 
                className="absolute top-full right-0 mt-1 w-32 bg-popover border border-border rounded-lg p-2 shadow-panel z-50"
                onMouseEnter={() => setShowMag2Slider(true)}
                onMouseLeave={() => setShowMag2Slider(false)}
              >
                <Slider 
                  value={[magnifier2]} 
                  onValueChange={([v]) => setMagnifier2(v)}
                  min={10}
                  max={500}
                  step={10}
                />
                <div className="text-xs text-center mt-1">{magnifier2}%</div>
              </div>
            )}
          </div>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* History Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Undo className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Redo className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>

          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-8 h-8"
                  onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                >
                  <History className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>History</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Voice Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Volume2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Text to Speech</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Mic className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Speech to Text</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
