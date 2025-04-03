
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { type, data } = await req.json()
    
    let systemPrompt = ""
    let userPrompt = ""
    
    // Configure prompt based on request type
    if (type === "workout") {
      systemPrompt = "Du bist ein erfahrener Fitnesstrainer, der sich auf die Erstellung personalisierter Trainingspläne spezialisiert hat. Achte auf Sicherheit, Fortschritt und Effektivität."
      userPrompt = `Erstelle einen Trainingsplan für einen Trainierenden auf ${data.rank} Niveau mit folgenden Einschränkungen: ${data.limitations.join(', ') || 'keine'}. Bitte gib angemessene Übungen, Sätze, Wiederholungen und Ruhezeiten an.`
    } else if (type === "problem") {
      systemPrompt = "Du bist ein Experte für die Analyse von Fitnessbeschränkungen und das Vorschlagen geeigneter Übungsmodifikationen."
      userPrompt = `Analysiere diese Einschränkung oder dieses Problem: "${data.limitation}". Schlage Übungsmodifikationen und Alternativen vor.`
    } else if (type === "evaluation") {
      systemPrompt = "Du bist ein Fitnessleistungsanalyst, der Trainingsdaten auswertet und aussagekräftige Erkenntnisse liefert."
      userPrompt = `Bewerte diese Trainingsleistung: Dauer: ${data.duration}s, Herzfrequenz: ${data.heartRate}bpm, Kalorien: ${data.calories}, Sauerstoff: ${data.oxygen}%, Schwierigkeiten erkannt: ${data.struggleDetected}. Liefere Einblicke und Empfehlungen.`
    }

    // Make request to OpenRouter API using the Qwen model
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lovable.app",
        "X-Title": "Fitness Trainer App",
      },
      body: JSON.stringify({
        model: "qwen/qwen2.5-vl-72b-instruct:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    const result = await response.json()
    
    return new Response(
      JSON.stringify({ 
        result: result.choices?.[0]?.message?.content || "Konnte keine Antwort generieren",
        type
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Fehler:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
