import React, { useState, useEffect, useRef } from "react";
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
  const [imgSrc, setImgSrc] = useState(""); // Track the src for the image
  const [loading, setLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const imageData = imageMap.get(src);
    if (!imageData) {
      console.error(`Image data not found for ${src}`);
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Canvas context not found");
      return;
    }

    const dimensions = thumb
      ? [
          imageData.thumbnailSize,
          imageData.thumbnailSize /
            (imageData.dimensions[0] / imageData.dimensions[1]),
        ]
      : imageData.dimensions;

    // Placeholder loading
    canvas.width = dimensions[0];
    canvas.height = dimensions[1];
    const placeholderImage = new Image();
    placeholderImage.src = imageData.placeholder;
    placeholderImage.onload = () => {
      ctx.drawImage(placeholderImage, 0, 0, dimensions[0], dimensions[1]);
      setImgSrc(canvas.toDataURL());
      setLoading(true);
    };

    // Preload full image if not lazy
    if (!lazy) {
      const fullImage = new Image();
      fullImage.src = thumb ? imageData.thumbnail : imageData.original;
      fullImage.onload = () => {
        setImgSrc(fullImage.src);
        setLoading(false);
      };
    }

    return () => {
      // Cleanup the canvas element after the useEffect hook completes
      canvas.remove();
    };
  }, [src, imageMap, thumb, lazy]);

  useEffect(() => {
    if (lazy && loading) {
      const imageData = imageMap.get(src);
      if (!imageData) {
        console.error(`Image data not found for ${src}`);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const fullImage = new Image();
            fullImage.src = thumb ? imageData.thumbnail : imageData.original;
            fullImage.onload = () => {
              setImgSrc(fullImage.src);
              setLoading(false);
            };
            observer.disconnect();
          }
        },
        { rootMargin: "200px" }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => {
        if (imgRef.current) observer.disconnect();
      };
    }
  }, [imgSrc, imageMap, lazy, thumb]);

  return (
    <>
      {imgSrc && (
        <img
          src={imgSrc}
          alt={alt}
          className={`${className} ${loading ? placeholderClassName : ""}`}
          ref={imgRef}
        />
      )}
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
