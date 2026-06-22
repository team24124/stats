import { createFileRoute } from '@tanstack/react-router'
import Loading from '@/components/loading'

export const Route = createFileRoute('/ranking')({
    pendingComponent: () => <Loading />,
    component: Rankings,
})

function Rankings() {
  return <div>Hello "/ranking"!</div>
}
