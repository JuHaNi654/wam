import { createRoute, useNavigate } from "@tanstack/solid-router"
import Root from "./layouts/root"
import PageHeading from "../components/page-heading"
import { Button } from "../components/elements/button"
import { POST } from "../utils/api"
import { useToast } from "../components/toast"

export default createRoute({
  getParentRoute: () => Root,
  path: '/',
  component: Welcome
})

function Welcome() {
  const toast = useToast()
  const navigate = useNavigate({ from: '/' })

  const createProfile = async () => {
    const { error } = await POST("/profile", {});
    if (error) {
      toast.error({ message: "Error occured while trying to create new profile" })
      console.error(error)
      return
    }

    navigate({ href: "/applications" });
  }

  return (
    <div class="h-full flex-1 flex flex-col gap-2 justify-center items-center">
      <PageHeading title="Welcome" />
      <p class="text-sm mb-2">Click create new profile to start using application</p>
      <Button variant="primary" label="Create new profile" onClick={createProfile} />
    </div>
  )
}
