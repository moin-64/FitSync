
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    console.log(`Processing body scan analysis for user: ${userId}`);
    
    // Kürzere Simulationsverzögerung für bessere Benutzerfreundlichkeit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generiere realistische Körperdaten innerhalb normaler menschlicher Bereiche
    const mockBodyData = {
      age: Math.floor(Math.random() * 20) + 20, // Zufälliges Alter zwischen 20-40
      height: Math.floor(Math.random() * 30) + 160, // Zufällige Größe zwischen 160-190cm
      weight: Math.floor(Math.random() * 30) + 60, // Zufälliges Gewicht zwischen 60-90kg
      bodyFat: Math.floor(Math.random() * 15) + 10, // Zufälliger Körperfettanteil zwischen 10-25%
      muscleGroups: {
        chest: { 
          size: Math.floor(Math.random() * 30) + 30, // Zufällige Größe zwischen 30-60
          strength: Math.floor(Math.random() * 30) + 40, // Zufällige Kraft zwischen 40-70
          development: Math.floor(Math.random() * 30) + 40 // Zufällige Entwicklung zwischen 40-70
        },
        back: { 
          size: Math.floor(Math.random() * 30) + 30,
          strength: Math.floor(Math.random() * 30) + 40,
          development: Math.floor(Math.random() * 30) + 40
        },
        shoulders: { 
          size: Math.floor(Math.random() * 30) + 30,
          strength: Math.floor(Math.random() * 30) + 40,
          development: Math.floor(Math.random() * 30) + 40
        },
        arms: { 
          size: Math.floor(Math.random() * 30) + 30,
          strength: Math.floor(Math.random() * 30) + 40,
          development: Math.floor(Math.random() * 30) + 40
        },
        abs: { 
          size: Math.floor(Math.random() * 30) + 30,
          strength: Math.floor(Math.random() * 30) + 40,
          development: Math.floor(Math.random() * 30) + 40
        },
        legs: { 
          size: Math.floor(Math.random() * 30) + 30,
          strength: Math.floor(Math.random() * 30) + 40,
          development: Math.floor(Math.random() * 30) + 40
        }
      }
    };
    
    return new Response(
      JSON.stringify(mockBodyData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing body scan:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
