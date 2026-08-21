import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import {
  Shirt,
  Sparkles,
  Wand2,
  Layers,
  Heart,
  Sun,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Flame,
  Palette,
  Camera,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Camera,
      title: "AI Wardrobe Digitizer",
      tag: "INSTANT UPLOAD",
      desc: "Upload photos of your clothes. AI automatically removes backgrounds and tags category, color, fit, formality, and material.",
    },
    {
      icon: Wand2,
      title: "Occasion-Based Styling",
      tag: "SMART MATCHING",
      desc: "Pick any occasion — Work, Casual, Date Night, Gym, Party, or Smart Casual. AI scores color harmonies and fits from your real clothes.",
    },
    {
      icon: Sun,
      title: "Weather & Seasonal Intel",
      tag: "REAL-TIME",
      desc: "Never underdress or overheat. Outfits are generated taking local climate, temperature layers, and comfort into account.",
    },
    {
      icon: Palette,
      title: "Color Theory Algorithms",
      tag: "AESTHETICS",
      desc: "Built on classic menswear & womenswear color wheel rules. Generates complementary, monochromatic, and analogous palettes.",
    },
    {
      icon: Heart,
      title: "Favorites & Outfit Log",
      tag: "WARDROBE TRACKING",
      desc: "Save your favorite combinations and track wear frequency so you maximize your wardrobe without buying duplicate clothes.",
    },
    {
      icon: ShieldCheck,
      title: "100% Free & Private",
      tag: "ZERO PAYWALLS",
      desc: "No premium locks, no subscription walls. Your wardrobe data stays cloud-synced with secure private storage.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Snap & Upload",
      desc: "Take quick photos of your tops, bottoms, shoes, and outerwear. Background removal cleans them automatically.",
    },
    {
      num: "02",
      title: "Pick Your Vibe",
      desc: "Select where you're heading today — Casual coffee, office meeting, or evening drinks.",
    },
    {
      num: "03",
      title: "Wear with Confidence",
      desc: "Get instant ranked outfit combinations matched perfectly from items you already own.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-body selection:bg-foreground selection:text-background">
      {/* ---------------- NAVIGATION BAR ---------------- */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-foreground text-background shadow-sm transition-transform group-hover:scale-105">
              <Shirt className="h-5 w-5" />
            </span>
            <span className="font-heading text-xl font-bold tracking-tight">
              What To Wear AI
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/closet">
                <Button className="rounded-full px-5 font-semibold text-sm">
                  Open Closet <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/register">
                  <Button className="rounded-full px-5 font-semibold text-sm shadow-sm">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ---------------- HERO SECTION ---------------- */}
      <section className="px-4 pt-12 pb-16 md:pt-20 md:pb-24 max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3.5 py-1.5 text-xs font-semibold text-foreground/85 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-foreground" />
              <span>Your Personal AI Wardrobe Stylist</span>
            </div>

            {/* Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]">
              Stop staring at your closet. <br />
              <span className="bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">
                Know what to wear.
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed font-normal">
              Digitize your real clothes in seconds. Our AI stylist combines color theory, formality, and current weather to generate effortless outfits every single morning.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to={isAuthenticated ? "/closet" : "/register"}>
                <Button size="lg" className="rounded-full px-7 text-base font-semibold h-13 shadow-md">
                  {isAuthenticated ? "Go to My Closet" : "Start Styling — It's Free"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              {!isAuthenticated && (
                <Link to="/login">
                  <Button size="lg" variant="outline" className="rounded-full px-6 text-base font-medium h-13">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Trust Checklist */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 text-xs font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-foreground" />
                <span>100% Free Forever</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-foreground" />
                <span>AI Background Removal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-foreground" />
                <span>Works on All Devices</span>
              </div>
            </div>
          </div>

          {/* Interactive Hero Preview Showcase */}
          <div className="relative">
            <div className="rounded-3xl border bg-card p-6 shadow-xl relative z-10 space-y-5">
              {/* Header inside mockup */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-foreground text-background grid place-items-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm">Today's Recommendation</h3>
                    <p className="text-xs text-muted-foreground">Occasion: Smart Casual · 22°C Clear</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-1 text-xs border border-emerald-500/20">
                  98% Match
                </span>
              </div>

              {/* Outfit Items Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border bg-muted/40 p-3 text-center space-y-2">
                  <div className="h-20 rounded-xl bg-background border flex items-center justify-center text-3xl">
                    🧥
                  </div>
                  <p className="text-xs font-semibold truncate">Navy Overshirt</p>
                  <span className="text-[10px] text-muted-foreground block">Top Layer</span>
                </div>

                <div className="rounded-2xl border bg-muted/40 p-3 text-center space-y-2">
                  <div className="h-20 rounded-xl bg-background border flex items-center justify-center text-3xl">
                    👖
                  </div>
                  <p className="text-xs font-semibold truncate">Off-White Chinos</p>
                  <span className="text-[10px] text-muted-foreground block">Bottom</span>
                </div>

                <div className="rounded-2xl border bg-muted/40 p-3 text-center space-y-2">
                  <div className="h-20 rounded-xl bg-background border flex items-center justify-center text-3xl">
                    👟
                  </div>
                  <p className="text-xs font-semibold truncate">Minimal Sneakers</p>
                  <span className="text-[10px] text-muted-foreground block">Footwear</span>
                </div>
              </div>

              {/* AI Rationale Box */}
              <div className="rounded-2xl bg-muted/50 border p-3.5 text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground mr-1">Stylist Note:</span>
                Navy and off-white create a high-contrast classic palette. Layered overshirt matches today's afternoon breeze while keeping the silhouette crisp.
              </div>
            </div>

            {/* Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-foreground/5 via-foreground/10 to-transparent rounded-[2.5rem] blur-2xl -z-10" />
          </div>
        </div>
      </section>

      {/* ---------------- CORE CAPABILITIES ---------------- */}
      <section className="border-t bg-muted/30 py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="rounded-full border bg-background px-3.5 py-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Core Features
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
              A Complete Operating System for Your Closet
            </h2>
            <p className="text-muted-foreground text-base">
              Everything you need to organize, style, and track what you wear without any complexity.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="rounded-3xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="h-11 w-11 rounded-2xl bg-foreground text-background grid place-items-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading font-bold text-lg">{feat.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                    {feat.tag}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- 3 STEPS ---------------- */}
      <section className="py-16 md:py-20 px-4 border-t">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
              Ready in Under 2 Minutes
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Get effortless morning outfits in 3 simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="rounded-3xl border bg-card p-6 shadow-sm space-y-3">
                <span className="font-heading text-2xl font-extrabold text-muted-foreground/40 block">
                  {s.num}
                </span>
                <h3 className="font-heading text-xl font-bold">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="border-t bg-foreground text-background py-16 md:py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Upgrade Your Daily Style Today.
          </h2>
          <p className="text-background/80 text-base sm:text-lg max-w-xl mx-auto font-normal">
            Join thousands of people getting dressed faster and smarter with zero effort.
          </p>
          <div className="pt-2">
            <Link to={isAuthenticated ? "/closet" : "/register"}>
              <Button size="lg" variant="secondary" className="rounded-full px-8 text-base font-semibold h-13 shadow-lg">
                {isAuthenticated ? "Open My Closet" : "Get Started Free — Zero Cost"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="border-t py-8 px-4 text-center text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shirt className="h-4 w-4 text-foreground" />
            <span className="font-heading font-bold text-foreground">What To Wear AI</span>
          </div>
          <p>Built by Abhishek · 100% Free Smart Stylist © 2026</p>
          <div className="flex items-center gap-4">
            <Link to={isAuthenticated ? "/closet" : "/login"} className="hover:text-foreground transition-colors">
              {isAuthenticated ? "Closet" : "Sign In"}
            </Link>
            <Link to="/register" className="hover:text-foreground transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
