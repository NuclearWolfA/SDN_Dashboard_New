import { useState, useEffect } from 'react';
import { MeshtasticNode, NodeDisplayData, transformNodeData } from '@/types/nodes';

const API_BASE_URL = 'http://localhost:8000';

export function useNodes() {
  const [nodes, setNodes] = useState<NodeDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNodes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/routeview/loadall/nodes`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch nodes');
      }

      const data: MeshtasticNode[] = await response.json();
      const transformedNodes = data.map(transformNodeData);
      setNodes(transformedNodes);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching nodes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();

    // Refresh nodes every 5 seconds
    const interval = setInterval(fetchNodes, 5000);

    return () => clearInterval(interval);
  }, []);

  return { nodes, loading, error, refetch: fetchNodes };
}
