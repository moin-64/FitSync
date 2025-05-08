
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

// Advanced BMR calculation with age, gender, and activity adjustments
function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  // Mifflin-St Jeor Equation - more accurate than Harris-Benedict
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
}

// Calculate TDEE with advanced activity multipliers
function calculateTDEE(bmr: number, activityLevel: string, bodyFatPercentage?: number): number {
  // More nuanced activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,          // Desk job, little exercise
    light: 1.375,            // Light exercise 1-3 days/week
    moderate: 1.55,          // Moderate exercise 3-5 days/week
    active: 1.725,           // Hard exercise 6-7 days/week
    very_active: 1.9,        // Very hard exercise & physical job
    extreme: 2.0             // Extreme levels (professional athletes)
  };
  
  let multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || activityMultipliers.moderate;
  
  // Adjust multiplier for people with higher body fat (they burn fewer calories)
  if (bodyFatPercentage && bodyFatPercentage > 25) {
    multiplier = multiplier * (1 - ((bodyFatPercentage - 25) * 0.003));
  }
  
  return bmr * multiplier;
}

// Calculate macronutrient distribution based on goals and body composition
function calculateMacronutrients(tdee: number, weight: number, bodyFatPercentage: number | undefined, goal: string) {
  // Default macronutrient ratios based on goals
  let proteinRatio, fatRatio, carbRatio;
  
  switch (goal) {
    case 'weight_loss':
      // Higher protein for satiety and muscle preservation
      proteinRatio = 0.35; 
      fatRatio = 0.3;
      carbRatio = 0.35;
      tdee = tdee * 0.85; // 15% caloric deficit
      break;
    case 'muscle_gain':
      // Higher protein and carbs for muscle building
      proteinRatio = 0.3;
      fatRatio = 0.25;
      carbRatio = 0.45;
      tdee = tdee * 1.1; // 10% caloric surplus
      break;
    case 'maintenance':
    default:
      // Balanced ratio
      proteinRatio = 0.3;
      fatRatio = 0.3;
      carbRatio = 0.4;
  }
  
  // Adjust protein based on lean body mass and body fat percentage
  let proteinGrams;
  if (bodyFatPercentage !== undefined) {
    // Calculate lean body mass to determine protein needs
    const leanMass = weight * (1 - (bodyFatPercentage / 100));
    
    // Higher protein for lower body fat individuals
    if (bodyFatPercentage < 15) {
      proteinGrams = leanMass * 2.2; // 2.2g per kg of lean mass for leaner individuals
    } else if (bodyFatPercentage < 25) {
      proteinGrams = leanMass * 2.0; // 2.0g per kg of lean mass for average body fat
    } else {
      proteinGrams = leanMass * 1.8; // 1.8g per kg of lean mass for higher body fat
    }
  } else {
    // Default to weight-based calculation if body fat unknown
    proteinGrams = weight * 1.8;
  }
  
  // Calculate protein calories
  const proteinCalories = proteinGrams * 4;
  
  // Adjust fat and carb ratios based on remaining calories
  const remainingCalories = tdee - proteinCalories;
  const fatCalories = remainingCalories * (fatRatio / (fatRatio + carbRatio));
  const carbCalories = remainingCalories * (carbRatio / (fatRatio + carbRatio));
  
  // Convert to grams
  const fatGrams = fatCalories / 9;
  const carbGrams = carbCalories / 4;
  
  return {
    calorie_goal: Math.round(tdee),
    protein_goal: Math.round(proteinGrams),
    carb_goal: Math.round(carbGrams),
    fat_goal: Math.round(fatGrams)
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Initialize Supabase client with service role for admin operations
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Check authorization
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      return jsonResponse({ error: "Missing authorization header" }, 401);
    }
    
    try {
      const path = new URL(req.url).pathname;
      const pathParts = path.split('/').filter(Boolean);
      const action = pathParts[pathParts.length - 1];
      
      if (req.method === 'POST' && action === 'calculate') {
        const { 
          user_id, 
          weight, 
          height, 
          age, 
          gender, 
          activityLevel,
          bodyFatPercentage, 
          goal = 'maintenance'
        } = await req.json();
        
        // Validate required inputs
        if (!user_id || !weight || !height || !age || !gender || !activityLevel) {
          return jsonResponse({ error: "Missing required parameters" }, 400);
        }
        
        // Get any additional user health data
        const { data: userData, error: userDataError } = await adminClient
          .from('body_scans')
          .select('*')
          .eq('user_id', user_id)
          .order('scan_date', { ascending: false })
          .limit(1);
        
        // Use body fat percentage from body scan if available
        let userBodyFatPercentage = bodyFatPercentage;
        if (!userBodyFatPercentage && userData && userData.length > 0 && userData[0].body_fat_percentage) {
          userBodyFatPercentage = userData[0].body_fat_percentage;
        }
        
        // Calculate Base Metabolic Rate (BMR)
        const bmr = calculateBMR(weight, height, age, gender);
        
        // Apply advanced activity multiplier
        const tdee = calculateTDEE(bmr, activityLevel, userBodyFatPercentage);
        
        // Calculate macro distribution based on goals and body composition
        const goals = calculateMacronutrients(tdee, weight, userBodyFatPercentage, goal);
        
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
  } catch (error) {
    console.error('Error in nutrition-goals function:', error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
