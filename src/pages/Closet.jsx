import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { db } from "@/api/firebaseClient";
import { collection, query, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Shirt, Search } from "lucide-react";
import ClosetItemCard from "@/components/wardrobe/ClosetItemCard";
import UploadItemDialog from "@/components/wardrobe/UploadItemDialog";
import EditItemDialog from "@/components/wardrobe/EditItemDialog";
import EmptyState from "@/components/wardrobe/EmptyState";
import { ClosetGridSkeleton } from "@/components/wardrobe/Skeletons";
import { executeUploadPipeline } from "@/lib/uploadPipeline";
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
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setItems(list);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (item) => {
    // If it's an in-flight optimistic item, remove it immediately from state
    if (item.isOptimistic) {
      setItems((prev) => (prev || []).filter((i) => i.id !== item.id));
      return;
    }
    await deleteDoc(doc(db, "users", user.id, "clothingItems", item.id));
    setItems((prev) => (prev || []).filter((i) => i.id !== item.id));
  };

  // ---------------------------------------------------------------------------
  // INSTANT 0MS OPTIMISTIC UPLOAD ENGINE
  // ---------------------------------------------------------------------------
  const startUploadPipeline = async (optItem) => {
    try {
      const savedItem = await executeUploadPipeline(
        optItem.rawFile,
        user.id,
        (statusMessage) => {
          setItems((prev) =>
            (prev || []).map((i) =>
              i.id === optItem.id ? { ...i, statusMessage, error: null } : i
            )
          );
        }
      );

      // In-place replacement: Swap temporary card with real saved Firestore item
      setItems((prev) =>
        (prev || []).map((i) => (i.id === optItem.id ? savedItem : i))
      );
    } catch (err) {
      console.error("[Closet Optimistic Upload Error]", err);
      setItems((prev) =>
        (prev || []).map((i) =>
          i.id === optItem.id
            ? { ...i, error: err.message || "Upload failed. Tap to retry." }
            : i
        )
      );
    }
  };

  const handleFileSelected = (rawFile) => {
    if (!rawFile || !user) return;

    const tempId = "temp_" + Date.now();
    const previewUrl = URL.createObjectURL(rawFile);

    const optimisticItem = {
      id: tempId,
      previewUrl,
      rawFile,
      isOptimistic: true,
      statusMessage: "Preparing photo…",
      error: null,
      category: "top",
      color_primary: "Processing...",
      fit: "regular",
      pattern: "solid",
      formality: 3,
      created_date: new Date().toISOString(),
    };

    // 0ms response: Instantly append optimistic card at top of local state
    setItems((prev) => [optimisticItem, ...(prev || [])]);

    // Start background processing immediately
    startUploadPipeline(optimisticItem);
  };

  const handleRetry = (optItem) => {
    setItems((prev) =>
      (prev || []).map((i) =>
        i.id === optItem.id ? { ...i, error: null, statusMessage: "Retrying…" } : i
      )
    );
    startUploadPipeline(optItem);
  };

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items
      .filter((item) => {
        // Optimistic uploads ALWAYS show at the top regardless of search/filter
        if (item.isOptimistic) return true;

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
        if (a.isOptimistic) return -1;
        if (b.isOptimistic) return 1;
        if (sortBy === "formality") return (b.formality || 3) - (a.formality || 3);
        if (sortBy === "category") return (a.category || "").localeCompare(b.category || "");
        return 0; // default newest
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 items-stretch">
          {filteredItems.map((item) => (
            <div key={item.id}>
              <ClosetItemCard
                item={item}
                onDelete={handleDelete}
                onEdit={setEditingItem}
                onRetry={handleRetry}
              />
            </div>
          ))}
        </div>
      )}

      <UploadItemDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onFileSelected={handleFileSelected}
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
