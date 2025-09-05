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
- Data is automatically downloaded as a JSON file at the end
- Contains demographics, trial-by-trial decisions, and summary statistics
- No server required - all data processing happens client-side

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
