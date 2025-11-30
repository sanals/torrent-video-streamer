import { createContext, useReducer, useContext } from 'react';
import type { ReactNode } from 'react';
import type { TorrentData } from '@/types/torrent';

// --- Types ---
interface TorrentState {
  torrents: Record<string, TorrentData>;
  loading: boolean;
  error?: string;
}

type TorrentAction =
  | { type: 'ADD_TORRENT'; payload: TorrentData }
  | { type: 'UPDATE_TORRENT'; payload: TorrentData }
  | { type: 'REMOVE_TORRENT'; infoHash: string }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error?: string };

interface TorrentContextProps extends TorrentState {
  addTorrent: (torrent: TorrentData) => void;
  updateTorrent: (torrent: TorrentData) => void;
  removeTorrent: (infoHash: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
}

// --- Reducer ---
const initialState: TorrentState = {
  torrents: {},
  loading: false,
  error: undefined,
};

function torrentReducer(state: TorrentState, action: TorrentAction): TorrentState {
  switch (action.type) {
    case 'ADD_TORRENT':
      return {
        ...state,
        torrents: { ...state.torrents, [action.payload.infoHash]: action.payload },
        error: undefined,
      };
    case 'UPDATE_TORRENT':
      return {
        ...state,
        torrents: { ...state.torrents, [action.payload.infoHash]: action.payload },
      };
    case 'REMOVE_TORRENT': {
      const { [action.infoHash]: _, ...rest } = state.torrents;
      return { ...state, torrents: rest };
    }
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    default:
      return state;
  }
}

// --- Context ---
const TorrentContext = createContext<TorrentContextProps | undefined>(undefined);

// --- Provider ---
export const TorrentProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(torrentReducer, initialState);

  // Action creators
  const addTorrent = (torrent: TorrentData) => dispatch({ type: 'ADD_TORRENT', payload: torrent });
  const updateTorrent = (torrent: TorrentData) => dispatch({ type: 'UPDATE_TORRENT', payload: torrent });
  const removeTorrent = (infoHash: string) => dispatch({ type: 'REMOVE_TORRENT', infoHash });
  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', loading });
  const setError = (error?: string) => dispatch({ type: 'SET_ERROR', error });

  const value: TorrentContextProps = {
    ...state,
    addTorrent,
    updateTorrent,
    removeTorrent,
    setLoading,
    setError,
  };

  return <TorrentContext.Provider value={value}>{children}</TorrentContext.Provider>;
};

// --- Custom Hook ---
export function useTorrentContext(): TorrentContextProps {
  const ctx = useContext(TorrentContext);
  if (!ctx) throw new Error('useTorrentContext must be used within a TorrentProvider');
  return ctx;
} 