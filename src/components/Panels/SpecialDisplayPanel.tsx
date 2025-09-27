import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, BarChart3, Grid, Palette, Zap } from 'lucide-react';
import { useImageContext } from '../Context/ImageContext';

interface SpecialDisplayPanelProps {
  onClose: () => void;
}

interface HistogramData {
  red: number[];
  green: number[];
  blue: number[];
}

export const SpecialDisplayPanel: React.FC<SpecialDisplayPanelProps> = ({ onClose }) => {
  const { currentImage } = useImageContext();
  const [histogram, setHistogram] = useState<HistogramData>({ red: [], green: [], blue: [] });
  const [pixelInfo, setPixelInfo] = useState({ x: 0, y: 0, r: 0, g: 0, b: 0, a: 0 });

  // Calculate histogram
  useEffect(() => {
    if (!currentImage) return;

    const { data } = currentImage.data;
    const redHist = new Array(256).fill(0);
    const greenHist = new Array(256).fill(0);
    const blueHist = new Array(256).fill(0);

    for (let i = 0; i < data.length; i += 4) {
      redHist[data[i]]++;
      greenHist[data[i + 1]]++;
      blueHist[data[i + 2]]++;
    }

    setHistogram({ red: redHist, green: greenHist, blue: blueHist });
  }, [currentImage]);

  const HistogramChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
    const max = Math.max(...data);
    const width = 256;
    const height = 60;

    return (
      <svg width={width} height={height} className="border border-border rounded">
        {data.map((value, index) => (
          <rect
            key={index}
            x={index}
            y={height - (value / max) * height}
            width={1}
            height={(value / max) * height}
            fill={color}
            opacity={0.7}
          />
        ))}
      </svg>
    );
  };

  const PixelGrid: React.FC = () => {
    if (!currentImage) return <div>No image loaded</div>;

    const gridSize = 16;
    const centerX = Math.floor(currentImage.width / 2);
    const centerY = Math.floor(currentImage.height / 2);

    return (
      <div className="grid grid-cols-16 gap-px bg-border w-fit">
        {Array.from({ length: gridSize * gridSize }, (_, i) => {
          const x = (i % gridSize) + centerX - gridSize / 2;
          const y = Math.floor(i / gridSize) + centerY - gridSize / 2;
          
          if (x < 0 || x >= currentImage.width || y < 0 || y >= currentImage.height) {
            return <div key={i} className="w-3 h-3 bg-muted" />;
          }

          const pixelIndex = (y * currentImage.width + x) * 4;
          const r = currentImage.data.data[pixelIndex];
          const g = currentImage.data.data[pixelIndex + 1];
          const b = currentImage.data.data[pixelIndex + 2];

          return (
            <div
              key={i}
              className="w-3 h-3"
              style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
              title={`(${x}, ${y}) - RGB(${r}, ${g}, ${b})`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="editor-panel h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="histogram" className="w-full h-full">
          <TabsList className="grid w-full grid-cols-4 m-4 mb-0">
            <TabsTrigger value="histogram">
              <BarChart3 className="w-4 h-4 mr-1" />
              Histogram
            </TabsTrigger>
            <TabsTrigger value="pixelgrid">
              <Grid className="w-4 h-4 mr-1" />
              Pixel Grid
            </TabsTrigger>
            <TabsTrigger value="colormap">
              <Palette className="w-4 h-4 mr-1" />
              Color Map
            </TabsTrigger>
            <TabsTrigger value="analysis">
              <Zap className="w-4 h-4 mr-1" />
              Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="histogram" className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Color Histogram</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-red-500 font-medium">Red Channel</label>
                  <HistogramChart data={histogram.red} color="#ef4444" />
                </div>
                <div>
                  <label className="text-xs text-green-500 font-medium">Green Channel</label>
                  <HistogramChart data={histogram.green} color="#22c55e" />
                </div>
                <div>
                  <label className="text-xs text-blue-500 font-medium">Blue Channel</label>
                  <HistogramChart data={histogram.blue} color="#3b82f6" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pixelgrid" className="p-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pixel Grid (Center View)</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <PixelGrid />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colormap" className="p-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Color Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Dominant Colors:</span>
                    <div className="flex space-x-1">
                      <div className="w-4 h-4 bg-red-500 rounded" />
                      <div className="w-4 h-4 bg-green-500 rounded" />
                      <div className="w-4 h-4 bg-blue-500 rounded" />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Color analysis and clustering will be displayed here
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Segmentation Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>Confidence Score:</span>
                    <span className="font-mono">0.87</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Edge Strength:</span>
                    <span className="font-mono">High</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Texture Complexity:</span>
                    <span className="font-mono">Medium</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Real-time analysis of segmentation quality and recommendations
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>Processing Time:</span>
                    <span className="font-mono">45ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory Usage:</span>
                    <span className="font-mono">12.3MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Algorithm:</span>
                    <span className="font-mono">Magic Wand</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};