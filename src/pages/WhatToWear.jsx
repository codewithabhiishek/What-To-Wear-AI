import { useState, useEffect, useCallback } from "react";
import { db } from "@/api/firebaseClient";
import { collection, doc, setDoc, query, orderBy, limit, getDocs } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import OccasionSelector from "@/components/wardrobe/OccasionSelector";
import OutfitCard from "@/components/wardrobe/OutfitCard";
import EmptyState from "@/components/wardrobe/EmptyState";
import { OutfitListSkeleton } from "@/components/wardrobe/Skeletons";
import { generateOutfits } from "@/lib/outfitScoring";

function describeItem(item) {
  return `${item.color_primary} ${item.pattern} ${item.fit} ${item.category} (formality ${item.formality}${
    item.material ? ", " + item.material : ""
  })`;
}

function buildExplanationPrompt(outfit, occasion) {
  const list = outfit.items.map(describeItem).join(", ");
  return `Given this outfit: ${list} for the occasion: ${occasion},
write one natural sentence (max 25 words) explaining why this outfit works —
reference the actual color/fit/formality choices. Do not use generic phrases like "great choice."`;
}

export default function WhatToWear() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [occasion, setOccasion] = useState("casual");
  const [freeText, setFreeText] = useState("");
  const [outfits, setOutfits] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loggingId, setLoggingId] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    const itemsQ = query(collection(db, "users", user.id, "clothingItems"), orderBy("created_date", "desc"), limit(200));
    const historyQ = query(collection(db, "users", user.id, "outfitHistory"), orderBy("created_date", "desc"), limit(100));

    const [itemsSnap, histSnap] = await Promise.all([
      getDocs(itemsQ),
      getDocs(historyQ)
    ]);
    
    const list = itemsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const hist = histSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    setItems(list);
    setHistory(hist);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const effectiveOccasion = freeText.trim() || occasion;

  const handleGenerate = async () => {
    setGenerating(true);
    setOutfits(null);
    try {
      const combos = generateOutfits(items, effectiveOccasion, history);

      // Fetch a one-line explanation per outfit from the API (in parallel).
      const explained = await Promise.all(
        combos.map(async (combo) => {
          let explanation = "";
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);
          try {
            const res = await fetch("/api/generate-outfit-explanation", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: buildExplanationPrompt(combo, effectiveOccasion)
              }),
              signal: controller.signal
            });
            if (res.ok) {
              const data = await res.json();
              explanation = data.explanation;
            }
          } catch {
            explanation = "";
          } finally {
            clearTimeout(timeoutId);
          }
          return { ...combo, explanation };
        }),
      );

      setOutfits(explained);
    } finally {
      setGenerating(false);
    }
  };

  const handleWoreThis = async (outfit) => {
    if (!user) return;
    setLoggingId(outfit.items.map((i) => i.id).join(","));
    try {
      const newHistoryRef = doc(collection(db, "users", user.id, "outfitHistory"));
      await setDoc(newHistoryRef, {
        item_ids: outfit.items.map((i) => i.id),
        occasion: effectiveOccasion,
        explanation: outfit.explanation || "",
        created_date: new Date().toISOString()
      });
      await load();
    } finally {
      setLoggingId(null);
    }
  };

  const noClothes = items.length === 0;
  const hasTopsAndBottoms =
    items.some((i) => i.category === "top") &&
    items.some((i) => i.category === "bottom");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          What should I wear?
        </h1>
        <p className="text-sm text-muted-foreground">
          Pick an occasion — we'll build real combos from your closet.
        </p>
      </div>

      {noClothes ? (
        <EmptyState
          icon={Sparkles}
          title="Add clothes first"
          description="Upload a few items to your closet, then come back to get outfit suggestions built only from what you own."
        />
      ) : (
        <>
          <OccasionSelector
            value={occasion}
            onChange={setOccasion}
            freeText={freeText}
            onFreeTextChange={setFreeText}
          />

          <Button
            className="cta w-full sm:w-auto"
            onClick={handleGenerate}
            disabled={generating || !hasTopsAndBottoms}
            size="lg"
          >
            {generating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Building outfits…</>
            ) : (
              <><Wand2 className="mr-2 h-4 w-4" />Generate outfits</>
            )}
          </Button>

          {!hasTopsAndBottoms && (
            <p className="text-sm text-muted-foreground">
              You need at least one top and one bottom to build an outfit.
            </p>
          )}

          {generating && <OutfitListSkeleton count={3} />}

          {!generating && outfits && outfits.length === 0 && (
            <EmptyState
              icon={Sparkles}
              title="No strong matches found"
              description="Try a different occasion, or add more variety (tops, bottoms, shoes) to your closet so more combinations become possible."
            />
          )}

          {!generating && outfits && outfits.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {outfits.map((outfit, idx) => {
                const key = outfit.items.map((i) => i.id).join(",") + idx;
                return (
                  <OutfitCard
                    key={key}
                    outfit={outfit}
                    explanation={outfit.explanation}
                    isLogging={
                      loggingId === outfit.items.map((i) => i.id).join(",")
                    }
                    onWoreThis={() => handleWoreThis(outfit)}
                  />
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
