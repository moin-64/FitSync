
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cache für bereits analysierte Benutzerdaten
const userDataCache = new Map();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    console.log(`Processing body scan analysis for user: ${userId}`);
    
    // Prüfen, ob wir bereits Daten für diesen Benutzer haben
    if (userDataCache.has(userId)) {
      console.log("Returning cached data for user", userId);
      return new Response(
        JSON.stringify(userDataCache.get(userId)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Kürzere Simulationsverzögerung für bessere Benutzerfreundlichkeit
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generiere realistische Körperdaten mit stabileren Werten
    const mockBodyData = {
      age: 28,
      height: 180,
      weight: 75,
      bodyFat: 16,
      muscleGroups: {
        chest: { 
          size: 42, 
          strength: 70, 
          development: 65 
        },
        back: { 
          size: 38, 
          strength: 75, 
          development: 68 
        },
        shoulders: { 
          size: 48, 
          strength: 60, 
          development: 55 
        },
        arms: { 
          size: 36, 
          strength: 65, 
          development: 60 
        },
        abs: { 
          size: 32, 
          strength: 55, 
          development: 50 
        },
        legs: { 
          size: 58, 
          strength: 80, 
          development: 75 
        }
      }
    };
    
    // Daten im Cache speichern
    userDataCache.set(userId, mockBodyData);
    
    // Limiting cache size to prevent memory issues
    if (userDataCache.size > 100) {
      const oldestKey = userDataCache.keys().next().value;
      userDataCache.delete(oldestKey);
    }
    
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
