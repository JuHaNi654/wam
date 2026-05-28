import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Root from './routes/root.tsx'
import Welcome from './routes/welcome.tsx'
import Error from './routes/error.tsx'
import Home from './routes/home.tsx'
import Profile from './routes/profile.tsx'
import NewJobRoute from './routes/job.new.tsx'
import ApplicationDetail from './routes/application.tsx'
import { loggingMiddleware, isInitialized } from './middlewares.ts'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

const queryClient = new QueryClient()
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <Error />,
    middleware: [loggingMiddleware],
    children: [
      {
        index: true,
        element: <Welcome />
      },
      {
        path: "/dashboard",
        middleware: [isInitialized],
        element: <Home />,
      },
      {
        path: "/profile",
        middleware: [isInitialized],
        element: <Profile />,
      },
      {
        path: "/job/new",
        middleware: [isInitialized],
        element: <NewJobRoute />,
      },
      {
        path: "/application/:id",
        middleware: [isInitialized],
        element: <ApplicationDetail />,
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools buttonPosition='bottom-right' />
    </QueryClientProvider>
  </StrictMode>,
)
