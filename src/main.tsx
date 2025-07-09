import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import "./index.css"

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import type { Team } from './types/Team'

// Create a new router and query client instance
const queryClient = new QueryClient()
const router = createRouter({
    routeTree,
    basepath: '/stats/',
    defaultPreload: 'intent',
    context: {
        queryClient,
    },
})


// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
    interface HistoryState  {
        teams?: Team[];
    }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </StrictMode>,
    )
}
