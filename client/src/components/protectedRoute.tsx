import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router"
import { useProfile } from "~/hooks/useProfile"

type Props = {
  children: React.ReactNode
}
export default function ProtectedRoute({ children }: Props) {
  const data = useProfile()
  const navigate = useNavigate()

  useEffect(() => {
    if (!data?.profile) {
      navigate('/create-profile')
      return
    }
  })

  return <Outlet />
}
