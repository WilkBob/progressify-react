import React, { useState, useEffect, useRef, useCallback } from "react";
import { useImageContext } from "./ImageContext";
import PropTypes from "prop-types";

interface ProgressiveImageProps {
  src: string;
  className?: string;
  placeholderClassName?: string;
  alt?: string;
  thumb?: boolean;
  lazy?: boolean;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  className = "",
  placeholderClassName = "",
  alt = "",
  thumb = false,
  lazy = false,
}) => {
  const { imageMap } = useImageContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(!lazy);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadImage = useCallback(() => {
    const imageData = imageMap.get(src);

    if (!imageData) {
      setError(`Image data not found for src: ${src}`);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Set placeholder using canvas
    if (imageData.placeholder && imageData.dimensions && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      const img = new Image();
      img.src = imageData.placeholder;

      img.onload = () => {
        if (context && canvasRef.current) {
          canvasRef.current.width = imageData.dimensions[0];
          canvasRef.current.height = imageData.dimensions[1];
          context.drawImage(
            img,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
          if (imageRef.current) {
            imageRef.current.src = canvasRef.current.toDataURL();
          }
        }
      };
    }

    // Load full image
    const fullImage = new Image();
    fullImage.src = thumb ? imageData.thumbnail : imageData.original;

    fullImage.onload = () => {
      if (imageRef.current) {
        imageRef.current.src = fullImage.src;
        imageRef.current.alt = alt;
        setIsLoading(false);
      }
    };

    fullImage.onerror = () => {
      setError("Failed to load image");
      setIsLoading(false);
    };
  }, [src, imageMap, thumb, alt]);

  useEffect(() => {
    if (!lazy || isIntersecting) {
      loadImage();
    }
  }, [lazy, isIntersecting, loadImage, src]); // Added src to dependencies

  useEffect(() => {
    if (lazy && containerRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observer.disconnect();
          }
        },
        { rootMargin: "200px" }
      );

      observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [lazy]);

  return (
    <div ref={containerRef}>
      {(isIntersecting || !lazy) && (
        <>
          <img
            ref={imageRef}
            alt={alt}
            className={`${className} ${isLoading ? placeholderClassName : ""}`}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          {isLoading && <div>Loading...</div>}
          {error && <div>Error: {error}</div>}
        </>
      )}
    </div>
  );
};

ProgressiveImage.propTypes = {
  src: PropTypes.string.isRequired,
  className: PropTypes.string,
  placeholderClassName: PropTypes.string,
  alt: PropTypes.string,
  thumb: PropTypes.bool,
  lazy: PropTypes.bool,
};
