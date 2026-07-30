import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { db } from "@/api/firebaseClient";
import { collection, doc, setDoc, query, orderBy, limit, getDocs } from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Wand2, Check } from "lucide-react";
import OccasionSelector from "@/components/wardrobe/OccasionSelector";
import OutfitCard from "@/components/wardrobe/OutfitCard";
import EmptyState from "@/components/wardrobe/EmptyState";
import { generateOutfits } from "@/lib/outfitScoring";

function LoadingChecklist() {
  const steps = [
    "Checking colors",
    "Matching styles",
    "Ranking combinations",
    "Choosing the best outfits"
  ];
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="my-8 rounded-2xl border bg-card p-6 shadow-sm max-w-md mx-auto space-y-4 text-center">
      <div className="flex items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <h3 className="font-semibold text-base">Analyzing your wardrobe…</h3>
      </div>
      <div className="space-y-2 text-left text-sm text-muted-foreground pt-2">
        {steps.map((step, idx) => (
          <div key={step} className="flex items-center gap-2.5 transition-opacity duration-300">
            {idx < activeStep ? (
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : idx === activeStep ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
            ) : (
              <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />
            )}
            <span className={idx <= activeStep ? "text-foreground font-medium" : "opacity-40"}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function describeItem(item) {
  return `${item.color_primary} ${item.pattern} ${item.fit} ${item.category} (formality ${item.formality}${
    item.material ? ", " + item.material : ""
  })`;
}

function buildExplanationPrompt(outfit, occasion) {
  const list = outfit.items.map(describeItem).join(", ");
  return `Given this outfit: ${list} for the occasion: ${occasion},
write a short, natural human phrase (UNDER 12 WORDS) describing the style vibe.
Avoid AI jargon, analytical summaries, or robotic phrasing.
Examples of ideal tone:
- "Clean everyday outfit with balanced casual styling."
- "A classic combination that's easy to wear all day."
- "Simple, versatile, and works well for casual occasions."`;
}

export default function WhatToWear() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [occasion, setOccasion] = useState("casual");
  const [freeText, setFreeText] = useState("");
  const [outfits, setOutfits] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
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
    try {
      const combos = generateOutfits(items, effectiveOccasion, history);
      setTotalCount(combos.totalCount || combos.length);

      // Instant 0ms response: Render generated outfits immediately
      const initialOutfits = combos.map((c) => ({
        ...c,
        explanation: "A balanced combo from your closet.",
      }));
      setOutfits(initialOutfits);
      setGenerating(false);

      // Background AI explanation stream (Promise.all in background)
      Promise.all(
        combos.map(async (combo, idx) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          try {
            const res = await fetch("/api/generate-outfit-explanation", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: buildExplanationPrompt(combo, effectiveOccasion),
              }),
              signal: controller.signal,
            });
            if (res.ok) {
              const data = await res.json();
              if (data.explanation) {
                setOutfits((prev) =>
                  (prev || []).map((o, i) =>
                    i === idx ? { ...o, explanation: data.explanation } : o
                  )
                );
              }
            }
          } catch {
            /* Keep fallback explanation */
          } finally {
            clearTimeout(timeoutId);
          }
        })
      );
    } catch {
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

          {generating && <LoadingChecklist />}

          {!generating && outfits && outfits.length === 0 && (
            <EmptyState
              icon={Sparkles}
              title="No strong matches found"
              description="Try a different occasion, or add more variety (tops, bottoms, shoes) to your closet so more combinations become possible."
            />
          )}

          {!generating && outfits && outfits.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Found <strong className="text-foreground font-semibold">{totalCount || outfits.length * 2}</strong> possible combinations</span>
                </div>
                <span className="text-xs bg-muted px-2.5 py-1 rounded-full font-medium">
                  Showing top {outfits.length} matches
                </span>
              </div>

              <motion.div 
                className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch"
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
                {outfits.map((outfit, idx) => {
                  const key = outfit.items.map((i) => i.id).join(",") + idx;
                  return (
                    <motion.div
                      key={key}
                      variants={{
                        hidden: { opacity: 0, y: 16 },
                        show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
                      }}
                    >
                      <OutfitCard
                        outfit={outfit}
                        explanation={outfit.explanation}
                        occasion={effectiveOccasion}
                        isFeatured={idx === 0}
                        isLogging={
                          loggingId === outfit.items.map((i) => i.id).join(",")
                        }
                        onWoreThis={() => handleWoreThis(outfit)}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
