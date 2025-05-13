// Import the API utility functions
import { api } from './utils/api.js';

// --- Site-Specific Selectors and Logic ---
// IMPORTANT: These selectors are examples and may need to be updated
// based on the current HTML structure of LinkedIn and Indeed job pages.
const siteConfig = {
  'linkedin.com': {
    applyButtonSelector: 'button.jobs-apply-button', // Example selector for LinkedIn Easy Apply
    jobTitleSelector: 'h1.job-title', // Example
    companyNameSelector: 'span.job-card-container__primary-description', // Example
    jobDescriptionSelector: 'div.jobs-description-content__text', // Example
    // Add selectors for cover letter textarea, resume file input, submit button
    // These are highly dependent on the specific application modal/page structure
    coverLetterTextareaSelector: 'textarea[name="coverletter"]', // Example
    resumeFileInputSelector: 'input[type="file"][name="resume"]', // Example
    submitButtonSelector: 'button[type="submit"]', // Example
  },
  'indeed.com': {
    applyButtonSelector: '#applyButtonLink', // Example selector for Indeed Apply
    jobTitleSelector: 'h1.jobsearch-JobInfoHeader-title', // Example
    companyNameSelector: 'div.jobsearch-CompanyInfoWithoutHeaderImage > div > div > div > div > div:nth-child(1)', // Example
    jobDescriptionSelector: '#jobDescriptionText', // Example
     // Add selectors for cover letter textarea, resume file input, submit button
    // These are highly dependent on the specific application modal/page structure
    coverLetterTextareaSelector: 'textarea#coverletter-textarea', // Example
    resumeFileInputSelector: 'input[type="file"]#resume-upload-input', // Example
    submitButtonSelector: 'button#indeed-apply-button', // Example
  },
  // --- Added ZipRecruiter support (selectors may need adjustment) ---
  'ziprecruiter.com': {
    applyButtonSelector: 'button[data-qa="apply-button"]', // Example
    jobTitleSelector: 'h1.topcard__title', // Example
    companyNameSelector: 'a.topcard__org-name-link', // Example
    jobDescriptionSelector: 'div.job_description', // Example
    coverLetterTextareaSelector: 'textarea[name="cover_letter"]', // Example
    resumeFileInputSelector: 'input[type="file"][name="resume"]', // Example
    submitButtonSelector: 'button[type="submit"]', // Example
  },
  // --- Added Glassdoor support (selectors may need adjustment) ---
  'glassdoor.com': {
    applyButtonSelector: 'button[data-test="applyButton"]', // Example
    jobTitleSelector: 'div[data-test="job-title"]', // Example
    companyNameSelector: 'div[data-test="employer-name"]', // Example
    jobDescriptionSelector: 'div.jobDescriptionContent', // Example
    coverLetterTextareaSelector: 'textarea[name="coverLetter"]', // Example
    resumeFileInputSelector: 'input[type="file"][name="resume"]', // Example
    submitButtonSelector: 'button[type="submit"]', // Example
  },
};

// --- Main Injection Logic ---

async function initAutoApply() {
  console.log('ApplyHeroClone injector script loaded.');

  const currentSite = window.location.hostname;
  const config = Object.keys(siteConfig).find(site => currentSite.includes(site));

  if (!config) {
    console.log('ApplyHeroClone: Not a supported job page.');
    return; // Not on a supported job page
  }

  const { applyButtonSelector, jobTitleSelector, companyNameSelector, jobDescriptionSelector, coverLetterTextareaSelector, resumeFileInputSelector, submitButtonSelector } = siteConfig[config];

  // Wait for the apply button to be present
  const applyButton = await waitForElement(applyButtonSelector);

  if (!applyButton) {
    console.log('ApplyHeroClone: Apply button not found.');
    return;
  }

  console.log('ApplyHeroClone: Apply button found. Adding auto-apply listener.');

  // Add a click listener to the apply button
  applyButton.addEventListener('click', async () => {
    console.log('Apply button clicked. Initiating auto-apply sequence...');

    try {
      // 1. Scrape Job Details
      const jobTitleElement = document.querySelector(jobTitleSelector);
      const companyNameElement = document.querySelector(companyNameSelector);
      const jobDescriptionElement = document.querySelector(jobDescriptionSelector);

      const jobDetails = {
        title: jobTitleElement ? jobTitleElement.innerText.trim() : 'N/A',
        company: companyNameElement ? companyNameElement.innerText.trim() : 'N/A',
        description: jobDescriptionElement ? jobDescriptionElement.innerText.trim() : 'N/A',
      };

      console.log('Scraped Job Details:', jobDetails);

      // 2. Call Backend AI for materials
      console.log('Calling backend for application materials...');
      const materials = await api.generateApplicationMaterials(jobDetails);
      console.log('Received materials:', materials);

      const { coverLetter, resumeUrl } = materials;

      // Wait for the application modal/form to appear after clicking apply
      // This part is highly site-specific and might need complex observation (MutationObserver)
      // For simplicity, we'll add a delay and look for form elements.
      await delay(2000); // Wait for modal to potentially open

      // 3. Fill Cover Letter
      const coverLetterTextarea = document.querySelector(coverLetterTextareaSelector);
      if (coverLetterTextarea && coverLetter) {
        console.log('Filling cover letter...');
        coverLetterTextarea.value = coverLetter;
        // Trigger input events if necessary for the site's framework to detect changes
        coverLetterTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        coverLetterTextarea.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        console.warn('Cover letter textarea not found or no cover letter provided.');
      }

      // 4. Upload Resume
      const resumeFileInput = document.querySelector(resumeFileInputSelector);
      if (resumeFileInput && resumeUrl) {
        console.log('Attempting to upload resume from URL:', resumeUrl);
        try {
          const response = await fetch(resumeUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch resume: ${response.status} ${response.statusText}`);
          }
          const blob = await response.blob();

          // --- WARNING: Programmatic file input is often blocked by browsers ---
          // This method might not work due to security restrictions.
          // A manual upload or a different approach might be necessary.
          const file = new File([blob], 'resume.pdf', { type: blob.type });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          resumeFileInput.files = dataTransfer.files;

          // Trigger change event
          resumeFileInput.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('Attempted to set resume file input.');

        } catch (fetchError) {
          console.error('Error fetching or setting resume file:', fetchError);
          // Log application failure due to resume upload issue
           await api.logApplication({
              title: jobDetails.title,
              company: jobDetails.company,
              success: false,
              details: `Resume upload failed: ${fetchError.message}`
            });
            alert('ApplyHeroClone: Failed to upload resume. Please upload manually.');
            return; // Stop the process if resume upload fails
        }
      } else {
         console.warn('Resume file input not found or no resume URL provided.');
         // Decide if this should stop the process or continue without resume
         // For now, we'll continue but log a warning.
      }

      // 5. Click Submit Button
      const submitButton = document.querySelector(submitButtonSelector);
      if (submitButton) {
        console.log('Clicking submit button...');
        // Use a slight delay before clicking submit
        await delay(500);
        submitButton.click();
        console.log('Submit button clicked.');

        // 6. Log Application Success
        await api.logApplication({
          title: jobDetails.title,
          company: jobDetails.company,
          success: true,
          details: 'Application submitted successfully (simulated click).'
        });
        console.log('Application logged as successful.');

      } else {
        console.warn('Submit button not found.');
         // Log application failure due to missing submit button
         await api.logApplication({
            title: jobDetails.title,
            company: jobDetails.company,
            success: false,
            details: 'Submit button not found.'
          });
          alert('ApplyHeroClone: Submit button not found. Please complete manually.');
      }


    } catch (error) {
      console.error('ApplyHeroClone Auto-Apply Error:', error);
      // Log application failure due to any error in the process
      const jobTitleElement = document.querySelector(jobTitleSelector);
      const companyNameElement = document.querySelector(companyNameSelector);
       await api.logApplication({
          title: jobTitleElement ? jobTitleElement.innerText.trim() : 'N/A',
          company: companyNameElement ? companyNameElement.innerText.trim() : 'N/A',
          success: false,
          details: `Auto-apply process failed: ${error.message}`
        });
      alert(`ApplyHeroClone: Auto-apply failed. Please apply manually.\nError: ${error.message}`);
    }
  });
}

// Helper function to wait for an element to appear in the DOM
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Optional: Timeout to prevent infinite waiting
    setTimeout(() => {
      observer.disconnect();
      resolve(null); // Resolve with null if element not found within timeout
    }, timeout);
  });
}

// Helper function for delays
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// Initialize the auto-apply process when the script is injected
initAutoApply();
