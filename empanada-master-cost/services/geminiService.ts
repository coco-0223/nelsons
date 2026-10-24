
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const suggestRecipeIngredients = async (recipeName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Sugiere una lista de ingredientes básicos para una receta de "${recipeName}" de empanadas para una producción de 24 unidades. Proporciona cantidades típicas y unidades (kg, lt, unid).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedIngredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  unitType: { type: Type.STRING, enum: ['kg', 'lt', 'unid'] },
                  quantityUsed: { type: Type.NUMBER },
                  packageSize: { type: Type.NUMBER }
                },
                required: ['name', 'unitType', 'quantityUsed', 'packageSize']
              }
            }
          },
          required: ['suggestedIngredients']
        }
      }
    });

    return JSON.parse(response.text).suggestedIngredients;
  } catch (error) {
    console.error("Error fetching suggestions from Gemini:", error);
    return null;
  }
};
