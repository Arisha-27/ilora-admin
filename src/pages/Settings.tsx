import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { theme, setTheme, systemTheme } = useTheme();
  const { toast } = useToast();
  const [density, setDensity] = useState<string>(localStorage.getItem("ui-density") || "comfortable");
  const [reducedMotion, setReducedMotion] = useState<boolean>(localStorage.getItem("ui-reduced-motion") === "true");

  useEffect(() => {
    document.title = "Settings • ILORA RETREATS Dashboard";
  }, []);

  const applyDensity = (value: string) => {
    setDensity(value);
    localStorage.setItem("ui-density", value);
    document.documentElement.dataset.density = value;
    toast({ title: "Density updated", description: `Interface density set to ${value}.` });
  };

  const applyReducedMotion = (value: boolean) => {
    setReducedMotion(value);
    localStorage.setItem("ui-reduced-motion", String(value));
    document.documentElement.style.setProperty("--motion-ok", value ? "0" : "1");
    toast({ title: "Motion preference saved", description: value ? "Reduced motion enabled." : "Full motion enabled." });
  };

  const currentThemeLabel = theme === "system" ? `System (${systemTheme || "light"})` : (theme || "light");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Personalize your dashboard experience.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Theme and visual preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select defaultValue={theme || "system"} onValueChange={(v) => { setTheme(v); toast({ title: "Theme updated", description: `Theme set to ${v}.` }); }}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Current: {currentThemeLabel}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Compact mode</Label>
                <p className="text-xs text-muted-foreground">Reduce paddings for dense data tables.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => applyDensity("comfortable")} aria-pressed={density === "comfortable"}>Comfortable</Button>
                <Button variant="outline" size="sm" onClick={() => applyDensity("compact")} aria-pressed={density === "compact"}>Compact</Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Reduce motion</Label>
                <p className="text-xs text-muted-foreground">Limit animations for accessibility.</p>
              </div>
              <Switch checked={reducedMotion} onCheckedChange={applyReducedMotion} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Basic preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Show tips</Label>
                <p className="text-xs text-muted-foreground">Display helpful hints in the UI.</p>
              </div>
              <Switch defaultChecked={localStorage.getItem("ui-show-tips") !== "false"} onCheckedChange={(v) => { localStorage.setItem("ui-show-tips", String(v)); toast({ title: "Preference saved", description: v ? "Tips enabled." : "Tips disabled." }); }} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Reset personalization</Label>
                <p className="text-xs text-muted-foreground">Restore default settings.</p>
              </div>
              <Button variant="destructive" onClick={() => {
                localStorage.removeItem("ui-density");
                localStorage.removeItem("ui-reduced-motion");
                localStorage.removeItem("ui-show-tips");
                setDensity("comfortable");
                setReducedMotion(false);
                document.documentElement.dataset.density = "comfortable";
                document.documentElement.style.setProperty("--motion-ok", "1");
                toast({ title: "Reset complete", description: "All preferences restored." });
              }}>Reset</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
