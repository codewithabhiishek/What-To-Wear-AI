import GarmentLayer from "./GarmentLayer";

interface OutfitItem {
  id: string;
  image_url: string;
  category: string;
  naturalWidth?: number;
  naturalHeight?: number;
}

interface OutfitRendererProps {
  items: OutfitItem[];
}

export default function OutfitRenderer({ items }: OutfitRendererProps) {
  // Sort items to ensure proper natural z-indexing if needed, though GarmentLayer handles z-index CSS
  // Shoes (30) > Top (20) > Bottom (10) based on garmentRenderer.ts
  
  return (
    <div className="relative overflow-hidden rounded-xl bg-muted aspect-[4/5] w-full flex items-center justify-center bg-gray-100">
      {/* Base Mannequin Layer */}
      <img
        src="/mannequin.png"
        alt="Mannequin"
        className="absolute inset-0 w-full h-full object-cover"
        // Optional: you can use mix-blend-multiply if the background is pure white
        style={{ mixBlendMode: "multiply" }} 
      />

      {/* Garment Layers */}
      {items.map((item) => (
        <GarmentLayer
          key={item.id}
          imageUrl={item.image_url}
          category={item.category}
          naturalWidth={item.naturalWidth}
          naturalHeight={item.naturalHeight}
        />
      ))}
    </div>
  );
}
