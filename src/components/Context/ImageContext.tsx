import React, { createContext, useContext, useState, ReactNode, useRef, useCallback } from 'react';

export interface EditorImageData {
  id: string;
  name: string;
  data: ImageData;
  width: number;
  height: number;
  url: string;
}

interface ImageContextType {
  currentImage: EditorImageData | null;
  setCurrentImage: (image: EditorImageData | null) => void;
  imageHistory: EditorImageData[];
  canvasRef: React.RefObject<HTMLCanvasElement>;
  loadImage: (file: File) => Promise<void>;
  exportImage: (format: 'png' | 'jpg') => void;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const useImageContext = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImageContext must be used within an ImageProvider');
  }
  return context;
};

interface ImageProviderProps {
  children: ReactNode;
}

export const ImageProvider: React.FC<ImageProviderProps> = ({ children }) => {
  const [currentImage, setCurrentImage] = useState<EditorImageData | null>(null);
  const [imageHistory, setImageHistory] = useState<EditorImageData[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadImage = useCallback(async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) {
            reject(new Error('Canvas not available'));
            return;
          }

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const newImage: EditorImageData = {
            id: Date.now().toString(),
            name: file.name,
            data: imageData,
            width: img.width,
            height: img.height,
            url: e.target?.result as string,
          };

          setCurrentImage(newImage);
          setImageHistory(prev => [...prev, newImage]);
          resolve();
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  const exportImage = useCallback((format: 'png' | 'jpg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `edited-image.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
  }, []);

  return (
    <ImageContext.Provider
      value={{
        currentImage,
        setCurrentImage,
        imageHistory,
        canvasRef,
        loadImage,
        exportImage,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};