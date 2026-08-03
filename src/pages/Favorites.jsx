import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { db } from "@/api/firebaseClient";
import { collection, doc, setDoc, query, orderBy, limit, getDocs } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { useFavorites } from "@/lib/FavoritesContext";
import { Button } from "@/components/ui/button";
import { Heart, Wand2 } from "lucide-react";
import OutfitCard from "@/components/wardrobe/OutfitCard";
import EmptyState from "@/components/wardrobe/EmptyState";
import { OutfitListSkeleton } from "@/components/wardrobe/Skeletons";
import { OCCASIONS } from "@/lib/wardrobeConstants";
import { cn } from "@/lib/utils";

const OCCASION_FILTERS = [
  { key: "all", label: "All Occasions", icon: "✨" },
  ...OCCASIONS,
];

export default function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { favoritesMap, loadingFavorites } = useFavorites();
  const [clothingMap, setClothingMap] = useState({});
  const [loadingItems, setLoadingItems] = useState(true);
  const [activeOccasion, setActiveOccasion] = useState("all");
  const [minScore, setMinScore] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "score" | "occasion"
  const [loggingId, setLoggingId] = useState(null);

  // Load user's clothing items to hydrate favorite item_ids into full item objects
  const loadClothingItems = useCallback(async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "users", user.id, "clothingItems"),
        orderBy("created_date", "desc"),
        limit(200)
      );
      const snap = await getDocs(q);
      const map = {};
      snap.docs.forEach((docSnap) => {
        map[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
      });
      setClothingMap(map);
    } catch (err) {
      console.error("Error loading clothing items for favorites:", err);
    } finally {
      setLoadingItems(false);
    }
  }, [user]);

  useEffect(() => {
    loadClothingItems();
  }, [loadClothingItems]);

  const handleWoreThis = async (outfit) => {
    if (!user) return;
    setLoggingId(outfit.items.map((i) => i.id).join(","));
    try {
      const newHistoryRef = doc(collection(db, "users", user.id, "outfitHistory"));
      await setDoc(newHistoryRef, {
        item_ids: outfit.items.map((i) => i.id),
        occasion: outfit.occasion || "casual",
        explanation: outfit.explanation || "",
        created_date: new Date().toISOString(),
      });
    } finally {
      setLoggingId(null);
    }
  };

  // Reconstruct full favorite outfit objects and apply filtering & sorting
  const favoriteOutfits = useMemo(() => {
    const rawList = Object.values(favoritesMap || {});
    return rawList
      .map((fav) => {
        const items = (fav.item_ids || [])
          .map((id) => clothingMap[id])
          .filter(Boolean);
        return {
          id: fav.id,
          score: fav.score || 90,
          explanation: fav.explanation || "",
          occasion: fav.occasion || "casual",
          created_date: fav.created_date,
          items,
        };
      })
      .filter((outfit) => {
        // Must have at least top and bottom items still in closet
        if (outfit.items.length < 2) return false;

        // Occasion filter
        if (activeOccasion !== "all" && outfit.occasion !== activeOccasion) {
          return false;
        }

        // Score filter
        if (minScore !== "all") {
          const threshold = Number(minScore);
          if (outfit.score < threshold) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "score") return b.score - a.score;
        if (sortBy === "occasion") return (a.occasion || "").localeCompare(b.occasion || "");
        // Default: newest saved first
        return new Date(b.created_date) - new Date(a.created_date);
      });
  }, [favoritesMap, clothingMap, activeOccasion, minScore, sortBy]);

  const isLoading = loadingFavorites || loadingItems;
  const totalFavoritesCount = Object.keys(favoritesMap || {}).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight flex items-center gap-2">
            Favorites <Heart className="h-6 w-6 fill-red-500 text-red-500 inline-block" />
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading saved outfits…"
              : `${favoriteOutfits.length} of ${totalFavoritesCount} saved outfit${totalFavoritesCount === 1 ? "" : "s"}`}
          </p>
        </div>
        <Button onClick={() => navigate("/what-to-wear")}>
          <Wand2 className="mr-2 h-4 w-4" /> Find new outfits
        </Button>
      </div>

      {/* Filtering & Sorting Toolbar */}
      {totalFavoritesCount > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between border-b pb-4">
          {/* Occasion Filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {OCCASION_FILTERS.map((o) => (
              <button
                key={o.key}
                onClick={() => setActiveOccasion(o.key)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors shrink-0 flex items-center gap-1",
                  activeOccasion === o.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{o.icon}</span>
                <span>{o.label}</span>
              </button>
            ))}
          </div>

          {/* Score & Sort Controls */}
          <div className="flex gap-2 items-center">
            <select
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium text-muted-foreground focus:outline-none"
            >
              <option value="all">All Scores</option>
              <option value="90">90%+ Match</option>
              <option value="85">85%+ Match</option>
              <option value="80">80%+ Match</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium text-muted-foreground focus:outline-none"
            >
              <option value="newest">Newest Saved</option>
              <option value="score">Highest Match</option>
              <option value="occasion">Occasion</option>
            </select>
          </div>
        </div>
      )}

      {isLoading ? (
        <OutfitListSkeleton count={3} />
      ) : totalFavoritesCount === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorite outfits yet"
          description="Save outfits you love by tapping the heart icon on any recommendation card."
          action={
            <Button onClick={() => navigate("/what-to-wear")}>
              <Wand2 className="mr-2 h-4 w-4" /> Find outfits to save
            </Button>
          }
        />
      ) : favoriteOutfits.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground space-y-2">
          <p className="text-base font-semibold">No favorites match these filters</p>
          <p className="text-xs">Try selecting a different occasion or match score filter.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveOccasion("all");
              setMinScore("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <motion.div
          className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.04 },
            },
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "100px" }}
        >
          {favoriteOutfits.map((outfit, idx) => (
            <motion.div
              key={outfit.id}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
              }}
            >
              <OutfitCard
                outfit={outfit}
                explanation={outfit.explanation}
                occasion={outfit.occasion}
                isFeatured={idx === 0}
                isLogging={loggingId === outfit.items.map((i) => i.id).join(",")}
                onWoreThis={() => handleWoreThis(outfit)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
