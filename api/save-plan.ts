import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { planData, formValues } = req.body ?? {}

  // バリデーション
  if (!planData || typeof planData !== 'object') {
    return res.status(400).json({ error: 'planData is required' })
  }
  if (typeof planData.destination !== 'string') {
    return res.status(400).json({ error: 'planData.destination must be a string' })
  }
  if (!Array.isArray(planData.schedule)) {
    return res.status(400).json({ error: 'planData.schedule must be an array' })
  }

  try {
    const { data, error } = await supabase
      .from('plans')
      .insert({ plan_data: planData, form_values: formValues ?? {} })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase insert error:', error.message)
      return res.status(500).json({ error: 'プランの保存に失敗しました' })
    }

    return res.status(200).json({ id: data.id })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Save plan error:', msg)
    return res.status(500).json({ error: 'プランの保存に失敗しました' })
  }
}
