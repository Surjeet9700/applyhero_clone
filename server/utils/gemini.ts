import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // Or your preferred model
});

const generationConfig = {
  temperature: 0.9, // Adjust as needed
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192, // Adjust as needed
  responseMimeType: "text/plain", // Or "application/json" if you structure prompts for JSON output
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export async function generateText(prompt: string): Promise<string> {
  try {
    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: [], // You can manage chat history here if needed
    });

    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    throw new Error("Failed to generate text using Gemini API.");
  }
}

// Example usage (can be removed or used in routes/ai.ts)
// async function testGeneration() {
//   try {
//     const text = await generateText("Write a short story about a friendly robot.");
//     console.log("Generated text:", text);
//   } catch (error) {
//     console.error(error);
//   }
// }
// testGeneration();
