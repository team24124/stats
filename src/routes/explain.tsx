import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/explain')({
    pendingComponent: () => <Loading />,
    component: Explain,
})

function Explain() {
  return <div>Hello "/explain"!</div>
}
