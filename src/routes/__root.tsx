import Loading from '@/components/loading'
import Navbar from '@/components/header/navbar'
import { ThemeProvider } from '@/components/theme-provider'
import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    pendingComponent: () => <Loading />,
    component: () => (
        <>
            <ThemeProvider defaultTheme='dark' storageKey="vite-ui-theme">
                <Navbar />
                <div className='flex min-h-[80vh] pt-[100px]'>
                    <Outlet />
                </div>
            </ThemeProvider>
        </>
    ),
})