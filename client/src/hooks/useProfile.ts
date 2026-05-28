import { createContext, useContext } from "react";

interface ProfileContext {
  profile: any;
  loadProfile(): void;
}
export const ProfileContext = createContext<ProfileContext | null>(null);

export const useProfile = () => {
  return useContext(ProfileContext);
};
