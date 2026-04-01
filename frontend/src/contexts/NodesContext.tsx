import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback, useMemo } from 'react';
import { useNodes } from '@/hooks/useNodes';
import { NodeDisplayData } from '@/types/nodes';

interface NodesContextType {
  nodes: NodeDisplayData[];
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
  refetch: () => Promise<void>;
  selfNodeId: string | null;
  selfNodeIdShort: string | null;      // Last 4 chars (e.g., "1a2b")
  selfNodeIdLongName: string | null;   // "Meshtastic 1a2b"
  setSelfNodeId: (nodeId: string | null) => void;
}

const NodesContext = createContext<NodesContextType | undefined>(undefined);

const STORAGE_KEY = 'selfNodeId';

export function NodesProvider({ children }: { children: ReactNode }) {
  const nodesData = useNodes();
  const [selfNodeId, setSelfNodeIdState] = useState<string | null>(null);
  
  // Load self node ID from localStorage on mount
  useEffect(() => {
    const storedId = localStorage.getItem(STORAGE_KEY);
    if (storedId) {
      setSelfNodeIdState(storedId);
    }
  }, []);
  
  // Compute short and long name formats from selfNodeId
  const selfNodeIdShort = useMemo(() => {
    if (!selfNodeId) return null;
    return selfNodeId.replace(/^0x/, "").slice(-4);
  }, [selfNodeId]);
  
  const selfNodeIdLongName = useMemo(() => {
    if (!selfNodeIdShort) return null;
    return `Meshtastic ${selfNodeIdShort}`;
  }, [selfNodeIdShort]);
  
  // Setter that updates both state and localStorage
  const setSelfNodeId = useCallback((nodeId: string | null) => {
    setSelfNodeIdState(nodeId);
    if (nodeId) {
      localStorage.setItem(STORAGE_KEY, nodeId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);
  
  return (
    <NodesContext.Provider value={{ 
      ...nodesData, 
      selfNodeId,
      selfNodeIdShort,
      selfNodeIdLongName,
      setSelfNodeId
    }}>
      {children}
    </NodesContext.Provider>
  );
}

export function useNodesContext() {
  const context = useContext(NodesContext);
  if (!context) {
    throw new Error('useNodesContext must be used within NodesProvider');
  }
  return context;
}
