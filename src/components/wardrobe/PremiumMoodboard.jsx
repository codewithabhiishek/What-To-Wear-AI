import { cn } from "@/lib/utils";

export default function PremiumMoodboard({ items, className }) {
  // Sort items for rendering (Top -> Outerwear -> Bottom -> Shoes)
  const order = { top: 2, outerwear: 1, bottom: 3, accessory: 4, shoes: 5 };
  const sortedItems = [...items].sort((a, b) => (order[a.category] || 99) - (order[b.category] || 99));

  return (
    <div className={cn("relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-white shadow-inner", className)}>
      {sortedItems.map((item, i) => {
        let style = {};
        let itemClass = "absolute object-contain drop-shadow-xl transition-transform hover:scale-105 duration-300";
        
        switch (item.category) {
          case "top":
            style = { top: "10%", left: "15%", width: "65%", height: "45%", zIndex: 10 };
            break;
          case "outerwear":
            style = { top: "5%", left: "10%", width: "75%", height: "55%", zIndex: 5 };
            break;
          case "bottom":
            style = { top: "45%", right: "15%", width: "60%", height: "45%", zIndex: 20 };
            break;
          case "shoes":
            style = { bottom: "5%", left: "30%", width: "40%", height: "20%", zIndex: 30 };
            break;
          case "accessory":
            style = { top: "15%", right: "10%", width: "30%", height: "30%", zIndex: 40 };
            break;
          default:
            style = { top: "30%", left: "30%", width: "40%", height: "40%", zIndex: 15 };
        }

        // Add a slight random rotation for that "thrown on a bed" look, seeded by item.id so it's consistent
        const hash = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const rotation = (hash % 14) - 7; // -7 to +7 degrees

        return (
          <img
            key={item.id}
            src={item.image_url}
            alt={item.category}
            className={itemClass}
            style={{
              ...style,
              transform: `rotate(${rotation}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}
