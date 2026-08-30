import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Bell, Globe, Shield, Key, Loader2, Eye, EyeOff, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { settingsService, UserSettings } from "../../services/settingsService";

export function SettingsView() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.get();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await settingsService.update(settings);
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      const { apiKey } = await settingsService.generateApiKey();
      setSettings(prev => prev ? { ...prev, apiKey } : null);
      toast.success("New API key generated!");
    } catch (error) {
      toast.error("Failed to generate API key");
    }
  };

  const handleCopyApiKey = () => {
    if (settings?.apiKey) {
      navigator.clipboard.writeText(settings.apiKey);
      toast.success("API key copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl mb-1 text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="bg-accent/50 border border-border mb-6">
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Globe className="w-4 h-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="api">
            <Key className="w-4 h-4 mr-2" />
            API
          </TabsTrigger>
        </TabsList>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-card border-border p-6">
            <h3 className="text-lg mb-4 text-foreground">Notification Preferences</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-accent/30 border border-border/50">
                <div>
                  <div className="text-sm text-foreground">Email Notifications</div>
                  <div className="text-xs text-muted-foreground">Receive updates via email</div>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked: boolean) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-accent/30 border border-border/50">
                <div>
                  <div className="text-sm text-foreground">Push Notifications</div>
                  <div className="text-xs text-muted-foreground">Mobile and desktop push</div>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked: boolean) => setSettings({ ...settings, pushNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-accent/30 border border-border/50">
                <div>
                  <div className="text-sm text-foreground">Price Alerts</div>
                  <div className="text-xs text-muted-foreground">Get notified when prices change</div>
                </div>
                <Switch
                  checked={settings.priceAlerts}
                  onCheckedChange={(checked: boolean) => setSettings({ ...settings, priceAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-accent/30 border border-border/50">
                <div>
                  <div className="text-sm text-foreground">Portfolio Updates</div>
                  <div className="text-xs text-muted-foreground">Daily portfolio summaries</div>
                </div>
                <Switch
                  checked={settings.portfolioUpdates}
                  onCheckedChange={(checked: boolean) => setSettings({ ...settings, portfolioUpdates: checked })}
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Preferences
            </Button>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="bg-card border-border p-6">
            <h3 className="text-lg mb-4 text-foreground">Display & Regional Settings</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-foreground">Currency</label>
                <Select value={settings.currency} onValueChange={(value: string) => setSettings({ ...settings, currency: value })}>
                  <SelectTrigger className="bg-accent/50 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                    <SelectItem value="VND">VND - Vietnamese Dong (₫)</SelectItem>
                    <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-foreground">Language</label>
                <Select value={settings.language} onValueChange={(value: string) => setSettings({ ...settings, language: value })}>
                  <SelectTrigger className="bg-accent/50 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-foreground">Theme</label>
                <Select value={settings.theme} onValueChange={(value: string) => setSettings({ ...settings, theme: value })}>
                  <SelectTrigger className="bg-accent/50 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Preferences
            </Button>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card className="bg-card border-border p-6">
            <h3 className="text-lg mb-4 text-foreground">Security Settings</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-accent/30 border border-border/50">
                <div>
                  <div className="text-sm text-foreground">Two-Factor Authentication</div>
                  <div className="text-xs text-muted-foreground">Add an extra layer of security</div>
                </div>
                <Switch
                  checked={settings.twoFactorEnabled}
                  onCheckedChange={(checked: boolean) => setSettings({ ...settings, twoFactorEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-accent/30 border border-border/50">
                <div>
                  <div className="text-sm text-foreground">Public Profile</div>
                  <div className="text-xs text-muted-foreground">Make your profile visible to others</div>
                </div>
                <Switch
                  checked={settings.profilePublic}
                  onCheckedChange={(checked: boolean) => setSettings({ ...settings, profilePublic: checked })}
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Security Settings
            </Button>
          </Card>
        </TabsContent>

        {/* API */}
        <TabsContent value="api" className="space-y-6">
          <Card className="bg-card border-border p-6">
            <h3 className="text-lg mb-4 text-foreground">API Keys</h3>

            {settings.apiKey ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-accent/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={settings.apiKey}
                      readOnly
                      className="flex-1 bg-accent border border-border rounded px-3 py-2 font-mono text-sm text-foreground"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="border-border text-foreground"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyApiKey}
                      className="border-border text-foreground"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateApiKey}
                  variant="outline"
                  className="gap-2 border-border text-foreground"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate Key
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No API key generated yet</p>
                <Button
                  onClick={handleGenerateApiKey}
                  className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  <Key className="w-4 h-4" />
                  Generate API Key
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
