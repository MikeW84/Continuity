
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { publishEvent, SectionVisibility } from "@/lib/events";
import QuotesManager from "@/components/settings/QuotesManager";

const SettingsPage = () => {
  const { toast } = useToast();
  const [theme, setTheme] = useState("light");
  
  // Section visibility states
  const [visibilitySettings, setVisibilitySettings] = useState<SectionVisibility>({
    dashboard: true,
    today: true,
    projects: true,
    ideas: true,
    learning: true,
    habits: true,
    exercise: true,
    family: true,
    values: true
  });

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('visibilitySettings');
    if (savedSettings) {
      setVisibilitySettings(JSON.parse(savedSettings));
    }
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const handleToggleSection = (section: keyof typeof visibilitySettings) => {
    // Create updated settings
    const updatedSettings = {
      ...visibilitySettings,
      [section]: !visibilitySettings[section]
    };
    
    // Update state
    setVisibilitySettings(updatedSettings);
    
    // Save to localStorage immediately
    localStorage.setItem('visibilitySettings', JSON.stringify(updatedSettings));
    
    // Publish event for immediate application
    publishEvent({
      type: 'VISIBILITY_SETTINGS_CHANGED',
      settings: updatedSettings
    });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleSaveSettings = () => {
    // Save theme setting to localStorage
    localStorage.setItem('theme', theme);
    
    // In a real application with backend, this would also save to a database
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <Button
          onClick={handleSaveSettings}
          className="bg-accent text-white"
        >
          <i className="ri-save-line mr-2"></i>
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Combined Appearance & Section Visibility Settings */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Appearance & Visibility</CardTitle>
            <CardDescription>Customize how the application looks and which sections are visible</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Settings */}
            <div className="space-y-4">
              <h3 className="text-base font-medium">Theme</h3>
              <div className="space-y-2 max-w-md">
                <Select
                  value={theme}
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Section Visibility */}
            <div className="space-y-4">
              <h3 className="text-base font-medium">Section Visibility</h3>
              
              <div className="space-y-3">
                <h4 className="text-sm text-muted-foreground">Main Sections</h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="dashboard-visibility" className="font-medium">Dashboard</Label>
                  <Switch
                    id="dashboard-visibility"
                    checked={visibilitySettings.dashboard}
                    onCheckedChange={() => handleToggleSection('dashboard')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="today-visibility" className="font-medium">Today</Label>
                  <Switch
                    id="today-visibility"
                    checked={visibilitySettings.today}
                    onCheckedChange={() => handleToggleSection('today')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="projects-visibility" className="font-medium">Projects</Label>
                  <Switch
                    id="projects-visibility"
                    checked={visibilitySettings.projects}
                    onCheckedChange={() => handleToggleSection('projects')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="ideas-visibility" className="font-medium">Ideas</Label>
                  <Switch
                    id="ideas-visibility"
                    checked={visibilitySettings.ideas}
                    onCheckedChange={() => handleToggleSection('ideas')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="learning-visibility" className="font-medium">Learning</Label>
                  <Switch
                    id="learning-visibility"
                    checked={visibilitySettings.learning}
                    onCheckedChange={() => handleToggleSection('learning')}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm text-muted-foreground">Health & Fitness</h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="habits-visibility" className="font-medium">Habits</Label>
                  <Switch
                    id="habits-visibility"
                    checked={visibilitySettings.habits}
                    onCheckedChange={() => handleToggleSection('habits')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="exercise-visibility" className="font-medium">Exercise</Label>
                  <Switch
                    id="exercise-visibility"
                    checked={visibilitySettings.exercise}
                    onCheckedChange={() => handleToggleSection('exercise')}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm text-muted-foreground">Personal</h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="family-visibility" className="font-medium">Family</Label>
                  <Switch
                    id="family-visibility"
                    checked={visibilitySettings.family}
                    onCheckedChange={() => handleToggleSection('family')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="values-visibility" className="font-medium">Values & Dreams</Label>
                  <Switch
                    id="values-visibility"
                    checked={visibilitySettings.values}
                    onCheckedChange={() => handleToggleSection('values')}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Motivational Quotes */}
        <QuotesManager />

        {/* Data Management */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Manage your personal data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="w-full">Export All Data</Button>
              <Button variant="outline" className="w-full text-destructive hover:text-destructive">Delete All Data</Button>
            </div>
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                Data export includes all your tasks, projects, habits, and other personal information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
