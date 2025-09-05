# Trust Game Experiment Data

This folder contains CSV data files from Trust Game experiment participants.

## Data Format

Each CSV file contains the following columns:
- participant_id: Unique identifier for the participant
- experiment: Name of the experiment ('trust_game')
- version: Version of the experiment
- participant_timestamp: When the participant started
- age, gender, field: Demographic information
- round: Round number (1-5)
- amount_sent: Amount participant sent to partner
- amount_kept: Amount participant kept
- partner_received: Amount partner received (sent amount * 3 + 10)
- amount_returned: Amount partner sent back
- final_earnings: Participant's earnings for that round
- return_rate: Partner's return rate
- trial_timestamp: When the trial was completed
- reaction_time: Time taken to make decision (ms)
- total_earnings: Total earnings across all rounds
- average_amount_sent: Average amount sent per round
- trust_pattern: Classification of trust behavior
- completion_time: When experiment was completed

## File Naming Convention

Files are named: `trust_game_data_[PARTICIPANT_ID]_[TIMESTAMP].csv`

Example: `trust_game_data_P1693834567891_123_20240905T183456Z.csv`

## Data Submission

Data files are automatically submitted to this repository when participants complete the experiment.