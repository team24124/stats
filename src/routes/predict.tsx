import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/predict')({
    pendingComponent: () => <Loading />,
    component: Predict,
})

function Predict() {
  return <div>Hello "/predict"!</div>
}
