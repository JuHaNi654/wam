import { render } from 'solid-js/web';
import 'solid-devtools';
import {
  RouterProvider,
  createRouter,
} from '@tanstack/solid-router';
import './styles.css';
import 'remixicon/fonts/remixicon.css'
import RootRoute from "./pages/layouts/root"
import Layout from "./pages/layouts/base"
import ApplicationLayout from "./pages/layouts/application"
import Applications from "./pages/applications"
import NewApplication from './pages/application.new';
import LLM from './pages/llm';
import Profile from "./pages/profile"
import Settings from "./pages/settings"
import Welcome from './pages/welcome';
import Application from "./pages/application"

const routeTree = RootRoute.addChildren([
  Welcome,
  Layout.addChildren([
    ApplicationLayout.addChildren([
      NewApplication,
      Applications,
      Application
    ]),
    LLM, Profile,
    Settings,
  ])
]);

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultStaleTime: 5000,
  scrollRestoration: true,
});

// Register things for typesafety
declare module '@tanstack/solid-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('app')!;

if (!rootElement.innerHTML) {
  render(() => <RouterProvider router={router} />, rootElement);
}
