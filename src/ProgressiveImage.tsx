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
  const [isLoading, setIsLoading] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(!lazy);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const loadImage = useCallback(() => {
    const imageData = imageMap.get(src);

    if (!imageData) {
      setError(`Image data not found for src: ${src}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Set placeholder
    if (imageRef.current) {
      imageRef.current.src = imageData.placeholder || "";
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
  }, [lazy, isIntersecting, loadImage]);

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
