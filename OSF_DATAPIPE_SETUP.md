# OSF DataPipe Integration Guide

This document explains how to set up and use the OSF DataPipe integration for automated data collection in the Trust Game experiment.

## What is OSF DataPipe?

OSF DataPipe is a service provided by the Open Science Framework that allows researchers to securely collect experimental data directly from web-based experiments. It's specifically designed for behavioral research and provides a reliable alternative to complex server-side data collection setups.

## Benefits of OSF DataPipe

✅ **Research-focused**: Built specifically for behavioral experiments  
✅ **No server required**: Works entirely from client-side JavaScript  
✅ **Secure and reliable**: Hosted by the Open Science Framework  
✅ **Open science compliant**: Data stored in OSF ecosystem  
✅ **Easy to use**: Simple API for data submission  
✅ **Free for researchers**: No cost for academic use  

## How It Works

1. **Automatic submission**: When participants complete the experiment, their data is automatically sent to OSF DataPipe
2. **Structured format**: Data is formatted according to jsPsych/DataPipe standards
3. **Experiment grouping**: All data for your study is organized under a single experiment ID
4. **Session tracking**: Each participant gets a unique session ID for data integrity

## Current Configuration

The experiment is currently configured with:
- **Experiment ID**: `Cb1DhSdND5ek`
- **OSF Project**: https://osf.io/u4ngh
- **OSF Data Component**: https://osf.io/avu9k
- **DataPipe URL**: `https://pipe.jspsych.org/api/data/`

## Data Format

Each trial is saved as a separate record with the following fields:

### Core DataPipe Fields
- `experiment_id`: Unique identifier for this study
- `session_id`: Unique session identifier per participant
- `participant_id`: Generated participant identifier
- `trial_index`: Sequential trial number
- `trial_type`: Always "trust-game-trial"

### Trust Game Specific Data
- `round`: Round number (1-5)
- `amount_sent`: Amount participant sent to partner
- `amount_kept`: Amount participant kept
- `partner_received`: Total amount partner received (sent × 3 + 10)
- `amount_returned`: Amount partner sent back
- `final_earnings`: Participant earnings for this round
- `return_rate`: Partner's return rate (0.0-1.0)
- `reaction_time`: Decision time in milliseconds
- `trial_timestamp`: When the trial was completed

### Participant Demographics
- `participant_age`: Participant's age
- `participant_gender`: Participant's gender
- `participant_field`: Participant's field of study

### Summary Statistics
- `total_earnings`: Total earnings across all rounds
- `average_amount_sent`: Average amount sent per round
- `trust_pattern`: Calculated trust pattern (e.g., "Moderate Trust")
- `completion_time`: When experiment was completed

## Setup Instructions

### For Researchers (Recommended)

1. **Create OSF Account**: Go to [osf.io](https://osf.io) and create an account
2. **Create Project**: Create a new OSF project for your study
3. **Get DataPipe Access**: Visit [pipe.jspsych.org](https://pipe.jspsych.org) to set up DataPipe
4. **Configure Experiment ID**: Update the experiment ID in the code if needed

### For Developers

To modify the OSF DataPipe configuration, edit `osf-datapipe.js`:

```javascript
this.osfDataPipe.configure({
    experimentId: 'your_experiment_id_here', // Change this
    studyId: 'your_study_identifier',        // Change this
    sessionId: null // Auto-generated
});
```

## Manual Data Submission (Fallback)

If automatic submission fails, participants see instructions for manual submission:

### Option 1: OSF DataPipe Manual Upload
1. Go to [pipe.jspsych.org](https://pipe.jspsych.org)
2. Use experiment ID: `Cb1DhSdND5ek`
3. Upload the formatted JSON data

### Option 2: GitHub Repository Submission
1. Copy the CSV data from the experiment
2. Go to the repository's data folder
3. Create a new file with the suggested filename
4. Paste the data and commit

## Data Download and Analysis

### From OSF DataPipe
1. Log into your OSF account
2. Navigate to your project
3. Access the DataPipe component
4. Download data in CSV or JSON format

### Format for Analysis
The data is provided in long format with one row per trial, making it easy to analyze with R, Python, or statistical software.

Example R code:
```r
# Load data
data <- read.csv("trust_game_data.csv")

# Basic analysis
library(dplyr)
summary_stats <- data %>%
  group_by(participant_id) %>%
  summarise(
    total_earnings = first(total_earnings),
    avg_sent = first(average_amount_sent),
    trust_pattern = first(trust_pattern)
  )
```

## Troubleshooting

### "Data Saved Locally" Message
- OSF DataPipe might be temporarily unavailable
- Check your internet connection
- Try the manual submission options provided

### Missing Data in OSF
- Verify your experiment ID is correct
- Check that DataPipe is properly configured for your OSF project
- Ensure participants completed the full experiment

### Data Format Issues
- The experiment automatically formats data for DataPipe compatibility
- Manual submissions should use the provided JSON format
- CSV data is also available for direct analysis

## Privacy and Ethics

- **Participant consent**: Ensure participants consent to data sharing via OSF
- **Data anonymization**: Participant IDs are automatically generated and don't contain personal information
- **Open science**: Data submitted to OSF may be publicly accessible depending on your project settings
- **Compliance**: Ensure OSF usage complies with your institution's IRB requirements

## Support

For issues with:
- **DataPipe service**: Contact OSF support at [osf.io/support](https://osf.io/support)
- **Experiment implementation**: Create an issue in this repository
- **Data analysis**: Consult the OSF DataPipe documentation

## Migration from GitHub Direct Submission

If you were previously using the GitHub direct submission method:

1. **Data format is compatible**: Existing CSV format works with both systems
2. **Participant experience improved**: No more manual submission required for most participants
3. **Better reliability**: OSF DataPipe is more reliable than GitHub API calls from browsers
4. **Research workflow**: OSF is better suited for research data management

The GitHub submission option remains available as a fallback method.