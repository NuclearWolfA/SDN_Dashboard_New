import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import "@/styles/components/RouteAnalysis.css";

const API_BASE_URL = "http://localhost:8000";

type FullRouteApi = {
  full_route_id: number;
  source: string | null;
  destination: string | null;
  dest_seq_num: number;
  path: string[];
  hop_count: number;
  is_complete: boolean;
  updated_at: string;
};

type RouteStatus = "active" | "backup" | "failed";

const statusConfig: Record<RouteStatus, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  active: { icon: CheckCircle, color: "text-node-online", bg: "bg-node-online/10", label: "Complete" },
  backup: { icon: AlertCircle, color: "text-node-warning", bg: "bg-node-warning/10", label: "Incomplete" },
  failed: { icon: XCircle, color: "text-node-offline", bg: "bg-node-offline/10", label: "Broken" },
};

function classifyRoute(route: FullRouteApi): RouteStatus {
  if (!route.path.length || route.hop_count < 1) {
    return "failed";
  }
  return route.is_complete ? "active" : "backup";
}

function shortId(nodeId: string | null): string {
  if (!nodeId) {
    return "----";
  }
  return nodeId.slice(-4).toUpperCase();
}

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function RouteAnalysis() {
  const [routes, setRoutes] = useState<FullRouteApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFullRoutes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/routeview/loadall/full-routes`);
        if (!response.ok) {
          throw new Error("Failed to fetch full routes");
        }

        const data: FullRouteApi[] = await response.json();
        setRoutes(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchFullRoutes();
  }, []);

  return (
    <div className="h-full rounded-lg border border-border overflow-hidden">
      <div className="p-3 border-b border-border font-mono text-xs text-muted-foreground">
        ROUTE ANALYSIS - FULL ROUTES
      </div>

      <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-thin">
        {loading && (
          <div className="rounded-lg border border-border bg-card p-4 font-mono text-xs text-muted-foreground">
            Loading full routes...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-node-offline/30 bg-node-offline/5 p-4 font-mono text-xs text-node-offline">
            Failed to load routes: {error}
          </div>
        )}

        {!loading && !error && routes.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-4 font-mono text-xs text-muted-foreground">
            No full routes found. Trigger a rebuild from backend API first.
          </div>
        )}

        {!loading && !error && routes.map((route) => {
          const status = classifyRoute(route);
          const cfg = statusConfig[status];
          const Icon = cfg.icon;

          return (
            <div key={route.full_route_id} className="rounded-lg border border-border bg-card p-4 space-y-3 hover:border-primary/20 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-sm">
                  <span className="text-primary font-semibold">{shortId(route.source)}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-primary font-semibold">{shortId(route.destination)}</span>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${cfg.bg} ${cfg.color}`}>
                  <Icon className="h-3 w-3" />
                  {cfg.label}
                </span>
              </div>

              {/* Path visualization */}
              <div className="flex items-center gap-1 font-mono text-[11px]">
                {route.path.map((hop, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded border
                      ${status === "failed" ? "border-node-offline/30 text-node-offline" :
                        "border-primary/30 text-primary"}`}>
                      {shortId(hop)}
                    </span>
                    {i < route.path.length - 1 && (
                      <ArrowRight className={`h-3 w-3 ${status === "failed" ? "text-node-offline/40" : "text-secondary/60"}`} />
                    )}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <span className="text-muted-foreground">Hops</span>
                  <div className="text-card-foreground font-semibold">{route.hop_count}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Dest Seq</span>
                  <div className="text-card-foreground font-semibold">{route.dest_seq_num}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Updated</span>
                  <div className="text-card-foreground font-semibold">{formatTime(route.updated_at)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
