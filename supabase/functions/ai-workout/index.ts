
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
      systemPrompt = `Du bist ein erfahrener Fitnesstrainer, der sich auf die Erstellung personalisierter Trainingspläne spezialisiert hat. 
      Du berücksichtigst das Trainingsniveau des Benutzers sowie körperliche Einschränkungen.
      Achte auf korrekte und sichere Übungsausführung.
      Deine Antworten sind präzise, motivierend und leicht verständlich.`
      
      userPrompt = `Erstelle einen personalisierten Trainingsplan für einen Trainierenden auf ${data.rank} Niveau` + 
                  (data.limitations && data.limitations.length > 0 ? 
                  ` mit folgenden Einschränkungen: ${data.limitations.join(', ')}. ` : 
                  ' ohne körperliche Einschränkungen. ') + 
                  `Bitte gib 4-6 geeignete Übungen mit angemessenen Sätzen, Wiederholungen und Gewichten an. 
                   Berücksichtige progressive Überlastung und eine ausgewogene Muskelgruppenbeanspruchung.`
    } else if (type === "problem") {
      systemPrompt = `Du bist ein Experte für die Analyse von körperlichen Einschränkungen und das Vorschlagen geeigneter Übungsmodifikationen.
      Deine Antworten sind präzise, hilfreich und leicht verständlich.
      Du gibst nützliche Vorschläge zur Anpassung von Trainingsübungen.`
      
      userPrompt = `Analysiere diese körperliche Einschränkung: "${data.limitation}". 
                    Welche Übungen sollten vermieden werden? 
                    Welche alternativen Übungen wären geeignet? 
                    Welche Anpassungen sollten beim Training gemacht werden?`
    } else if (type === "evaluation") {
      systemPrompt = `Du bist ein Fitnessleistungsanalyst, der Trainingsdaten professionell auswertet.
      Deine Antworten sind motivierend, konstruktiv und leicht verständlich.
      Du gibst hilfreiche Tipps zur Leistungsverbesserung.`
      
      userPrompt = `Bewerte diese Trainingsleistung: 
                    Dauer: ${data.duration}s, 
                    Herzfrequenz: ${data.heartRate}bpm, 
                    Kalorien: ${data.calories}, 
                    Sauerstoffsättigung: ${data.oxygen}%, 
                    Erkannte Schwierigkeiten: ${data.struggleDetected}. 
                    Liefere Einblicke zur Effektivität des Trainings und Empfehlungen zur Verbesserung.`
    } else {
      throw new Error(`Invalid request type: ${type}`)
    }
    
    console.log('Preparing to call API with prompt')

    // Try main model first
    try {
      console.log('Calling primary model')
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://lovable.app",
          "X-Title": "Fitness Trainer App",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-5-sonnet",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
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
      
      // Try fallback model
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
            model: "qwen/qwen2.5-vl-72b-instruct:free",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1000,
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
