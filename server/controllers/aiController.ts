import { Request, Response } from 'express';
import { generateText } from '../utils/gemini';

// @desc    Generate application materials (cover letter, resume instructions/URL)
// @route   POST /api/ai/generate (Internal use by applyController)
// @access  Private (Called internally by authenticated routes)
export const generateApplicationMaterials = async (jobDetails: { title: string; company: string; description: string }) => {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set.');
    throw new Error('AI service is not configured.');
  }

  try {
    const prompt = `
      You are an AI assistant specialized in generating job application materials.
      Based on the following job details, generate a compelling cover letter and provide a placeholder URL for a resume.

      Job Title: ${jobDetails.title}
      Company: ${jobDetails.company}
      Job Description:
      ${jobDetails.description}

      ---
      Instructions:
      1. Generate a cover letter tailored to the job title and company, referencing key aspects from the job description. Make it professional and concise.
      2. Provide a placeholder URL for a resume. In a real application, this would be a link to a user's stored resume. For now, use 'https://example.com/placeholder-resume.pdf'.
      3. Format the output as a JSON object with two keys: "coverLetter" (string) and "resumeUrl" (string).

      Example Output:
      {
        "coverLetter": "Dear Hiring Manager...",
        "resumeUrl": "https://example.com/placeholder-resume.pdf"
      }
      ---

      Generate the JSON output:
    `;

    const text = await generateText(prompt);

    // Attempt to parse the JSON output from the text response
    // Gemini might wrap the JSON in markdown code blocks (```json ... ```)
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    let jsonString = text;
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
    }

    const materials = JSON.parse(jsonString);

    if (!materials || typeof materials.coverLetter !== 'string' || typeof materials.resumeUrl !== 'string') {
       throw new Error('AI response format is incorrect.');
    }

    return materials;

  } catch (error: any) {
    console.error('Error generating application materials with Gemini:', error.message);
    // Re-throw the error so the calling controller can handle the response
    throw new Error(`Failed to generate application materials: ${error.message}`);
  }
};

export const generateMaterials = async (req: Request, res: Response) => {
  const { jobDescription, userResume, userPreferences } = req.body;
  if (!jobDescription || !userResume) {
    return res.status(400).json({ message: 'jobDescription and userResume are required.' });
  }

  // Construct prompt for cover letter
  const coverLetterPrompt = `
    Given the following resume and job description, write a concise, personalized cover letter for this job.\n\nResume: ${userResume}\nJob Description: ${jobDescription}\nPreferences: ${userPreferences || 'None'}\nOutput only the cover letter text.
  `;

  // Construct prompt for tailored resume
  const resumePrompt = `
    Tailor the following resume to better match the provided job description. Highlight relevant skills and experiences.\n\nResume: ${userResume}\nJob Description: ${jobDescription}\nPreferences: ${userPreferences || 'None'}\nOutput the tailored resume as plain text.
  `;

  try {
    const coverLetter = await generateText(coverLetterPrompt);
    const tailoredResume = await generateText(resumePrompt);
    res.json({ coverLetter, tailoredResume });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to generate materials', error: error.message });
  }
};
