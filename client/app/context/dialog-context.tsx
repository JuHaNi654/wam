import { createContext, useContext, useReducer, useCallback } from "react";
import type { ReactNode } from "react";

export interface DialogInstance {
  id: string;
  title: string;
  children: ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

interface DialogConfig {
  id?: string;
  title: string;
  children: ReactNode;
  width?: number;
  height?: number;
}

type DialogAction =
  | { type: "OPEN"; payload: DialogInstance }
  | { type: "CLOSE"; payload: string } // id
  | { type: "UPDATE_POSITION"; payload: { id: string; x: number; y: number } }
  | { type: "UPDATE_SIZE"; payload: { id: string; width: number; height: number } }
  | { type: "FOCUS"; payload: string }; // id

interface DialogContextType {
  dialogs: DialogInstance[];
  openDialog: (config: DialogConfig) => string;
  closeDialog: (id: string) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  updateSize: (id: string, width: number, height: number) => void;
  focusDialog: (id: string) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 300;
const MAX_DIALOGS = 10;

function getInitialPosition() {
  const centerX = Math.max(0, (window.innerWidth - DEFAULT_WIDTH) / 2);
  const centerY = Math.max(0, (window.innerHeight - DEFAULT_HEIGHT) / 2);
  return { x: centerX, y: centerY };
}

function dialogReducer(state: DialogInstance[], action: DialogAction): DialogInstance[] {
  switch (action.type) {
    case "OPEN": {
      if (state.length >= MAX_DIALOGS) {
        return state; // Don't add more than MAX_DIALOGS
      }
      return [...state, action.payload];
    }

    case "CLOSE": {
      return state.filter((d) => d.id !== action.payload);
    }

    case "UPDATE_POSITION": {
      return state.map((d) =>
        d.id === action.payload.id
          ? { ...d, x: action.payload.x, y: action.payload.y }
          : d
      );
    }

    case "UPDATE_SIZE": {
      return state.map((d) =>
        d.id === action.payload.id
          ? { ...d, width: action.payload.width, height: action.payload.height }
          : d
      );
    }

    case "FOCUS": {
      // Find the max zIndex and increment
      const maxZ = Math.max(...state.map((d) => d.zIndex), 0);
      return state.map((d) =>
        d.id === action.payload ? { ...d, zIndex: maxZ + 1 } : d
      );
    }

    default:
      return state;
  }
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialogs, dispatch] = useReducer(dialogReducer, []);

  const openDialog = useCallback((config: DialogConfig): string => {
    const id = config.id || `dialog-${Date.now()}-${Math.random()}`;
    const width = config.width ?? DEFAULT_WIDTH;
    const height = config.height ?? DEFAULT_HEIGHT;
    const { x, y } = getInitialPosition();

    // Offset subsequent dialogs slightly
    const offsetX = x + dialogs.length * 20;
    const offsetY = y + dialogs.length * 20;

    const newDialog: DialogInstance = {
      id,
      title: config.title,
      children: config.children,
      x: offsetX,
      y: offsetY,
      width,
      height,
      zIndex: dialogs.length > 0 ? Math.max(...dialogs.map((d) => d.zIndex)) + 1 : 1,
    };

    dispatch({ type: "OPEN", payload: newDialog });
    return id;
  }, [dialogs]);

  const closeDialog = useCallback((id: string) => {
    dispatch({ type: "CLOSE", payload: id });
  }, []);

  const updatePosition = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: "UPDATE_POSITION", payload: { id, x, y } });
  }, []);

  const updateSize = useCallback((id: string, width: number, height: number) => {
    dispatch({ type: "UPDATE_SIZE", payload: { id, width, height } });
  }, []);

  const focusDialog = useCallback((id: string) => {
    dispatch({ type: "FOCUS", payload: id });
  }, []);

  const value: DialogContextType = {
    dialogs,
    openDialog,
    closeDialog,
    updatePosition,
    updateSize,
    focusDialog,
  };

  return (
    <DialogContext.Provider value={value}>
      {children}
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogContextType {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}
