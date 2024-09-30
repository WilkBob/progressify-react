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
  const [loadingState, setLoadingState] = useState<
    "placeholder" | "loading" | "loaded" | "error"
  >("placeholder");
  const [isIntersecting, setIsIntersecting] = useState(!lazy);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const loadImage = useCallback(() => {
    const imageData = imageMap.get(src);

    if (!imageData) {
      console.error(`Image data not found for src: ${src}`);
      setLoadingState("error");
      return;
    }

    // Load placeholder
    if (imageData.placeholder && imageData.dimensions) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const img = new Image();
      img.src = imageData.placeholder;

      img.onload = () => {
        if (context) {
          canvas.width = imageData.dimensions[0];
          canvas.height = imageData.dimensions[1];
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
          if (imageRef.current) {
            imageRef.current.src = canvas.toDataURL();
            setLoadingState("loading");
          }
        }
      };
    } else if (imageRef.current) {
      imageRef.current.src = imageData.placeholder;
      setLoadingState("loading");
    }

    // Load full image
    const fullImage = new Image();
    fullImage.src = thumb ? imageData.thumbnail : imageData.original;

    fullImage.onload = () => {
      if (imageRef.current) {
        imageRef.current.src = fullImage.src;
        imageRef.current.alt = alt;
        setLoadingState("loaded");
      }
    };

    fullImage.onerror = (error) => {
      setLoadingState("error");
      console.error("Error loading image:", error);
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

  const getClassName = () => {
    switch (loadingState) {
      case "placeholder":
      case "loading":
        return `${className} ${placeholderClassName}`;
      case "loaded":
        return className;
      case "error":
        return `${className} error`;
      default:
        return className;
    }
  };

  return (
    <div ref={containerRef}>
      {(isIntersecting || !lazy) && (
        <img
          ref={imageRef}
          alt={alt}
          className={getClassName()}
          style={{
            visibility: loadingState === "placeholder" ? "hidden" : "visible",
          }}
        />
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
