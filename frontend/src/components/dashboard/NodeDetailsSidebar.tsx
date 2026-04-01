import { useNodesContext } from "@/contexts/NodesContext";
import { Activity, Wifi, WifiOff, AlertTriangle, Radio, Loader2 } from "lucide-react";
import '@/styles/components/NodeDetailsSidebar.css';
import { NodeDisplayData } from "@/types/nodes";

const statusIcon = (status: NodeDisplayData["status"]) => {
  switch (status) {
    case "online": return <Wifi className="h-3 w-3 text-node-online" />;
    case "offline": return <WifiOff className="h-3 w-3 text-node-offline" />;
    case "warning": return <AlertTriangle className="h-3 w-3 text-node-warning" />;
  }
};

interface Props {
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}

export default function NodeDetailsSidebar({ selectedNodeId, onSelectNode }: Props) {
  const { nodes, loading, error } = useNodesContext();
  const selected = nodes.find(n => n.id === selectedNodeId);

  return (
    <aside className="w-72 shrink-0 border-r border-border bg-sidebar flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary animate-pulse-glow" />
          <h2 className="font-mono text-sm font-semibold text-primary glow-text-green">MESHTASTIC NODES</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          {loading ? "Loading..." : `${nodes.filter(n => n.status === "online").length}/${nodes.length} online`}
        </p>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
        {loading && nodes.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-3 text-xs text-red-500 font-mono">
            {error}
          </div>
        ) : nodes.length === 0 ? (
          <div className="p-3 text-xs text-muted-foreground font-mono">
            No nodes found
          </div>
        ) : (
          nodes.map(node => (
            <button
              key={node.id}
              onClick={() => onSelectNode(node.id)}
              className={`w-full text-left px-3 py-2 rounded-md transition-all text-xs font-mono
                ${selectedNodeId === node.id
                  ? "bg-primary/10 border border-primary/30 glow-green"
                  : "hover:bg-muted/50 border border-transparent"
                }`}
            >
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4" />
                <span className="text-card-foreground font-medium truncate">{node.name}</span>
                <span className="ml-auto">{statusIcon(node.status)}</span>
              </div>
              <div className="text-muted-foreground mt-1 truncate text-[10px]">{node.id}</div>
            </button>
          ))
        )}
      </div>

      {/* Selected Node Detail */}
      {selected && (
        <div className="border-t border-border p-4 space-y-3 bg-surface-elevated">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4" />
            <span className="font-mono text-sm font-semibold text-primary glow-text-green truncate">{selected.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {[
              ["ID", selected.id.slice(0, 8)],
              ["HW Model", selected.hwModel],
              ["SNR", selected.snr],
              ["Status", selected.status.toUpperCase()],
              ["Battery", selected.batteryLevel],
              ["Hops", selected.hopsAway],
            ].map(([label, val]) => (
              <div key={label}>
                <div className="text-muted-foreground">{label}</div>
                <div className={`text-card-foreground truncate ${label === "Status" ?
                  selected.status === "online" ? "text-node-online" :
                  selected.status === "warning" ? "text-node-warning" : "text-node-offline"
                  : ""}`}>
                  {val}
                </div>
              </div>
            ))}
          </div>
          {selected.coordinates !== "—" && (
            <div>
              <div className="text-xs font-mono text-muted-foreground mb-1">GPS Coordinates</div>
              <div className="text-xs font-mono text-card-foreground break-all">
                {selected.latitude?.toFixed(6)}, {selected.longitude?.toFixed(6)}
              </div>
              <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                Alt: {selected.altitude}m
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
