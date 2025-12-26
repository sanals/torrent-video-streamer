// Centralized frontend configuration for API and WebSocket URLs.
//
// Reads from Vite env variables and provides sensible defaults for development.
// This keeps API and WS endpoints consistent across the app.

const RAW_API_URL = import.meta.env.VITE_API_URL as string | undefined;
const RAW_WS_URL = import.meta.env.VITE_WS_URL as string | undefined;

// Default dev values if envs are not set
const DEFAULT_API_URL = 'http://localhost:4000/api';
const DEFAULT_WS_URL = 'ws://localhost:4000';

export const API_BASE_URL = (RAW_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');

// If VITE_WS_URL is not set, derive WS URL from API URL (switch protocol and strip /api)
export const WS_URL = (() => {
  if (RAW_WS_URL) return RAW_WS_URL;

  try {
    const api = new URL(API_BASE_URL);
    const wsProtocol = api.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsBase = `${wsProtocol}//${api.host}`;
    return wsBase;
  } catch {
    // Fallback to a safe default
    return DEFAULT_WS_URL;
  }
})();


