import { createContext, useContext } from "react";


const DialogContext = createContext<any | undefined>(undefined)

export function useDialog(): any {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }

  return context
}
