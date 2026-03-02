import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Shield,
  AlertTriangle,
  Activity,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface SecurityEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  severity: string;
  ip_address: string | null;
  user_agent: string | null;
  risk_score: number;
  blocked: boolean;
  ai_analysis: string | null;
  created_at: string;
}

interface SecurityAlert {
  id: string;
  event_id: string;
  alert_type: string;
  message: string;
  acknowledged: boolean;
  created_at: string;
}

export default function SecurityDashboard() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    blocked: 0,
    critical: 0,
    lastHour: 0,
  });
  const { showToast } = useToast();

  useEffect(() => {
    loadSecurityData();

    const channel = supabase
      .channel('security-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_guard_events',
        },
        (payload) => {
          setEvents((prev) => [payload.new as SecurityEvent, ...prev].slice(0, 100));
          updateStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_guard_alerts',
        },
        (payload) => {
          setAlerts((prev) => [payload.new as SecurityAlert, ...prev]);
          showToast('New security alert', 'error');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);

      const { data: eventsData, error: eventsError } = await supabase
        .from('security_guard_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (eventsError) throw eventsError;

      const { data: alertsData, error: alertsError } = await supabase
        .from('security_guard_alerts')
        .select('*')
        .eq('acknowledged', false)
        .order('created_at', { ascending: false });

      if (alertsError) throw alertsError;

      setEvents(eventsData || []);
      setAlerts(alertsData || []);
      updateStats(eventsData || []);
    } catch (error) {
      console.error('Error loading security data:', error);
      showToast('Failed to load security data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (eventsList = events) => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    setStats({
      total: eventsList.length,
      blocked: eventsList.filter((e) => e.blocked).length,
      critical: eventsList.filter((e) => e.severity === 'critical').length,
      lastHour: eventsList.filter(
        (e) => new Date(e.created_at) > oneHourAgo
      ).length,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getRiskColor = (score: number) => {
    if (score > 75) return 'text-red-600';
    if (score > 50) return 'text-orange-600';
    if (score > 25) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-on-background">Loading security dashboard...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-on-background">
            AI Security Guard
          </h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-surface p-6 rounded-lg border border-outline">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant">Total Events</p>
                <p className="text-3xl font-bold text-on-surface mt-1">
                  {stats.total}
                </p>
              </div>
              <Activity className="w-10 h-10 text-primary opacity-50" />
            </div>
          </div>

          <div className="bg-surface p-6 rounded-lg border border-outline">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant">Blocked</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {stats.blocked}
                </p>
              </div>
              <Ban className="w-10 h-10 text-red-600 opacity-50" />
            </div>
          </div>

          <div className="bg-surface p-6 rounded-lg border border-outline">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant">Critical</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {stats.critical}
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-orange-600 opacity-50" />
            </div>
          </div>

          <div className="bg-surface p-6 rounded-lg border border-outline">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant">Last Hour</p>
                <p className="text-3xl font-bold text-primary mt-1">
                  {stats.lastHour}
                </p>
              </div>
              <Clock className="w-10 h-10 text-primary opacity-50" />
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-red-900">
                Active Alerts ({alerts.length})
              </h2>
            </div>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white p-4 rounded border border-red-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-red-900">
                        {alert.alert_type}
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-red-600 mt-2">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Events */}
        <div className="bg-surface rounded-lg border border-outline">
          <div className="p-6 border-b border-outline">
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-on-surface">
                Recent Security Events
              </h2>
            </div>
          </div>

          <div className="divide-y divide-outline">
            {events.slice(0, 20).map((event) => (
              <div key={event.id} className="p-4 hover:bg-surface-variant">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {event.blocked ? (
                      <XCircle className="w-6 h-6 text-red-600" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                          event.severity
                        )}`}
                      >
                        {event.severity.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium text-on-surface">
                        {event.event_type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span
                        className={`text-sm font-bold ${getRiskColor(
                          event.risk_score
                        )}`}
                      >
                        Risk: {event.risk_score}
                      </span>
                    </div>

                    {event.ai_analysis && (
                      <p className="text-sm text-on-surface-variant mb-2">
                        {event.ai_analysis}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                      {event.ip_address && (
                        <span>IP: {event.ip_address}</span>
                      )}
                      <span>{new Date(event.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
