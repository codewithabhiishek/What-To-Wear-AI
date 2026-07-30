import { useState, useEffect, useCallback } from "react";
import { db } from "@/api/firebaseClient";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { Clock, Loader2 } from "lucide-react";
import OutfitThumbnails from "@/components/wardrobe/OutfitThumbnails";
import EmptyState from "@/components/wardrobe/EmptyState";
import { format } from "date-fns";

export default function History() {
  const { user } = useAuth();
  const [entries, setEntries] = useState(null);
  const [itemMap, setItemMap] = useState({});

  const load = useCallback(async () => {
    if (!user) return;
    const historyQ = query(collection(db, "users", user.id, "outfitHistory"), orderBy("created_date", "desc"), limit(100));
    const itemsQ = query(collection(db, "users", user.id, "clothingItems"), orderBy("created_date", "desc"), limit(200));

    const [histSnap, itemsSnap] = await Promise.all([
      getDocs(historyQ),
      getDocs(itemsQ)
    ]);

    const hist = histSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const items = itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    setEntries(hist);
    setItemMap(Object.fromEntries(items.map((i) => [i.id, i])));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const loading = entries === null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Outfit History
        </h1>
        <p className="text-sm text-muted-foreground">
          Recently worn outfits — these are deprioritized in future suggestions.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No outfits logged yet"
          description="When you tap “I wore this” on a suggestion, it'll show up here and be deprioritized next time."
        />
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            const wornItems = (entry.item_ids || [])
              .map((id) => itemMap[id])
              .filter(Boolean);
            return (
              <div
                key={entry.id}
                className="rounded-2xl border bg-card p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize text-foreground">
                    {entry.occasion}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(
                      new Date(entry.created_date),
                      "MMM d, yyyy · h:mm a",
                    )}
                  </span>
                </div>
                <OutfitThumbnails items={wornItems} />
                {entry.explanation && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {entry.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
