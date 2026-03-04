import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from './supabase'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const id = req.query.id
  if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
    return res.status(400).json({ error: 'Valid UUID id parameter is required' })
  }

  try {
    const { data, error } = await supabase
      .from('plans')
      .select('plan_data, form_values')
      .eq('id', id)
      .single()

    if (error || !data) {
      if (error?.code === 'PGRST116') {
        return res.status(404).json({ error: 'プランが見つかりませんでした' })
      }
      console.error('Supabase select error:', error?.message)
      return res.status(500).json({ error: 'プランの取得に失敗しました' })
    }

    return res.status(200).json({ planData: data.plan_data, formValues: data.form_values })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Get plan error:', msg)
    return res.status(500).json({ error: 'プランの取得に失敗しました' })
  }
}
