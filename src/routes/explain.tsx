import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/explain')({
    pendingComponent: () => <Loading />,
    component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/explain"!</div>
}
