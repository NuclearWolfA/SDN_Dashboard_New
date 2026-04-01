// Message types matching backend database model
export interface Message {
  mes_id: number;
  source_id: string | null; // Hex string from backend
  destination_id: string | null; // Hex string from backend
  text: string;
  timestamp: string; // ISO string from backend
  rssi: number | null;
  channel: number | null;
  conversation: string | null;
  sent_by_me: boolean;
  ack_status: number;
  ack_timestamp: string | null; // ISO string from backend
}

// For displaying messages in conversation groups
export interface ConversationPreview {
  nodeId: string;
  nodeName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isLocal?: boolean;
}
