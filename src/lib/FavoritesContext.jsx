import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { db } from "@/api/firebaseClient";
import { collection, doc, setDoc, deleteDoc, query, orderBy, getDocs } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "@/components/ui/use-toast";

const FavoritesContext = createContext({
  favoritesMap: {},
  loadingFavorites: true,
  isFavorited: () => false,
  toggleFavorite: async () => {},
  getOutfitKey: () => "",
  refreshFavorites: async () => {},
});

export function getOutfitKey(outfit) {
  if (!outfit || !outfit.items) return "";
  return outfit.items.map((i) => i.id).sort().join("_");
}

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favoritesMap, setFavoritesMap] = useState({});
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavoritesMap({});
      setLoadingFavorites(false);
      return;
    }

    try {
      const q = query(
        collection(db, "users", user.id, "favoriteOutfits"),
        orderBy("created_date", "desc")
      );
      const snapshot = await getDocs(q);
      const map = {};
      snapshot.docs.forEach((docSnap) => {
        map[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
      });
      setFavoritesMap(map);
    } catch (err) {
      console.error("Error loading favorite outfits:", err);
    } finally {
      setLoadingFavorites(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorited = useCallback(
    (outfit) => {
      const key = getOutfitKey(outfit);
      return !!favoritesMap[key];
    },
    [favoritesMap]
  );

  const toggleFavorite = useCallback(
    async (outfit, explanation = "", occasion = "casual") => {
      if (!user) return;
      const key = getOutfitKey(outfit);
      if (!key) return;

      const currentlyFav = !!favoritesMap[key];
      const previousMap = { ...favoritesMap };

      // -----------------------------------------------------------------------
      // OPTIMISTIC UPDATE (Instant 0ms feedback)
      // -----------------------------------------------------------------------
      if (currentlyFav) {
        const next = { ...favoritesMap };
        delete next[key];
        setFavoritesMap(next);
        toast({
          title: "Removed from Favorites",
          description: "Outfit has been removed from your saved favorites.",
        });
      } else {
        const newFav = {
          id: key,
          item_ids: outfit.items.map((i) => i.id),
          occasion: occasion || "casual",
          score: outfit.score || 90,
          explanation: explanation || outfit.explanation || "",
          created_date: new Date().toISOString(),
        };
        setFavoritesMap({
          [key]: newFav,
          ...favoritesMap,
        });
        toast({
          title: "Added to Favorites ❤️",
          description: "Outfit saved to your favorites tab.",
        });
      }

      // -----------------------------------------------------------------------
      // ASYNCHRONOUS FIRESTORE PERSISTENCE
      // -----------------------------------------------------------------------
      try {
        const favDocRef = doc(db, "users", user.id, "favoriteOutfits", key);
        if (currentlyFav) {
          await deleteDoc(favDocRef);
        } else {
          await setDoc(favDocRef, {
            item_ids: outfit.items.map((i) => i.id),
            occasion: occasion || "casual",
            score: outfit.score || 90,
            explanation: explanation || outfit.explanation || "",
            created_date: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Firestore favorite toggle failed:", err);
        // Rollback state if network/firestore operation fails
        setFavoritesMap(previousMap);
        toast({
          variant: "destructive",
          title: "Error updating favorites",
          description: "Could not sync with cloud. Please try again.",
        });
      }
    },
    [user, favoritesMap]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favoritesMap,
        loadingFavorites,
        isFavorited,
        toggleFavorite,
        getOutfitKey,
        refreshFavorites: loadFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
