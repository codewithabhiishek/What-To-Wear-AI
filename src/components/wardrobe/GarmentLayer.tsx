import { useState } from "react";
import { getGarmentStyle } from "@/utils/garmentRenderer";
import { cn } from "@/lib/utils";

interface GarmentLayerProps {
  imageUrl: string;
  category: string;
  className?: string;
  naturalWidth?: number;
  naturalHeight?: number;
}

export default function GarmentLayer({
  imageUrl,
  category,
  className,
  naturalWidth,
  naturalHeight,
}: GarmentLayerProps) {
  const [loadedWidth, setLoadedWidth] = useState(naturalWidth);
  const [loadedHeight, setLoadedHeight] = useState(naturalHeight);

  const style = getGarmentStyle(
    category,
    loadedWidth,
    loadedHeight
  );

  return (
    <img
      src={imageUrl}
      alt={`${category} layer`}
      style={{
        ...style,
        // Optional subtle perspective transform to make it feel a bit more rounded
        // transform: `${style.transform} perspective(500px) rotateX(2deg)`,
        // A subtle drop shadow separates it from the mannequin
        filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2)) drop-shadow(0 1px 3px rgba(0,0,0,0.1))",
      }}
      className={cn(
        "object-contain transition-opacity duration-300",
        // Hide slightly until loaded if we don't know dimensions
        (!loadedWidth || !loadedHeight) ? "opacity-0" : "opacity-100",
        className
      )}
      onLoad={(e) => {
        if (!naturalWidth || !naturalHeight) {
          const target = e.target as HTMLImageElement;
          setLoadedWidth(target.naturalWidth);
          setLoadedHeight(target.naturalHeight);
        }
      }}
    />
  );
}
