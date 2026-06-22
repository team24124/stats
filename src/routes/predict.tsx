import { createFileRoute } from '@tanstack/react-router'
import Loading from '@/components/loading'

export const Route = createFileRoute('/predict')({
    pendingComponent: () => <Loading />,
    component: Predict,
})

function Predict() {
  return <div>Hello "/predict"!</div>
}
