import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Bell, TrendingUp, Info, DollarSign, Percent, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { alertsService, Alert } from "../../services/alertsService";
import { formatCurrency, formatNumber, formatPercent, formatCompactNumber } from "../../utils/formatters";

export function AlertsView() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertsService.getAll();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
      toast.error("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await alertsService.update(id, { status: 'triggered' });
      setAlerts(alerts.map(alert =>
        alert.id === id ? { ...alert, status: 'triggered' } : alert
      ));
      toast.success("Alert marked as read");
    } catch (error) {
      toast.error("Failed to update alert");
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      await alertsService.delete(id);
      setAlerts(alerts.filter(a => a.id !== id));
      toast.success("Alert deleted");
    } catch (error) {
      toast.error("Failed to delete alert");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'price_above':
      case 'price_below':
        return TrendingUp;
      case 'percent_change':
        return Percent;
      case 'volume':
        return DollarSign;
      default:
        return Info;
    }
  };

  const formatTargetValue = (alert: Alert) => {
    const val = Number(alert.targetValue);
    switch (alert.type) {
      case 'price_above':
      case 'price_below':
        return formatCurrency(val);
      case 'percent_change':
        return formatPercent(val);
      case 'volume':
        return formatCompactNumber(val);
      default:
        return formatNumber(val);
    }
  };

  const alertList = Array.isArray(alerts) ? alerts : [];
  const unreadCount = alertList.filter(a => a.status === 'active').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl">Alerts & Notifications</h2>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount} active
              </Badge>
            )}
          </div>
          <p className="text-sm text-neutral-500 mt-1">Stay informed about your investments</p>
        </div>
        <Button
          className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        >
          <Plus className="w-4 h-4" />
          Create Alert
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border p-6">
          <div className="text-sm text-muted-foreground mb-2">Total Alerts</div>
          <div className="text-3xl mb-1 text-foreground">{alerts.length}</div>
          <div className="text-xs text-muted-foreground">All time</div>
        </Card>
        <Card className="bg-card border-border p-6">
          <div className="text-sm text-muted-foreground mb-2">Active</div>
          <div className="text-3xl mb-1 text-cyan-400">{unreadCount}</div>
          <div className="text-xs text-muted-foreground">Monitoring</div>
        </Card>
        <Card className="bg-card border-border p-6">
          <div className="text-sm text-muted-foreground mb-2">Triggered</div>
          <div className="text-3xl mb-1 text-green-400">
            {alerts.filter(a => a.status === 'triggered').length}
          </div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </Card>
      </div>

      {/* Alerts List */}
      <Card className="bg-card/50 border-border p-6">
        <h3 className="text-lg mb-4 text-foreground">Recent Alerts</h3>

        {alerts.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No alerts configured</p>
            <p className="text-sm mt-2">Create your first price alert to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const Icon = getIcon(alert.type);
              const isActive = alert.status === 'active';

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border transition-all ${isActive
                    ? 'bg-accent/50 border-border'
                    : 'bg-accent/20 border-border/30'
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-accent/30 border border-border/20'
                      }`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-muted-foreground'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-mono">{alert.symbol}</h4>
                          {isActive && (
                            <div className="w-2 h-2 rounded-full bg-cyan-400" />
                          )}
                        </div>
                        <Badge variant="secondary" className="bg-accent text-muted-foreground">
                          {alert.type.replace('_', ' ')}
                        </Badge>
                      </div>

                      <p className="text-sm text-neutral-400 mb-2">
                        Target: {formatTargetValue(alert)}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500">
                          {alert.message || `Alert for ${alert.symbol}`}
                        </span>
                        <div className="flex gap-2">
                          {isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkRead(alert.id)}
                              className="h-7 text-xs hover:text-cyan-400"
                            >
                              Mark triggered
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="h-7 text-xs hover:text-red-400"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
