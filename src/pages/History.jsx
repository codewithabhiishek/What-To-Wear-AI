import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { db } from "@/api/firebaseClient";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { Clock } from "lucide-react";
import OutfitThumbnails from "@/components/wardrobe/OutfitThumbnails";
import EmptyState from "@/components/wardrobe/EmptyState";
import { format } from "date-fns";

function HistorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-4 w-32 rounded-full" />
          </div>
          <div className="flex gap-2">
            <div className="skeleton h-16 w-16 rounded-xl" />
            <div className="skeleton h-16 w-16 rounded-xl" />
            <div className="skeleton h-16 w-16 rounded-xl" />
          </div>
          <div className="mt-3 skeleton h-3 w-3/4 rounded-full" />
        </div>
      ))}
    </div>
  );
}

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
        <HistorySkeleton />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No outfits logged yet"
          description="When you tap “I wore this” on a suggestion, it'll show up here and be deprioritized next time."
        />
      ) : (
        <motion.div 
          className="space-y-4"
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.04 } }
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "100px" }}
        >
          {entries.map((entry) => {
            const wornItems = (entry.item_ids || [])
              .map((id) => itemMap[id])
              .filter(Boolean);
            return (
              <motion.div
                key={entry.id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
                }}
                className="group rounded-2xl border bg-card p-4 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 cursor-pointer [&_img]:transition-all [&_img]:duration-300 [&_img]:ease-out hover:[&_img]:scale-[1.03] hover:[&_img]:brightness-105"
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
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
