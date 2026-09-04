import { Outlet, Link } from "@tanstack/solid-router";
import { createRootRoute } from "@tanstack/solid-router";
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools';

export default createRootRoute({
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
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  )
}
