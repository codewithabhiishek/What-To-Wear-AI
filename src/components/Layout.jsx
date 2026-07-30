import { Outlet, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Shirt, Sparkles, Clock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Closet", icon: Shirt, end: true },
  { to: "/what-to-wear", label: "What to Wear", icon: Sparkles, end: false },
  { to: "/history", label: "History", icon: Clock, end: false },
];

export default function Layout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-background">
              <Shirt className="h-4 w-4" />
            </span>
            <span className="font-heading text-base font-semibold tracking-tight">
              Wardrobe
            </span>
          </NavLink>
          <div className="flex items-center gap-2">
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      "tactile inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground",
                    )
                  }
                >
                  <Icon className="h-4 w-4" /> {label}
                </NavLink>
              ))}
            </nav>
            <NavLink
              to="/settings"
              aria-label="Settings"
              className={({ isActive }) =>
                cn(
                  "tactile grid h-9 w-9 place-items-center rounded-full transition-colors",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              <Settings className="h-4 w-4" />
            </NavLink>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 pb-24 md:pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
        <div className="mx-auto max-w-6xl px-2 h-16 flex items-center justify-around">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "tactile flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )
              }
            >
              <Icon className="h-5 w-5" /> {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
