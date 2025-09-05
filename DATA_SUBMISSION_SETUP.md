# Data Submission Setup Guide

This document explains how to set up automated data submission for the Trust Game experiment to save participant data directly to the GitHub repository.

## Problem

By default, the experiment shows "Data Successfully Saved!" but data is only saved to the participant's browser localStorage, not to the GitHub repository. This guide provides several solutions to enable automatic data submission.

## Solution Options

### Option 1: GitHub Actions Workflow (Recommended)

**What it does:** Uses GitHub Actions to automatically save data when triggered by the experiment.

**Setup Required:**
1. **Add Repository Secret:**
   - Go to your repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `GH_TOKEN`
   - Value: A Personal Access Token with repository permissions (see below)

2. **Create Fine-Grained Personal Access Token (Recommended):**
   - Go to GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens
   - Click "Generate new token"
   - Select "Selected repositories" and choose this repository only
   - Set expiration and select permissions:
     - ✅ Contents: Write (to create data files)
     - ✅ Metadata: Read (basic repository access)
     - ✅ Actions: Write (if using repository dispatch)
   - Copy the token and use it as the `GH_TOKEN` secret value

   **Alternative - Classic Token:**
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Set expiration and select scopes:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
   - Copy the token and use it as the `GH_TOKEN` secret value

**Pros:**
- ✅ Fully automated
- ✅ Secure (token not exposed to users)
- ✅ Works from any browser/device
- ✅ Creates proper commit history

**Cons:**
- ⚠️ Requires GitHub token setup
- ⚠️ May have slight delay (usually 10-30 seconds)

### Option 2: GitHub Issues Collection

**What it does:** Creates a GitHub issue with the participant's data that can be manually processed.

**Setup Required:**
1. Same GitHub token setup as Option 1
2. Enable Issues in repository settings

**Pros:**
- ✅ Simple fallback method
- ✅ Data is immediately visible as issues
- ✅ Can be automated with issue templates

**Cons:**
- ⚠️ Requires manual processing to move data to files
- ⚠️ Issues can become cluttered

### Option 3: Server-Side Proxy (Advanced)

**What it does:** Uses a server-side script to handle GitHub API calls securely.

**Setup Required:**
1. Deploy `submit-data.php` to a web server with PHP support
2. Set `GH_TOKEN` environment variable on the server
3. Update `data-submitter.js` to use the proxy endpoint

**Pros:**
- ✅ Most reliable
- ✅ Immediate data submission
- ✅ Full control over the process

**Cons:**
- ❌ Requires separate web server
- ❌ More complex setup
- ❌ Additional hosting costs

### Option 4: Manual Download (Current Fallback)

**What it does:** Participants download their data and submit manually.

**Setup Required:** None

**Pros:**
- ✅ Always works
- ✅ No server setup required
- ✅ Complete participant control

**Cons:**
- ❌ Requires manual effort from participants
- ❌ Higher chance of data loss
- ❌ Inconvenient for participants

## Recommended Implementation

For most research use cases, we recommend **Option 1 (GitHub Actions)** with **Option 4 (Manual Download)** as fallback.

### Quick Setup Steps:

1. **Create a Fine-Grained Personal Access Token:**
   ```
   GitHub Profile → Settings → Developer settings → Personal access tokens
   → Fine-grained tokens → Generate new token
   
   Repository access: Selected repositories (choose this repo only)
   Required permissions:
   - Contents: Write ✅
   - Metadata: Read ✅
   - Actions: Write ✅ (for repository dispatch)
   ```

2. **Add Repository Secret:**
   ```
   Repository → Settings → Secrets and variables → Actions
   → New repository secret
   
   Name: GH_TOKEN
   Value: [your token from step 1]
   ```

3. **Test the Setup:**
   - Run the experiment from https://rempsyc.github.io/lab_copilot_demo_testing/
   - Complete all 5 rounds
   - Check if data appears in the `/data` folder within 1-2 minutes

## Alternative Data Collection Methods

If GitHub-based collection doesn't work for your use case, consider these alternatives:

### OSF (Open Science Framework) Integration
- Use the jsPsych dataPipe extension
- Automatically sync data to OSF projects
- Better for large-scale data collection

### Email-Based Submission
- Participants email their data files
- Simple but requires manual processing
- Good for small studies

### Third-Party Survey Platforms
- Use Qualtrics, SurveyMonkey, or similar
- Embed the experiment as an iframe
- Leverage their data collection infrastructure

## Troubleshooting

### "Data Saved Locally" Message
- Check if GH_TOKEN is properly set in repository secrets
- Verify token has correct permissions (Contents: Write, Metadata: Read)
- Check repository Actions tab for errors

### GitHub Actions Not Triggering
- Ensure workflow file is in `main` branch
- Check Actions are enabled in repository settings
- Verify token has `Actions: Write` permission (fine-grained) or `workflow` scope (classic)

### CORS Errors (Server-Side Proxy)
- Update `Access-Control-Allow-Origin` header
- Ensure HTTPS is used for GitHub Pages
- Check server configuration

## Security Considerations

- **Never commit GitHub tokens to the repository**
- Use repository secrets for sensitive data
- Regularly rotate access tokens
- Consider token scope limitations
- Monitor repository access logs

## Support

If you encounter issues with the data submission setup, please:
1. Check the repository Actions tab for error logs
2. Verify your GitHub token permissions
3. Test with a simple experiment run
4. Create an issue in this repository with error details