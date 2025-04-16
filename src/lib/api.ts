
// API endpoints and utility functions
import { toast } from "sonner";
import { useApiKey } from "@/contexts/ApiKeyContext";

// Default API key - using your provided key
const DEFAULT_API_KEY = "AIzaSyBby24SKB6FyLc9urJjGyYg7Ba8VnyJCl0";

export interface NutritionData {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  ingredients: string[];
  foodName: string;
  details: string;
}

const DEFAULT_NUTRITION: NutritionData = {
  calories: "0",
  protein: "0g",
  carbs: "0g",
  fat: "0g",
  ingredients: [],
  foodName: "Unknown Food",
  details: "No details available"
};

export const analyzeImage = async (
  imageBase64: string
): Promise<NutritionData> => {
  try {
    const apiKey = DEFAULT_API_KEY;
    
    // Update to use the newer model: gemini-1.5-flash instead of gemini-pro-vision
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Prompt engineering for better nutrition analysis
    const prompt = `
      Analyze this food image and provide nutritional details in JSON format with the following fields:
      - calories (string with number and unit like "250 kcal")
      - protein (string with amount like "12g")
      - carbs (string with amount like "30g")
      - fat (string with amount like "8g")
      - ingredients (array of strings with likely ingredients)
      - foodName (string with the name of the detected food)
      - details (a short paragraph describing the nutritional profile)
      
      Be as accurate as possible. If you cannot identify the food clearly or if it's not food, respond with null values.
      ONLY respond with valid JSON.
    `;

    // Prepare the request with image data
    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64.split(",")[1] // Remove the data URL prefix if present
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024
      }
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", errorText);
      toast.error("Failed to analyze image");
      return DEFAULT_NUTRITION;
    }

    const data = await response.json();
    
    // Extract text from the response 
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // Find JSON within the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const nutrition = JSON.parse(jsonMatch[0]) as NutritionData;
        return nutrition;
      } catch (e) {
        console.error("Error parsing JSON:", e, text);
        toast.error("Could not process the analysis result");
        return DEFAULT_NUTRITION;
      }
    }
    
    toast.error("Could not extract nutrition data");
    return DEFAULT_NUTRITION;
  } catch (error) {
    console.error("Error analyzing image:", error);
    toast.error("Failed to analyze image");
    return DEFAULT_NUTRITION;
  }
};
