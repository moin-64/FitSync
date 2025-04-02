
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
      systemPrompt = "You are an expert fitness coach specializing in creating personalized workout plans. Focus on safety, progression, and effectiveness."
      userPrompt = `Create a workout plan for a ${data.rank} level trainee with the following limitations: ${data.limitations.join(', ') || 'none'}. Include appropriate exercises, sets, reps, and rest periods.`
    } else if (type === "problem") {
      systemPrompt = "You are an expert at analyzing fitness limitations and suggesting appropriate exercise modifications."
      userPrompt = `Analyze this limitation or problem: "${data.limitation}". Suggest exercise modifications and alternatives.`
    } else if (type === "evaluation") {
      systemPrompt = "You are a fitness performance analyst who evaluates workout data and provides meaningful insights."
      userPrompt = `Evaluate this workout performance: Duration: ${data.duration}s, Heart Rate: ${data.heartRate}bpm, Calories: ${data.calories}, Oxygen: ${data.oxygen}%, Struggle Detected: ${data.struggleDetected}. Provide insights and recommendations.`
    }

    // Make request to OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://lovable.app",
        "X-Title": "Fitness Trainer App",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",
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
        result: result.choices?.[0]?.message?.content || "Could not generate response",
        type
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
