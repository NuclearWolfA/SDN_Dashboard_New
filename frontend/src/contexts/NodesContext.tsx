import React, { createContext, useContext, ReactNode } from 'react';
import { useNodes } from '@/hooks/useNodes';
import { NodeDisplayData } from '@/types/nodes';

interface NodesContextType {
  nodes: NodeDisplayData[];
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
  refetch: () => Promise<void>;
}

const NodesContext = createContext<NodesContextType | undefined>(undefined);

export function NodesProvider({ children }: { children: ReactNode }) {
  const nodesData = useNodes();
  
  return (
    <NodesContext.Provider value={nodesData}>
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
