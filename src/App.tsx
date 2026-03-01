import { PlanForm } from './components/PlanForm'
import type { FormValues } from './components/PlanForm'
import { generatePlan } from './lib/generatePlan'

function App() {
  const handleSubmit = async (values: FormValues) => {
    try {
      console.log('プラン生成中...', values)
      const plan = await generatePlan(values)
      console.log('生成されたプラン:', plan)
    } catch (error) {
      console.error('プラン生成エラー:', error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <PlanForm onSubmit={handleSubmit} />
    </div>
  )
}

export default App
