import React, { createContext, useState, useEffect, useContext } from "react";
import { JSONImage } from "./types";

export interface ImageData {
  placeholder: string;
  original: string;
  thumbnail: string;
  dimensions: [number, number];
  aspectRatio: number;
  thumbnailSize: number;
}

interface ImageContextValue {
  imageMap: Map<string, ImageData>;
  loading: boolean;
  error: Error | null;
}

const ImageContext = createContext<ImageContextValue | undefined>(undefined);

interface ImageProviderProps {
  children: React.ReactNode;
  indexUrl?: string;
}

export const ImageProvider: React.FC<ImageProviderProps> = ({
  children,
  indexUrl = "/index.json",
}) => {
  const [state, setState] = useState<ImageContextValue>({
    imageMap: new Map(),
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchImageIndex = async () => {
      try {
        const response = await fetch(indexUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const imageMap = new Map<string, ImageData>(
          data.map((item: JSONImage) => [
            item.filename,
            {
              placeholder: item.base64_placeholder,
              original: item.original,
              thumbnail: item.thumbnail || item.original,
              dimensions: item.dimensions,
              aspectRatio: item.aspect_ratio,
              thumbnailSize: item.thumbnail_size || item.dimensions[0],
            },
          ])
        );
        setState({ imageMap, loading: false, error: null });
      } catch (error) {
        console.error("Error fetching image index:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error as Error,
        }));
      }
    };

    fetchImageIndex();
  }, [indexUrl]);

  return (
    <ImageContext.Provider value={state}>
      {!state.loading && children}
    </ImageContext.Provider>
  );
};

export const useImageContext = () => {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error("useImageContext must be used within an ImageProvider");
  }
  return context;
};
