import { useState, useEffect } from 'react';

export function useAlertSocket() {
  const [lastAlert, setLastAlert] = useState(null);

  useEffect(() => {
    // Get base URL and convert http(s):// to ws(s)://
    const baseUrl = import.meta.env.VITE_API_URL || 'https://asthmaguard.onrender.com/api';
    const wsUrl = baseUrl.replace(/^http/, 'ws').replace(/\/api$/, '/ws/alerts');

    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastAlert(data);
      } catch (e) {
        console.error("Failed to parse websocket message", e);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  return lastAlert;
}
