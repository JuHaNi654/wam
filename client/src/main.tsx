import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Root from './routes/root.tsx'
import Welcome from './routes/welcome.tsx'
import Error from './routes/error.tsx'
import Home from './routes/home.tsx'
import Settings from './routes/settings.tsx'
import Profile from './routes/profile.tsx'
import NewApplication from './routes/application.new.tsx'
import ApplicationDetail from './routes/application.tsx'
import { loggingMiddleware, isInitialized } from './middlewares.ts'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { TooltipProvider } from './components/ui/tooltip.tsx'
import { Toaster } from "./components/ui/sonner"
import Providers from './routes/llm.tsx'
import NotificationProvider from './context/notification.tsx'

const eventSourceUrl = "http://localhost:8000/events"
const queryClient = new QueryClient()
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <Error />,
    middleware: [loggingMiddleware, isInitialized],
    children: [
      {
        index: true,
        element: <Welcome />
      },
      {
        path: "/dashboard",
        element: <Home />,
      },
      {
        path: "/models",
        element: <Providers />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/applications/new",
        element: <NewApplication />,
      },
      {
        path: "/applications/:id",
        element: <ApplicationDetail />,
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationProvider url={eventSourceUrl}>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </NotificationProvider>
      <ReactQueryDevtools buttonPosition='bottom-right' />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
)
