# Trust Game for Center for Conflict and Cooperation

This repository hosts a behavioral trust game experiment designed for the Center for Conflict and Cooperation. The experiment is implemented as a web-based application that can be accessed directly through GitHub Pages.

## Experiment Overview

The Trust Game is a classic behavioral economics experiment that measures trust and reciprocity between participants. In this version:

- Participants start each round with $10
- They can choose to send $0, $5, or $10 to a simulated partner
- Any amount sent is tripled before the partner receives it
- The partner (simulated with different personalities) sends some amount back
- Participants play 5 rounds with different partners

## Features

- **Web-based**: Runs entirely in the browser, no installation required
- **Data Collection**: Automatically downloads participant data as JSON files
- **Responsive Design**: Works on desktop and mobile devices
- **Progress Tracking**: Shows progress through the 5 rounds
- **Demographic Collection**: Collects basic participant information
- **Results Summary**: Provides detailed feedback and analysis

## Access the Experiment

The experiment is hosted at: https://rempsyc.github.io/lab_copilot_demo_testing/

## Data Collection

- Each participant receives a unique ID
- **Automatic Repository Submission**: Data is automatically saved to the repository's `/data` folder
- **Fallback Options**: Local download as JSON/CSV files if automatic submission fails
- **Manual Submission**: Clear instructions provided for manual data submission when needed
- Contains demographics, trial-by-trial decisions, and summary statistics
- No server required for basic functionality - all data processing happens client-side

### Data Submission Setup

For automatic data submission to work, repository maintainers need to configure a GitHub token. See [DATA_SUBMISSION_SETUP.md](DATA_SUBMISSION_SETUP.md) for detailed setup instructions.

**Quick Setup for Repository Owners:**
1. Create a GitHub Personal Access Token with `repo` and `workflow` permissions
2. Add it as a repository secret named `GITHUB_TOKEN`
3. Data will be automatically saved to the `/data` folder when participants complete the experiment

If automatic submission is not set up, participants will receive clear instructions for manual data submission.

## Technical Details

- Built with vanilla JavaScript (no external dependencies)
- Responsive CSS design
- Compatible with modern web browsers
- GitHub Pages ready

## Research Applications

This experiment is suitable for research on:
- Trust and cooperation
- Social decision making
- Behavioral economics
- Conflict resolution
- Game theory applications
