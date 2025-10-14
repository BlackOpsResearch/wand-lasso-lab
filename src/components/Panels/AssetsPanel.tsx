import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Search, FolderOpen, Image, Trash2, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  thumbnail?: string;
  url: string;
  size: string;
}

export const AssetsPanel: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAsset: Asset = {
          id: `asset-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 
                file.type.startsWith('video/') ? 'video' : 'audio',
          thumbnail: event.target?.result as string,
          url: event.target?.result as string,
          size: `${(file.size / 1024).toFixed(1)} KB`
        };
        setAssets(prev => [...prev, newAsset]);
      };
      reader.readAsDataURL(file);
    });

    toast.success(`${files.length} file(s) uploaded`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-editor-panel border-l border-border flex flex-col h-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-editor-accent" />
            Assets
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-3 h-3 mr-1" />
            Upload
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="text-xs pl-7 h-8"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="all" className="h-full flex flex-col">
          <TabsList className="w-full grid grid-cols-4 rounded-none border-b">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="images" className="text-xs">Images</TabsTrigger>
            <TabsTrigger value="videos" className="text-xs">Videos</TabsTrigger>
            <TabsTrigger value="audio" className="text-xs">Audio</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="flex-1 overflow-auto p-2 mt-0">
            <AssetGrid assets={filteredAssets} onDelete={(id) => setAssets(prev => prev.filter(a => a.id !== id))} />
          </TabsContent>

          <TabsContent value="images" className="flex-1 overflow-auto p-2 mt-0">
            <AssetGrid assets={filteredAssets.filter(a => a.type === 'image')} onDelete={(id) => setAssets(prev => prev.filter(a => a.id !== id))} />
          </TabsContent>

          <TabsContent value="videos" className="flex-1 overflow-auto p-2 mt-0">
            <AssetGrid assets={filteredAssets.filter(a => a.type === 'video')} onDelete={(id) => setAssets(prev => prev.filter(a => a.id !== id))} />
          </TabsContent>

          <TabsContent value="audio" className="flex-1 overflow-auto p-2 mt-0">
            <AssetGrid assets={filteredAssets.filter(a => a.type === 'audio')} onDelete={(id) => setAssets(prev => prev.filter(a => a.id !== id))} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-border text-xs text-muted-foreground">
        {assets.length} asset{assets.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

const AssetGrid: React.FC<{ assets: Asset[]; onDelete: (id: string) => void }> = ({ assets, onDelete }) => {
  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <Image className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-xs">No assets yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="group relative aspect-square bg-muted rounded border border-border overflow-hidden hover:border-primary transition-colors"
        >
          {asset.type === 'image' && asset.thumbnail && (
            <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
          )}
          {asset.type !== 'image' && (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs text-muted-foreground uppercase">{asset.type}</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2">
            <p className="text-xs text-white text-center truncate w-full">{asset.name}</p>
            <p className="text-[10px] text-white/70">{asset.size}</p>
            <div className="flex gap-1 mt-1">
              <Button
                variant="secondary"
                size="icon"
                className="w-6 h-6"
                onClick={() => onDelete(asset.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="w-6 h-6"
                onClick={() => toast.success('Added to canvas')}
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
