import { createFileRoute } from '@tanstack/react-router'
import Loading from '@/components/loading'

export const Route = createFileRoute('/method')({
    pendingComponent: () => <Loading />,
    component: Method,
})

function Method() {
  return <div>Hello "/method"!</div>
}
