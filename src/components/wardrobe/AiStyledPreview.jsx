import { useEffect, useState } from "react";
import { AlertCircle, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateAiStyledPreview } from "@/lib/aiStyledPreview";
import MannequinOutfit from "./MannequinOutfit";

const steps = ["Preparing your garment references", "Creating studio styling", "Finishing the catalog preview"];

export default function AiStyledPreview({ items, className }) {
  const [state, setState] = useState({ status: "idle", imageUrl: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let generatedUrl;
    setState({ status: "loading", imageUrl: null, error: null });
    generateAiStyledPreview(items)
      .then(({ imageUrl }) => {
        generatedUrl = imageUrl;
        if (active) {
          setState({ status: "ready", imageUrl, error: null });
        } else {
          URL.revokeObjectURL(imageUrl);
        }
      })
      .catch((error) => {
        if (active) setState({ status: "error", imageUrl: null, error: error.message });
      });
    return () => {
      active = false;
      if (generatedUrl) URL.revokeObjectURL(generatedUrl);
    };
  }, [items, attempt]);

  if (state.status === "ready") {
    return (
      <div className={`relative h-full w-full ${className || ""}`}>
        <img src={state.imageUrl} alt="AI generated styled preview of your selected outfit" className="h-full w-full object-cover" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm"><Sparkles className="h-3 w-3" /> AI Styled Preview · Beta</span>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="relative h-full w-full">
        <MannequinOutfit items={items} className="h-full w-full" />
        <div className="absolute inset-x-3 bottom-3 rounded-xl border border-amber-500/25 bg-background/95 p-3 shadow-lg backdrop-blur">
          <div className="flex gap-2 text-xs text-foreground"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><p>AI preview is unavailable. Showing Styled Form instead.</p></div>
          <Button variant="outline" size="sm" className="mt-2 h-8 text-xs" onClick={() => setAttempt((value) => value + 1)}><RefreshCw className="mr-1.5 h-3.5 w-3.5" />Retry AI preview</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_20%,#fff,#eceeea)] p-6 text-center">
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-black text-white"><Loader2 className="h-5 w-5 animate-spin" /></div>
      <p className="text-sm font-semibold">Creating AI Styled Preview</p>
      <div className="mt-4 space-y-2 text-left text-xs text-muted-foreground">
        {steps.map((step, index) => <div className="flex items-center gap-2" key={step}><span className={`h-1.5 w-1.5 rounded-full ${index === 1 ? "animate-pulse bg-foreground" : "bg-foreground/35"}`} />{step}</div>)}
      </div>
      <p className="mt-5 max-w-xs text-[10px] leading-relaxed text-muted-foreground">Generated from your uploaded garments using AI. Minor visual differences may occur.</p>
    </div>
  );
}
