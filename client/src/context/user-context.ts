import { createContext } from "react-router";
import type { Profile } from "../types/api.types.ts";

export const profileContext = createContext<Profile | null>(null);
