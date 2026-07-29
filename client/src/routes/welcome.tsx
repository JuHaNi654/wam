import { useNavigate } from "react-router";
import Base from "../components/base";
import { Button } from "../components/ui/button";
import { POST } from "../lib/api";
import { toast } from "sonner"

export default function Welcome() {
  const navigate = useNavigate()

  const createProfile = async () => {
    const { error } = await POST<Response>("/api/profile", {});
    if (error) {
      console.error(error)
      toast.error("Something went wrong while trying to initialize profile", { position: "bottom-right" })
      return
    }

    navigate('/dashboard');
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
