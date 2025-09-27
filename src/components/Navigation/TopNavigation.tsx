import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Image, Download, Upload } from 'lucide-react';

interface TopNavigationProps {
  activeView: 'main' | 'compare';
  onViewChange: (view: 'main' | 'compare') => void;
  onToggleSpecialPanel: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  activeView,
  onViewChange,
  onToggleSpecialPanel,
}) => {
  return (
    <div className="editor-toolbar h-14 flex items-center justify-between px-4 border-b border-border">
      {/* Left: Logo & Views */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Image className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold">Magic Editor</h1>
        </div>
        
        <Tabs value={activeView} onValueChange={(value: any) => onViewChange(value)}>
          <TabsList>
            <TabsTrigger value="main">Main Editor</TabsTrigger>
            <TabsTrigger value="compare">Compare Mode</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Center: Quick Actions */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Import
        </Button>
        <Button variant="ghost" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Right: Analytics Toggle */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSpecialPanel}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Analytics
        </Button>
      </div>
    </div>
  );
};