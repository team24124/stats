import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/method')({
    pendingComponent: () => <Loading />,
    component: Method,
})

function Method() {
  return <div>Hello "/method"!</div>
}
