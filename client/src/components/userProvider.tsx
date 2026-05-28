import { useMemo } from "react";
import { Outlet, useNavigate } from "react-router";
import useFetch from "~/hooks/useFetch";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import { ProfileContext } from "~/hooks/useProfile";
import type { Profile } from "~/types/api.types";

type ResponseData = {
  data: {
    profile: Profile
  };
};

export function UserProvider() {
  const { response, statusCode } = useFetch<ResponseData>("/api/profile")
  const [profile, setProfile] = useLocalStorage<Profile | null>("user", null)
  const navigate = useNavigate()

  const value = useMemo(() => {
    const loadProfile = () => {
      if (statusCode === 200 && response) {
        setProfile(response.data.profile)
      }

      navigate("/new-profile")
    }

    return { profile, loadProfile }
  }, [profile, navigate, setProfile])


  return (
    <ProfileContext.Provider value={value}>
      <Outlet />
    </ProfileContext.Provider>
  )
}
