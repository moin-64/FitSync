
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Response helper
const jsonResponse = (data: any, status: number = 200) => new Response(
  JSON.stringify(data),
  { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status }
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Get environment variables
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Initialize Supabase client with service role (for admin operations)
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  // Initialize Supabase client with user's JWT token
  const authorization = req.headers.get('Authorization');
  if (!authorization) {
    return jsonResponse({ error: "Missing authorization header" }, 401);
  }
  
  try {
    const path = new URL(req.url).pathname;
    const pathParts = path.split('/').filter(Boolean);
    const action = pathParts[pathParts.length - 1];
    
    if (req.method === 'POST' && action === 'calculate') {
      const { user_id, weight, height, age, gender, activityLevel } = await req.json();
      
      if (!user_id || !weight || !height || !age || !gender || !activityLevel) {
        return jsonResponse({ error: "Missing required parameters" }, 400);
      }
      
      // Calculate Base Metabolic Rate (BMR) using the Mifflin-St Jeor Equation
      let bmr;
      if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }
      
      // Apply activity multiplier
      let tdee;
      switch (activityLevel) {
        case 'sedentary':
          tdee = bmr * 1.2;
          break;
        case 'light':
          tdee = bmr * 1.375;
          break;
        case 'moderate':
          tdee = bmr * 1.55;
          break;
        case 'active':
          tdee = bmr * 1.725;
          break;
        case 'very_active':
          tdee = bmr * 1.9;
          break;
        default:
          tdee = bmr * 1.2;
      }
      
      // Calculate macro nutrient recommendations
      // Protein: 1.8g per kg of bodyweight
      const proteinGrams = weight * 1.8;
      const proteinCalories = proteinGrams * 4;
      
      // Fat: 25% of TDEE
      const fatCalories = tdee * 0.25;
      const fatGrams = fatCalories / 9;
      
      // Carbs: remaining calories
      const carbCalories = tdee - proteinCalories - fatCalories;
      const carbGrams = carbCalories / 4;
      
      // Return the calculated nutrition goals
      const goals = {
        calorie_goal: Math.round(tdee),
        protein_goal: Math.round(proteinGrams),
        carb_goal: Math.round(carbGrams),
        fat_goal: Math.round(fatGrams),
      };
      
      // Save the goals to the database
      const { error: dbError } = await adminClient
        .from('user_nutrition')
        .upsert({
          user_id: user_id,
          calorie_goal: goals.calorie_goal,
          protein_goal: goals.protein_goal,
          carb_goal: goals.carb_goal,
          fat_goal: goals.fat_goal,
        }, { onConflict: 'user_id' });
      
      if (dbError) {
        console.error('Error saving nutrition goals:', dbError);
        return jsonResponse({ error: "Failed to save nutrition goals" }, 500);
      }
      
      return jsonResponse({ success: true, goals });
    }
    
    return jsonResponse({ error: "Method not allowed" }, 405);
  } catch (error) {
    console.error('Error in nutrition-goals function:', error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
