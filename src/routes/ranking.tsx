import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/ranking')({
    pendingComponent: () => <Loading />,
    component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/ranking"!</div>
}
