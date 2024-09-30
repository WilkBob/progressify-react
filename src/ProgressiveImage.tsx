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

  const imageRef = useRef<HTMLImageElement>(null);

  const loadImage = useCallback(() => {
    const imageData = imageMap.get(src);

    if (!imageData) {
      console.error(`Image with src ${src} not found in imageMap`);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Set placeholder using canvas
    if (imageData.placeholder && imageData.dimensions && imageRef.current) {
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
      setIsLoading(false);
    };
  }, [src, imageMap, thumb, alt]);

  useEffect(() => {
    if (!lazy || isIntersecting) {
      loadImage();
    }
  }, [lazy, isIntersecting, loadImage, src]); // Added src to dependencies

  useEffect(() => {
    if (lazy && imageRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observer.disconnect();
          }
        },
        { rootMargin: "200px" }
      );

      observer.observe(imageRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [lazy]);

  return (
    <>
      <img
        ref={imageRef}
        alt={alt}
        className={`${className} ${isLoading ? placeholderClassName : ""}`}
      />
    </>
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
