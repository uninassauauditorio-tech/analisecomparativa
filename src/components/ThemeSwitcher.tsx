import { Palette, Check } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { theme: activeTheme, setTheme, themes } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" title="Mudar tema">
          <Palette className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="grid grid-cols-1 gap-2">
          <p className="text-sm font-medium text-muted-foreground px-2 py-1.5">Paletas de Cores</p>
          {themes.map((theme) => {
            const isActive = activeTheme === theme.name;
            return (
              <Button
                key={theme.name}
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-accent text-accent-foreground"
                )}
                onClick={() => setTheme(theme.name)}
              >
                <div
                  className="mr-2 h-5 w-5 rounded-full border"
                  style={{ backgroundColor: `hsl(${theme.colors.light.primary})` }}
                />
                <span>{theme.label}</span>
                {isActive && <Check className="ml-auto h-4 w-4" />}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}