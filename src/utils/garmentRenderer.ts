export type GarmentCategory = "top" | "bottom" | "shoes" | "outerwear" | "accessory";

export interface AnchorConfig {
  x: string; // CSS left
  y: string; // CSS top
  width: string; // CSS width
  zIndex: number;
}

// These are relative to the mannequin container which is aspect-[4/5]
export const ANCHORS: Record<string, AnchorConfig> = {
  top: {
    x: "50%",
    y: "35%", // Centered on the upper torso
    width: "60%", // Tops generally cover the torso width
    zIndex: 20,
  },
  bottom: {
    x: "50%",
    y: "65%", // Centered on the legs
    width: "55%", // Pants/skirts width
    zIndex: 10, // Pants generally go under shirts slightly in a layered view, or over depending on tuck. We'll default to under.
  },
  shoes: {
    x: "50%",
    y: "92%", // At the bottom
    width: "40%",
    zIndex: 30,
  },
  outerwear: {
    x: "50%",
    y: "35%",
    width: "70%",
    zIndex: 40,
  },
  accessory: {
    x: "50%",
    y: "15%",
    width: "20%",
    zIndex: 50,
  }
};

export function getGarmentStyle(category: string, naturalWidth?: number, naturalHeight?: number) {
  const normalizedCategory = category.toLowerCase();
  
  // Default to top if unknown
  const anchor = ANCHORS[normalizedCategory] || ANCHORS.top;

  let aspectRatio = "auto";
  if (naturalWidth && naturalHeight) {
    aspectRatio = `${naturalWidth} / ${naturalHeight}`;
  }

  return {
    position: "absolute" as const,
    left: anchor.x,
    top: anchor.y,
    width: anchor.width,
    height: "auto",
    aspectRatio,
    zIndex: anchor.zIndex,
    // Translate -50% -50% centers the garment exactly on the anchor point
    transform: "translate(-50%, -50%)",
  };
}
