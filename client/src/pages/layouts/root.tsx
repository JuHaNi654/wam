import { Outlet, Link, redirect } from "@tanstack/solid-router";
import { createRootRoute } from "@tanstack/solid-router";
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools';
import { NotificationProvider } from "../../utils/notification";
import { API_URL } from "../../utils/constants";
import { GET } from "../../utils/api";
import { ToastProvider } from "../../components/toast";

export default createRootRoute({
  beforeLoad: async ({ location }) => {
    const { error } = await GET('/profile/initialized', null)

    if (!error) {
      if (location.href === "/") {
        throw redirect({
          to: '/applications',
        })
      }

      return
    }


    if (error!.status === 404 && location.href !== "/") {
      throw redirect({
        to: '/',
      })
    }

    if (error!.status !== 404) {
      console.error("Error occured whiel checking init")
      console.error(error)
    }
  },
  component: RootComponent,
  notFoundComponent: NotFoundComponent
})

function NotFoundComponent() {
  return (
    <div>
      <p>This is the notFoundComponent configured on root route</p>
      <Link to="/">Start Over</Link>
    </div>
  )
}

function RootComponent() {
  return (
    <NotificationProvider url={`${API_URL}/events`}>
      <ToastProvider count={1}>
        <Outlet />
      </ToastProvider>

      <TanStackRouterDevtools position="bottom-left" />
    </NotificationProvider>
  )
}
