import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { db } from "@/api/firebaseClient";
import { collection, query, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Shirt, Search, SlidersHorizontal } from "lucide-react";
import ClosetItemCard from "@/components/wardrobe/ClosetItemCard";
import UploadItemDialog from "@/components/wardrobe/UploadItemDialog";
import EditItemDialog from "@/components/wardrobe/EditItemDialog";
import EmptyState from "@/components/wardrobe/EmptyState";
import { ClosetGridSkeleton } from "@/components/wardrobe/Skeletons";
import { cn } from "@/lib/utils";

const CATEGORY_FILTERS = [
  { key: "all", label: "All" },
  { key: "top", label: "Tops" },
  { key: "bottom", label: "Bottoms" },
  { key: "shoes", label: "Shoes" },
  { key: "outerwear", label: "Outerwear" },
];

export default function Closet() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "category" | "formality"

  const load = useCallback(async () => {
    if (!user) return;
    const q = query(collection(db, "users", user.id, "clothingItems"), orderBy("created_date", "desc"));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setItems(list);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (item) => {
    await deleteDoc(doc(db, "users", user.id, "clothingItems", item.id));
    setItems((prev) => (prev || []).filter((i) => i.id !== item.id));
  };

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items
      .filter((item) => {
        const matchesCategory =
          activeCategory === "all" || item.category === activeCategory;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          (item.color_primary || "").toLowerCase().includes(q) ||
          (item.category || "").toLowerCase().includes(q) ||
          (item.pattern || "").toLowerCase().includes(q) ||
          (item.material || "").toLowerCase().includes(q) ||
          (item.notes || "").toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "formality") return (b.formality || 3) - (a.formality || 3);
        if (sortBy === "category") return (a.category || "").localeCompare(b.category || "");
        return 0; // default newest (already ordered by created_date)
      });
  }, [items, activeCategory, searchQuery, sortBy]);

  const loading = items === null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            My Closet
          </h1>
          <p className="text-sm text-muted-foreground">
            {items
              ? `${filteredItems.length} of ${items.length} item${items.length === 1 ? "" : "s"}`
              : "Loading…"}
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add item
        </Button>
      </div>

      {/* Filter & Search Bar */}
      {items && items.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between border-b pb-4">
          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors shrink-0",
                  activeCategory === cat.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search & Sort Input */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search color, style..."
                className="pl-8 text-xs h-8"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium text-muted-foreground focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="formality">Formality</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <ClosetGridSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Shirt}
          title="Your closet is empty"
          description="Upload a photo of a clothing item and AI will tag it for you. Build your wardrobe to start getting outfit suggestions."
          action={
            <Button onClick={() => setUploadOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add your first item
            </Button>
          }
        />
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground space-y-2">
          <p className="text-base font-semibold">No matching items found</p>
          <p className="text-xs">Try adjusting your search query or category filter.</p>
          <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.04 }
            }
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "100px" }}
        >
          {filteredItems.map((item) => (
            <motion.div 
              key={item.id}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
              }}
            >
              <ClosetItemCard
                item={item}
                onDelete={handleDelete}
                onEdit={setEditingItem}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <UploadItemDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSaved={load}
      />

      <EditItemDialog
        item={editingItem}
        open={!!editingItem}
        onOpenChange={(o) => !o && setEditingItem(null)}
        onSaved={load}
      />
    </div>
  );
}
