const router = require('express').Router()
const supabase = require('../supabase')
const { auth } = require('../middleware/auth')

function getSlotMeta(i) {
  let type = 'standard', sector = 'Norte'
  if (i === 4)  { type = 'ev'; sector = 'Techado' }
  else if (i === 12) { type = 'preferential'; sector = 'Techado' }
  else if (i === 45) { sector = 'Techado' }
  else if (i % 7 === 0) { type = 'ev' }
  else if (i % 9 === 0) { type = 'preferential'; sector = 'Techado' }
  else if (i > 80) { sector = 'Sur' }
  else if (i > 45) { sector = 'Techado' }
  return { type, sector }
}

// GET /recomendacion — Recomienda la mejor plaza libre usando Gemini
router.get('/', auth, async (req, res) => {
  const { data: slots, error } = await supabase
    .from('estacionamientos')
    .select('id, codigo')
    .eq('estado', 'libre')
    .order('id')

  if (error) return res.status(500).json({ error: error.message })
  if (!slots?.length) return res.status(404).json({ error: 'No hay plazas libres disponibles.' })

  const enriched = slots.map(s => ({ ...s, ...getSlotMeta(s.id) }))

  if (process.env.GOOGLE_AI_API_KEY) {
    try {
      const { GoogleGenAI } = require('@google/genai')
      const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY })

      const lista = enriched.slice(0, 40)
        .map(s => `${s.codigo}(Sector:${s.sector},Tipo:${s.type})`)
        .join(', ')

      const prompt = `Eres el asistente de estacionamiento de DuocUC Sede Maipú. Plazas libres: ${lista}. Recomienda la MEJOR para un conductor que llega ahora: prefiere Sector Norte (más cerca de entrada), plazas estándar para vehículos normales. Responde SOLO con JSON sin backticks: {"codigo":"X-XX","razon":"máximo 12 palabras en español"}`

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      })

      const json = JSON.parse(response.text.trim())
      const slot = enriched.find(s => s.codigo === json.codigo)
      if (slot) {
        return res.json({ slotId: slot.id, codigo: slot.codigo, razon: json.razon, source: 'ai' })
      }
    } catch (e) {
      console.warn('Gemini fallback:', e.message)
    }
  }

  // Heurística: Norte estándar → Norte cualquiera → Techado → Sur
  const priority = [
    (s) => s.sector === 'Norte' && s.type === 'standard',
    (s) => s.sector === 'Norte',
    (s) => s.sector === 'Techado' && s.type === 'standard',
    (s) => s.sector === 'Techado',
    () => true,
  ]
  const best = priority.reduce((found, fn) => found ?? enriched.find(fn), null)

  res.json({
    slotId: best.id,
    codigo: best.codigo,
    razon: `Plaza más cercana disponible, Sector ${best.sector}.`,
    source: 'heuristic',
  })
})

module.exports = router
