export interface MeshtasticNode {
  id: string;
  long_name: string;
  hw_model: string;
  snr: number | null;
  battery_level: number | null;
  status: "online" | "offline";
  hops_away: number | null;
  gps_coordinates: string | null;
  role: string | null;
}

export interface NodeDisplayData {
  id: string;
  name: string;
  role: string | null;
  hwModel: string;
  snr: string;
  batteryLevel: string;
  status: "online" | "offline" | "warning";
  hopsAway: string;
  coordinates: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
}

export function transformNodeData(node: MeshtasticNode): NodeDisplayData {
  let latitude: number | undefined;
  let longitude: number | undefined;
  let altitude: number | undefined;
  
  if (node.gps_coordinates) {
    const coords = node.gps_coordinates.split(',');
    if (coords.length === 3) {
      latitude = parseFloat(coords[0]);
      longitude = parseFloat(coords[1]);
      altitude = parseFloat(coords[2]);
    }
  }

  return {
    id: node.id,
    name: node.long_name,
    role: node.role,
    hwModel: node.hw_model,
    snr: node.snr !== null ? `${node.snr.toFixed(2)} dB` : "—",
    batteryLevel: node.battery_level !== null ? `${node.battery_level}%` : "—",
    status: node.status,
    hopsAway: node.hops_away !== null ? String(node.hops_away) : "—",
    coordinates: node.gps_coordinates || "—",
    latitude,
    longitude,
    altitude,
  };
}
