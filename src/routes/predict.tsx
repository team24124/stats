import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/predict')({
    pendingComponent: () => <Loading />,
    component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/predict"!</div>
}
