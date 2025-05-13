import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure the model
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});

interface GenerationResult {
  coverLetter: string;
  tailoredResume?: string;
}

export async function generateApplicationMaterials(
  jobDetails: {
    title: string;
    company: string;
    description: string;
  },
  userProfile: {
    baseResume: string;
    preferences?: Record<string, any>;
  }
): Promise<GenerationResult> {
  const prompt = `
    As an AI assistant specializing in job applications, create application materials based on the following:

    Job Details:
    Title: ${jobDetails.title}
    Company: ${jobDetails.company}
    Description: ${jobDetails.description}

    Candidate's Resume:
    ${userProfile.baseResume}

    ${userProfile.preferences ? `Preferences: ${JSON.stringify(userProfile.preferences, null, 2)}` : ''}

    Please generate:
    1. A professional, concise cover letter (max 300 words) that:
       - Addresses key requirements from the job description
       - Highlights relevant experience from the resume
       - Maintains a professional yet engaging tone
       - Follows standard cover letter format
    
    2. Suggestions for resume tailoring (optional):
       - Key skills to emphasize
       - Relevant experiences to highlight
       - Format adjustments if needed

    Return the response in JSON format:
    {
      "coverLetter": "Dear Hiring Manager,...",
      "tailoredResume": "Suggestions for resume tailoring..."
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse the JSON response
    const materials = JSON.parse(text);
    
    return {
      coverLetter: materials.coverLetter,
      tailoredResume: materials.tailoredResume,
    };
  } catch (error) {
    console.error('Error generating application materials:', error);
    throw new Error('Failed to generate application materials');
  }
}