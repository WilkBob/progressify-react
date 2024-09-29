export interface ImageData {
  placeholder: string;
  original: string;
  thumbnail: string;
  dimensions: [number, number];
  aspectRatio: number;
  thumbnailSize: number;
}

export interface ImageContextValue {
  imageMap: Map<string, ImageData>;
  loading: boolean;
}

export interface JSONImage {
  filename: string;
  base64_placeholder: string;
  original: string;
  thumbnail: string;
  dimensions: [number, number];
  aspect_ratio: number;
  thumbnail_size: number;
}
