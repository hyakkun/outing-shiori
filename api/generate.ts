import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514'
const MAX_TOKENS = Number(process.env.ANTHROPIC_MAX_TOKENS ?? 1024)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY が設定されていません' })
  }

  const { departure, schedule, budget, styles } = req.body as {
    departure: string
    schedule: string
    budget: string
    styles: string[]
  }

  const prompt = `あなたは旅行プランナーです。以下の条件に合った旅行プランを提案してください。

条件:
- 出発地: ${departure}
- 日程: ${schedule}
- 予算: ${budget}
- 旅スタイル: ${(styles ?? []).join('、') || '指定なし'}

以下のJSON形式で回答してください。JSON以外のテキストは含めないでください。
{
  "destination": "目的地名",
  "description": "旅行の概要（2〜3文）",
  "schedule": [
    {
      "time": "09:00",
      "spot": "スポット名",
      "description": "説明",
      "category": "食事 | 観光 | 移動 | 宿泊"
    }
  ]
}

categoryは「食事」「観光」「移動」「宿泊」のいずれかを使用してください。`

  try {
    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = message.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return res.status(500).json({ error: 'APIからテキストレスポンスが返されませんでした' })
    }

    const text = textBlock.text

    try {
      const plan = JSON.parse(text)
      return res.status(200).json(plan)
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const plan = JSON.parse(jsonMatch[0])
        return res.status(200).json(plan)
      }
      return res.status(500).json({ error: 'APIレスポンスのJSONパースに失敗しました' })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ error: message })
  }
}
