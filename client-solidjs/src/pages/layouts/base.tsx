import { createRoute } from "@tanstack/solid-router"
import { Outlet } from "@tanstack/solid-router";
import Sidemenu from "../../components/sidemenu";
import Root from "./root";

export default createRoute({
  getParentRoute: () => Root,
  id: 'layout',
  component: Layout
})

function Layout() {
  return <>
    <div class="body-wrapper">
      <Sidemenu />
      <main class="p-4">
        <Outlet />
      </main>
    </div>
  </>
}
