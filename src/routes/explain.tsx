import { createFileRoute } from '@tanstack/react-router'
import Loading from '@/components/loading'

export const Route = createFileRoute('/explain')({
    pendingComponent: () => <Loading />,
    component: Explain,
})

function Explain() {
  return <div>Hello "/explain"!</div>
}
