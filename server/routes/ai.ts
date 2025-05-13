import express, { Request, Response } from 'express';
import { generateText } from '../utils/gemini';
import { protect } from '../middleware/auth'; // Optional: protect AI routes

const router = express.Router();

// Route to generate a cover letter
router.post('/generate-cover-letter', protect, async (req: Request, res: Response) => {
  const { jobDescription, userResumeInfo, userPreferences } = req.body;

  if (!jobDescription || !userResumeInfo) {
    return res.status(400).json({ message: 'Job description and user resume information are required.' });
  }

  // Construct a detailed prompt for Gemini
  const prompt = `
    Based on the following job description, user resume information, and user preferences, please generate a compelling and personalized cover letter.

    Job Description:
    ---
    ${jobDescription}
    ---

    User Resume Information:
    ---
    ${JSON.stringify(userResumeInfo, null, 2)} 
    ---
    
    User Preferences (optional, e.g., tone, specific skills to highlight):
    ---
    ${userPreferences ? JSON.stringify(userPreferences, null, 2) : 'Default professional tone.'}
    ---

    The cover letter should be professional, concise, and highlight the most relevant skills and experiences from the user's resume that match the job description.
    Address it appropriately (e.g., "Dear Hiring Manager," if no specific name is provided).
    Ensure the tone aligns with the user's preferences if provided.
  `;

  try {
    const coverLetter = await generateText(prompt);
    res.json({ coverLetter });
  } catch (error: any) {
    console.error('Error generating cover letter:', error);
    res.status(500).json({ message: 'Failed to generate cover letter', error: error.message });
  }
});

// Route to tailor a resume
router.post('/tailor-resume', protect, async (req: Request, res: Response) => {
  const { jobDescription, baseResume, userPreferences } = req.body;

  if (!jobDescription || !baseResume) {
    return res.status(400).json({ message: 'Job description and base resume are required.' });
  }

  const prompt = `
    Please tailor the following base resume to better match the provided job description. 
    Focus on rephrasing, reordering, and highlighting existing skills and experiences from the base resume that are most relevant to the job description.
    Do not invent new experiences or skills. The output should be a complete, updated resume text.
    Consider any user preferences for emphasis.

    Job Description:
    ---
    ${jobDescription}
    ---

    Base Resume:
    ---
    ${baseResume} 
    ---

    User Preferences (optional, e.g., skills to emphasize, format notes):
    ---
    ${userPreferences ? JSON.stringify(userPreferences, null, 2) : 'No specific preferences.'}
    ---

    Tailored Resume Output:
  `;

  try {
    const tailoredResume = await generateText(prompt);
    res.json({ tailoredResume });
  } catch (error: any) {
    console.error('Error tailoring resume:', error);
    res.status(500).json({ message: 'Failed to tailor resume', error: error.message });
  }
});

export default router;
