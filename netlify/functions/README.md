# Serverless Function Setup for GitHub Data Submission

This directory contains serverless functions for automatically submitting experiment data to the GitHub repository.

## Netlify Setup

1. **Deploy to Netlify:**
   - Connect your GitHub repository to Netlify
   - Netlify will automatically detect the `netlify.toml` configuration

2. **Set Environment Variable:**
   - In Netlify dashboard, go to Site settings → Environment variables
   - Add a new variable:
     - **Key:** `GITHUB_TOKEN`
     - **Value:** Your GitHub Personal Access Token (with `repo` permissions)

3. **Create GitHub Token:**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate new token with `repo` scope
   - Copy the token and add it to Netlify environment variables

## Alternative: Vercel Setup

1. **Deploy to Vercel:**
   - Import your GitHub repository in Vercel
   - Rename `netlify/functions/submit-data.js` to `api/submit-data.js`

2. **Set Environment Variable:**
   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add `GITHUB_TOKEN` with your GitHub token

## Testing

Once deployed, the function will be available at:
- Netlify: `https://your-site.netlify.app/.netlify/functions/submit-data`
- Vercel: `https://your-site.vercel.app/api/submit-data`

The experiment will automatically try to use these endpoints when submitting data.

## Required GitHub Token Permissions

Your GitHub token needs these permissions:
- `repo` (Full control of private repositories) OR
- For fine-grained tokens:
  - Contents: Write
  - Metadata: Read