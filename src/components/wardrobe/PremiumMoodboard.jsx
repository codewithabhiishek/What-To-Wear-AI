import { cn } from "@/lib/utils";

export default function PremiumMoodboard({ items, className }) {
  // Sort items for rendering (Top -> Outerwear -> Bottom -> Shoes)
  const order = { top: 2, outerwear: 1, bottom: 3, accessory: 4, shoes: 5 };
  const sortedItems = [...items].sort((a, b) => (order[a.category] || 99) - (order[b.category] || 99));

  return (
    <div className={cn("relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-white shadow-inner", className)}>
      {sortedItems.map((item, i) => {
        let style = {};
        // Remove random rotation, keep it perfectly straight and clean
        let itemClass = "absolute object-contain drop-shadow-md transition-transform hover:scale-105 duration-300";
        
        switch (item.category) {
          case "top":
            style = { top: "5%", left: "50%", transform: "translateX(-50%)", width: "65%", height: "45%", zIndex: 10 };
            break;
          case "outerwear":
            style = { top: "2%", left: "50%", transform: "translateX(-50%)", width: "75%", height: "55%", zIndex: 5 };
            break;
          case "bottom":
            style = { top: "45%", left: "50%", transform: "translateX(-50%)", width: "55%", height: "45%", zIndex: 20 };
            break;
          case "shoes":
            style = { bottom: "2%", left: "50%", transform: "translateX(-50%)", width: "40%", height: "20%", zIndex: 30 };
            break;
          case "accessory":
            style = { top: "5%", right: "15%", width: "25%", height: "25%", zIndex: 40 };
            break;
          default:
            style = { top: "30%", left: "50%", transform: "translateX(-50%)", width: "40%", height: "40%", zIndex: 15 };
        }

        return (
          <img
            key={item.id}
            src={item.image_url}
            alt={item.category}
            className={itemClass}
            style={style}
          />
        );
      })}
    </div>
  );
}
