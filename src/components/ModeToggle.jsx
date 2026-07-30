import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/lib/ThemeProvider"
import { cn } from "@/lib/utils"

export function ModeToggle({ className }) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === "dark") setTheme("light")
    else if (theme === "light") setTheme("dark")
    else {
      // If system, switch to the opposite of what system currently is
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      setTheme(systemTheme === "dark" ? "light" : "dark")
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "tactile grid h-9 w-9 place-items-center rounded-full transition-colors text-muted-foreground hover:text-foreground hover:bg-muted",
        className
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches) ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  )
}
