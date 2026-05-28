import { useNavigate } from "react-router";
import Base from "../components/base";
import { Button } from "../components/ui/button";
import { GET, POST, ResponseError } from "../lib/api";
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react";

export default function Welcome() {
  const navigate = useNavigate()
  const { error, status } = useQuery({
    queryKey: ["initialized"],
    queryFn: async () => {
      return await GET<any>('/api/initialized', null)
    },
    retry: 0,
  })

  useEffect(() => {
    if (status === 'success') navigate('/dashboard')
    if (!(error instanceof ResponseError)) {
      console.log(error)
    }
  }, [error, status])

  const createProfile = async () => {
    try {
      await POST<Response>("/api/profile", {});
      navigate('/dashboard');
    } catch (err: unknown) {
      console.log(err)
    }
  }

  return (
    <Base className="flex flex-col justify-center items-center gap-4">
      <header className="py-4 font-semibold text-center">
        <h1 className="text-4xl">Welcome!</h1>
        <p className="text-sm mt-2">Click create new profile to start using application</p>
      </header>
      <Button onClick={createProfile}>
        Create new profile
      </Button>
    </Base>
  )
}
