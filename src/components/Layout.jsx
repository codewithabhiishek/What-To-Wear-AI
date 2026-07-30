import { Outlet, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Shirt, Sparkles, Clock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ModeToggle";

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
          <NavLink to="/" className="flex items-center gap-3 group">
            <motion.span
              whileHover={{ scale: 1.1, rotate: [0, -10, 10, -5, 0] }}
              transition={{ duration: 0.5 }}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-foreground text-background shadow-md transition-shadow group-hover:shadow-lg"
            >
              <motion.div
                animate={{ y: [0, -2.5, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              >
                <Shirt className="h-6 w-6" />
              </motion.div>
            </motion.span>
            <motion.span
              className="font-heading text-xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/70 to-foreground bg-[length:200%_auto] bg-clip-text text-transparent hidden sm:block"
              animate={{ backgroundPosition: ["0% center", "200% center"] }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            >
              What To Wear AI
            </motion.span>
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
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 pb-28 md:pb-10">
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

      {/* Mobile bottom nav — visible below md */}
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="mx-auto max-w-6xl px-2 h-16 flex items-center justify-around">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors min-w-0",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {/* Active indicator dot above icon */}
                    {isActive && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-foreground" />
                    )}
                  </div>
                  <span className="truncate">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
