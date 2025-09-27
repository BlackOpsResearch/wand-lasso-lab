import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Image, Palette, FileImage } from 'lucide-react';
import { useImageContext } from '../Context/ImageContext';

interface BottomDrawerProps {
  onClose: () => void;
}

const sampleImages = [
  { id: '1', name: 'Sample 1', url: '/placeholder.svg', description: 'Abstract patterns' },
  { id: '2', name: 'Sample 2', url: '/placeholder.svg', description: 'Nature landscape' },
  { id: '3', name: 'Sample 3', url: '/placeholder.svg', description: 'Portrait photo' },
  { id: '4', name: 'Sample 4', url: '/placeholder.svg', description: 'Geometric shapes' },
];

const presets = [
  { id: '1', name: 'Green Screen Removal', description: 'High tolerance chroma key settings' },
  { id: '2', name: 'Precise Selection', description: 'Low tolerance, edge-aware settings' },
  { id: '3', name: 'Texture Analysis', description: 'GLCM and QGF enabled settings' },
  { id: '4', name: 'Fast Selection', description: 'Optimized for speed settings' },
];

export const BottomDrawer: React.FC<BottomDrawerProps> = ({ onClose }) => {
  const { loadImageFromFile, loadDefaultImage } = useImageContext();
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = (file: File) => {
    if (file.type.startsWith('image/')) {
      loadImageFromFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="editor-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold">Assets & Presets</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="images" className="w-full h-full">
          <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
            <TabsTrigger value="images">
              <Image className="w-4 h-4 mr-1" />
              Images
            </TabsTrigger>
            <TabsTrigger value="presets">
              <Palette className="w-4 h-4 mr-1" />
              Presets
            </TabsTrigger>
            <TabsTrigger value="upload">
              <FileImage className="w-4 h-4 mr-1" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sampleImages.map((image) => (
                <Card key={image.id} className="cursor-pointer hover:bg-accent transition-colors">
                  <CardContent className="p-3">
                    <div className="aspect-square bg-canvas-grid rounded-lg mb-2 flex items-center justify-center">
                      <Image className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h4 className="text-sm font-medium">{image.name}</h4>
                    <p className="text-xs text-muted-foreground">{image.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="presets" className="p-4 space-y-3">
            {presets.map((preset) => (
              <Card key={preset.id} className="cursor-pointer hover:bg-accent transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium">{preset.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="upload" className="p-4">
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragOver ? 'border-primary bg-primary/5' : 'border-border'}
              `}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <FileImage className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Upload Image</h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop an image here, or click to select
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Select Image
                </label>
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Supports PNG, JPG, GIF, WebP formats
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};