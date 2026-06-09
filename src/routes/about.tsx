import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
    pendingComponent: () => <Loading />,
    component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/about"!</div>
}
