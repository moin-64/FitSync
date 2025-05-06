
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Funktion zum Dekodieren von Base64-String zu Binary
function base64ToUint8Array(base64: string) {
  const base64Clean = base64.split(',')[1] || base64;
  const binary = atob(base64Clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Prozess zur Analyse eines Körperbildes
async function analyzeBodyImage(imageBase64: string) {
  try {
    // Hier würde eine echte KI-Bildanalyse stattfinden
    // Für diese Implementation simulieren wir die Ergebnisse

    // Simulierte Analyse
    const analysisResult = {
      bodyType: Math.random() > 0.5 ? "ectomorph" : (Math.random() > 0.5 ? "mesomorph" : "endomorph"),
      bodyFat: 10 + Math.random() * 20, // 10-30%
      height: 165 + Math.round(Math.random() * 30), // 165-195cm (geschätzt)
      shoulderToHipRatio: 1.2 + Math.random() * 0.6, // 1.2-1.8
      muscleMass: 35 + Math.random() * 20, // 35-55% des Körpergewichts
      limbProportions: {
        armLength: "proportional",
        legLength: "proportional"
      }
    };

    return analysisResult;
  } catch (error) {
    console.error("Error analyzing body image:", error);
    throw new Error("Failed to analyze body image");
  }
}

// Prozess zur Analyse einer bestimmten Muskelgruppe
async function analyzeMuscleGroup(muscleGroup: string, imageBase64: string) {
  try {
    // Hier würde eine echte KI-Analyse der Muskelgruppen stattfinden
    // Derzeit simulieren wir die Ergebnisse
    
    const baseMetrics = {
      size: 30 + Math.round(Math.random() * 40), // 30-70
      strength: 30 + Math.round(Math.random() * 50), // 30-80
      development: 30 + Math.round(Math.random() * 50), // 30-80
      symmetry: 70 + Math.round(Math.random() * 20), // 70-90
      flexibility: 40 + Math.round(Math.random() * 40), // 40-80
      endurance: 30 + Math.round(Math.random() * 60), // 30-90
      potentialForGrowth: 50 + Math.round(Math.random() * 30) // 50-80
    };
    
    // Anpassen der Werte basierend auf der Muskelgruppe
    switch (muscleGroup) {
      case 'chest':
        baseMetrics.size += 5;
        break;
      case 'back':
        baseMetrics.strength += 8;
        break;
      case 'shoulders':
        baseMetrics.symmetry += 5;
        break;
      case 'arms':
        baseMetrics.development += 3;
        break;
      case 'abs':
        baseMetrics.endurance += 10;
        break;
      case 'legs':
        baseMetrics.strength += 15;
        baseMetrics.endurance += 5;
        break;
    }
    
    return baseMetrics;
  } catch (error) {
    console.error(`Error analyzing ${muscleGroup}:`, error);
    throw new Error(`Failed to analyze ${muscleGroup}`);
  }
}

// Hauptfunktion für die Analyse des gesamten Körpers
async function performBodyAnalysis(fullBodyImage: string, muscleImages: Record<string, string>) {
  try {
    // Vollständige Körperanalyse
    const bodyAnalysisResult = await analyzeBodyImage(fullBodyImage);
    
    // Analyse jeder Muskelgruppe
    const muscleGroupAnalysis: Record<string, any> = {};
    
    for (const [muscleGroup, imageData] of Object.entries(muscleImages)) {
      const muscleAnalysisResult = await analyzeMuscleGroup(muscleGroup, imageData);
      muscleGroupAnalysis[muscleGroup] = muscleAnalysisResult;
    }
    
    // Schätzung des Körpergewichts basierend auf den Bilddaten
    const estimatedWeight = bodyAnalysisResult.height * 0.4 - 30 + (Math.random() * 10);
    
    // Berechnung des Fitness-Index
    let fitnessScore = 0;
    let totalMuscleScore = 0;
    
    // Berechnen des durchschnittlichen Muskelwertes
    for (const muscleData of Object.values(muscleGroupAnalysis)) {
      const muscleScore = (muscleData.development + muscleData.strength + muscleData.symmetry) / 3;
      totalMuscleScore += muscleScore;
    }
    
    // Fitness-Score basierend auf Muskelentwicklung und Körperfett
    const avgMuscleScore = totalMuscleScore / Object.keys(muscleGroupAnalysis).length;
    fitnessScore = Math.round(avgMuscleScore * 0.7 + (100 - bodyAnalysisResult.bodyFat) * 0.3);
    
    // Erstellen der Trainingsprioritäten
    const muscleGroups = Object.entries(muscleGroupAnalysis).map(([name, data]: [string, any]) => ({
      name,
      development: data.development,
      strength: data.strength
    }));
    
    // Sortieren nach Entwicklung (aufsteigend, schwächste zuerst)
    muscleGroups.sort((a, b) => a.development - b.development);
    
    // Zusammenstellung des finalen Ergebnisses
    return {
      age: 25 + Math.round(Math.random() * 15), // Simuliertes Alter zwischen 25-40
      height: bodyAnalysisResult.height,
      weight: Math.round(estimatedWeight * 10) / 10,
      bodyFat: Math.round(bodyAnalysisResult.bodyFat * 10) / 10,
      bodyType: bodyAnalysisResult.bodyType,
      shoulderToHipRatio: Math.round(bodyAnalysisResult.shoulderToHipRatio * 100) / 100,
      fitnessScore,
      muscleGroups: muscleGroupAnalysis,
      recommendations: {
        priorityMuscleGroups: muscleGroups.slice(0, 2).map(m => m.name),
        focusAreas: muscleGroups.slice(0, 3).map(m => m.name),
        suggestionsByBodyType: {
          workout: bodyAnalysisResult.bodyType === "ectomorph" 
            ? "Krafttraining mit höherem Volumen, moderate Gewichte" 
            : bodyAnalysisResult.bodyType === "mesomorph"
              ? "Ausgewogenes Training mit Kraft- und Ausdauerelementen"
              : "Fokus auf Ausdauer und HIIT mit Kraftelementen",
          nutrition: bodyAnalysisResult.bodyType === "ectomorph"
            ? "Erhöhte Kalorienzufuhr mit Fokus auf Protein und komplexe Kohlenhydrate"
            : bodyAnalysisResult.bodyType === "mesomorph"
              ? "Ausgewogene Ernährung mit moderatem Kalorienüberschuss für Muskelaufbau"
              : "Leichtes Kaloriendefizit mit hohem Proteinanteil"
        }
      }
    };
  } catch (error) {
    console.error("Error during body analysis:", error);
    throw new Error("Body analysis failed");
  }
}

serve(async (req) => {
  // CORS-Vorflug-Anfrage behandeln
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, fullBodyImage, muscleImages } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!fullBodyImage) {
      return new Response(
        JSON.stringify({ error: "Full body image is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Processing body scan analysis for user: ${userId}`);
    console.log(`Received images for muscle groups: ${Object.keys(muscleImages).join(', ')}`);
    
    // Durchführen der vollständigen Körperanalyse
    const analysisResult = await performBodyAnalysis(fullBodyImage, muscleImages);
    
    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
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
