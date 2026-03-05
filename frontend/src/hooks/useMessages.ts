import { useState, useEffect, useRef } from 'react';
import { Message } from '@/types/message';

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
  sendMessage: (destinationId: string, text: string) => Promise<void>;
}

const WS_BASE_URL = 'ws://localhost:8000';
const API_BASE_URL = 'http://localhost:8000';

export function useMessages(shouldConnect: boolean = false): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch initial messages from REST API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/texting/all_messages`);
        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.statusText}`);
        }
        const data = await response.json();
        // Backend returns { status: "success", messages: [...] }
        setMessages(data.messages || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // WebSocket connection (conditional based on shouldConnect)
  useEffect(() => {
    if (!shouldConnect) {
      // Clean up if we shouldn't connect
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsConnected(false);
      return;
    }

    const connectWebSocket = () => {
      // Don't create a new connection if one already exists and is open/connecting
      if (wsRef.current && 
          (wsRef.current.readyState === WebSocket.OPEN || 
           wsRef.current.readyState === WebSocket.CONNECTING)) {
        return;
      }

      console.log('Connecting to messages WebSocket...');
      const ws = new WebSocket(`${WS_BASE_URL}/api/texting/ws/texts`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Messages WebSocket connected');
        setWsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const message: Message = JSON.parse(event.data);
          console.log('Received message:', message);
          
          // Add new message to the list
          setMessages(prev => [...prev, message]);
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('Messages WebSocket error:', event);
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        console.log('Messages WebSocket disconnected');
        setWsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect after 3 seconds if we should still be connected
        if (shouldConnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect messages WebSocket...');
            connectWebSocket();
          }, 3000);
        }
      };
    };

    connectWebSocket();

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [shouldConnect]);

  // Function to send a message
  const sendMessage = async (destinationId: string, text: string) => {
    try {
      // Backend expects 'destination' and 'text' parameters
      const url = `${API_BASE_URL}/api/texting/send?destination=${encodeURIComponent(destinationId)}&text=${encodeURIComponent(text)}`;

      const response = await fetch(url, {
        method: 'POST',
      });

      if (!response.ok) {
        let errorMessage = `Failed to send message: ${response.statusText}`;
        try {
          const errorData = await response.json();
          // Extract detail from error response
          if (errorData.detail) {
            // detail might be a string or an array of validation errors
            if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail;
            } else if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
            } else {
              errorMessage = JSON.stringify(errorData.detail);
            }
          }
        } catch (parseErr) {
          // If JSON parsing fails, use the statusText
          console.error('Failed to parse error response:', parseErr);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Message sent successfully:', result);
      
      // Message will be received via WebSocket
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  return {
    messages,
    loading,
    error,
    wsConnected,
    sendMessage,
  };
}
