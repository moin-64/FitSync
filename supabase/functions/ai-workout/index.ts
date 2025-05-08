
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
    console.log('AI workout function invoked')
    
    // Validate API key
    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY not configured')
      throw new Error('API key not configured')
    }
    
    // Parse request body
    const { type, data } = await req.json()
    
    console.log('Request type:', type)
    console.log('Request data:', JSON.stringify(data))
    
    let systemPrompt = ""
    let userPrompt = ""
    
    // Configure prompt based on request type
    if (type === "workout") {
      // Domain-specific knowledge for workout plans
      systemPrompt = `Du bist ein spezialisierter Fitness-KI-Trainer mit Expertise in individueller Trainingsplanerstellung.
      Du verfügst über fundierte Kenntnisse in Sportmedizin, Bewegungswissenschaften und Trainingsperiodisierung.
      Deine Aufgabe ist es, wissenschaftsbasierte Trainingspläne zu erstellen, die perfekt auf das individuelle Leistungsniveau, 
      die körperlichen Einschränkungen und die spezifischen Ziele der Person abgestimmt sind.
      Nutze progressive Überlastung und Periodisierung für optimale Ergebnisse.
      Berücksichtige physiologische Prinzipien wie Muskelfasertypen und Energiesysteme in deinen Empfehlungen.`
      
      userPrompt = `Erstelle einen personalisierten Trainingsplan für einen Trainierenden auf ${data.rank} Niveau` + 
                  (data.limitations && data.limitations.length > 0 ? 
                  ` mit folgenden Einschränkungen: ${data.limitations.join(', ')}. ` : 
                  ' ohne körperliche Einschränkungen. ') + 
                  `Empfehle genau 5 geeignete Übungen mit spezifischen Sätzen, Wiederholungen und Gewichtsempfehlungen.
                  Berücksichtige progressive Überlastung, funktionelles Training und eine ausgewogene Muskelgruppenbeanspruchung.
                  Füge für jede Übung eine kurze Erklärung ein, warum sie für dieses Niveau und diese Einschränkungen geeignet ist.
                  ${data.forceRegeneration ? 'Erstelle einen komplett neuen Plan ohne Übungen aus vorherigen Vorschlägen zu wiederholen.' : ''}`
    } else if (type === "problem") {
      // Domain-specific knowledge for physical limitations
      systemPrompt = `Du bist ein Spezialist für Trainingsanpassungen und therapeutische Übungen mit Expertise in Anatomie, 
      Biomechanik und Rehabilitation. Deine Aufgabe ist es, einschränkungsspezifische Trainingsmodifikationen zu empfehlen,
      die sicher, effektiv und wissenschaftlich fundiert sind. Deine Analysen basieren auf evidenzbasierten Erkenntnissen
      und berücksichtigen individuelle Faktoren wie Schweregrad, Vorgeschichte und funktionelle Ziele.
      Du verstehst die komplexen Zusammenhänge zwischen verschiedenen Körpersystemen und passt Empfehlungen entsprechend an.`
      
      userPrompt = `Analysiere diese körperliche Einschränkung detailliert: "${data.limitation}". 
                    Welche spezifischen Übungen sollten unter diesen Umständen vermieden werden und warum? 
                    Welche alternativen Übungen und Modifikationen würdest du stattdessen empfehlen?
                    Wie könnte ein angepasster Trainingsplan für jemanden mit dieser Einschränkung aussehen?
                    Gehe auf biomechanische Aspekte und Belastungsgrenzen ein.`
    } else if (type === "evaluation") {
      // Domain-specific knowledge for workout analysis
      systemPrompt = `Du bist ein Trainingsanalyst mit Expertise in Leistungsdiagnostik und Sportwissenschaft.
      Du interpretierst biometrische Daten und physiologische Reaktionen auf Training mit höchster Präzision.
      Deine Analysen berücksichtigen alle relevanten Faktoren wie Herzfrequenz, Kalorienverbrauch, Sauerstoffsättigung,
      Trainingsdauer und subjektive Anstrengung. Du kannst Trainingseffekte auf verschiedene Körpersysteme identifizieren
      und optimale Erholungsstrategien sowie Anpassungen für zukünftige Trainingseinheiten empfehlen.`
      
      userPrompt = `Analysiere folgende Trainingsdaten eines Workouts: 
                    Dauer: ${data.duration}s, 
                    Durchschnittliche Herzfrequenz: ${data.heartRate}bpm, 
                    Verbrannte Kalorien: ${data.calories}, 
                    Sauerstoffsättigung: ${data.oxygen}%, 
                    Erkannte Anstrengung: ${data.struggleDetected ? 'Hoch' : 'Moderat'}. 
                    
                    Liefere eine detaillierte Einschätzung der Trainingseffektivität und -intensität.
                    Welche physiologischen Anpassungen wurden wahrscheinlich stimuliert?
                    Wie lässt sich die Erholungszeit einschätzen?
                    Welche konkreten Optimierungen würdest du für das nächste Training vorschlagen?`
    } else {
      throw new Error(`Invalid request type: ${type}`)
    }
    
    console.log('Preparing to call API with free models')

    // Try Google Gemini model first (free tier)
    try {
      console.log('Calling Gemini model (free)')
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://lovable.app",
          "X-Title": "Fitness Trainer App",
        },
        body: JSON.stringify({
          model: "google/gemini-1.5-flash", // Using free tier Google model
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      })

      const result = await response.json()
      
      if (result.choices?.[0]?.message?.content) {
        console.log('Primary model success')
        return new Response(
          JSON.stringify({ 
            result: result.choices[0].message.content,
            type,
            model: "primary"
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      console.log('Primary model failed or returned empty result')
      throw new Error('Primary model failed')
      
    } catch (primaryError) {
      console.warn("Primary model failed, trying fallback model:", primaryError)
      
      // Try fallback model - Mistral small (also has a free tier)
      try {
        console.log('Calling fallback model')
        const fallbackResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://lovable.app",
            "X-Title": "Fitness Trainer App",
          },
          body: JSON.stringify({
            model: "mistralai/mistral-small", // Free tier fallback model
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1500,
          }),
        })
        
        const fallbackResult = await fallbackResponse.json()
        
        if (fallbackResult.choices?.[0]?.message?.content) {
          console.log('Fallback model success')
          return new Response(
            JSON.stringify({ 
              result: fallbackResult.choices[0].message.content,
              type,
              model: "fallback"
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        console.log('Fallback model failed or returned empty result')
        throw new Error('Fallback model failed')
        
      } catch (fallbackError) {
        console.error('Both models failed:', fallbackError)
        
        return new Response(
          JSON.stringify({ 
            error: 'Both AI models failed to generate a response',
            type,
            primaryError: primaryError.message,
            fallbackError: fallbackError.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
  } catch (error) {
    console.error('General error in AI function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
