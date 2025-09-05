// Data submission utility for Trust Game experiment
// Handles automatic data submission to repository

class DataSubmitter {
    constructor() {
        this.githubConfig = {
            owner: 'rempsyc',
            repo: 'lab_copilot_demo_testing',
            apiBase: 'https://api.github.com'
        };
    }

    /**
     * Submit participant data by creating a GitHub issue with the data
     * This provides a simple way to collect data without requiring server infrastructure
     */
    async submitData(participantData) {
        try {
            const issueData = {
                title: `Trust Game Data Submission - ${participantData.participant_id}`,
                body: this.formatDataForIssue(participantData),
                labels: ['data-submission', 'trust-game']
            };

            // For now, we'll save to localStorage as a fallback and provide copy-paste option
            this.saveToLocalStorage(participantData);
            
            return {
                success: true,
                method: 'local_storage',
                message: 'Data saved locally. Please copy the data from the textarea below to submit manually.'
            };

        } catch (error) {
            console.error('Data submission error:', error);
            // Fallback to local storage
            this.saveToLocalStorage(participantData);
            return {
                success: false,
                error: error.message,
                fallback: true,
                message: 'Data saved locally as fallback. Please copy the data manually.'
            };
        }
    }

    /**
     * Format participant data for GitHub issue submission
     */
    formatDataForIssue(data) {
        const csvData = this.convertToCSV(data);
        
        return `## Trust Game Experiment Data Submission

**Participant ID:** ${data.participant_id}
**Timestamp:** ${data.timestamp}
**Completion Time:** ${data.summary.completion_time || 'N/A'}

### Summary Statistics
- **Total Earnings:** $${data.summary.total_earnings || 0}
- **Average Amount Sent:** $${(data.summary.average_amount_sent || 0).toFixed(2)}
- **Trust Pattern:** ${data.summary.trust_pattern || 'N/A'}

### CSV Data
\`\`\`csv
${csvData}
\`\`\`

*This issue was automatically created by the Trust Game experiment. The CSV data above should be saved to the /data folder.*`;
    }

    /**
     * Convert data to CSV format (same as in main experiment)
     */
    convertToCSV(data) {
        const headers = [
            'participant_id',
            'experiment',
            'version', 
            'participant_timestamp',
            'age',
            'gender',
            'field',
            'round',
            'amount_sent',
            'amount_kept',
            'partner_received',
            'amount_returned',
            'final_earnings',
            'return_rate',
            'trial_timestamp',
            'reaction_time',
            'total_earnings',
            'average_amount_sent',
            'trust_pattern',
            'completion_time'
        ];
        
        const rows = data.trials.map(trial => [
            data.participant_id,
            data.experiment,
            data.version,
            data.timestamp,
            data.demographics.age || '',
            data.demographics.gender || '',
            data.demographics.field || '',
            trial.round,
            trial.amount_sent,
            trial.amount_kept,
            trial.partner_received,
            trial.amount_returned,
            trial.final_earnings,
            trial.return_rate,
            trial.timestamp,
            trial.reaction_time,
            data.summary.total_earnings || '',
            data.summary.average_amount_sent || '',
            data.summary.trust_pattern || '',
            data.summary.completion_time || ''
        ]);
        
        return [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
    }

    /**
     * Save data to browser's localStorage as backup
     */
    saveToLocalStorage(data) {
        const key = `trust_game_data_${data.participant_id}`;
        const csvData = this.convertToCSV(data);
        
        localStorage.setItem(key, JSON.stringify({
            participantId: data.participant_id,
            timestamp: data.timestamp,
            csvData: csvData,
            saved: new Date().toISOString()
        }));
    }

    /**
     * Get all saved data from localStorage
     */
    getAllSavedData() {
        const savedData = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('trust_game_data_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    savedData.push(data);
                } catch (e) {
                    console.warn('Error parsing saved data:', e);
                }
            }
        }
        return savedData;
    }

    /**
     * Generate filename for CSV data
     */
    generateFilename(participantId) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '').replace('T', '_').slice(0, -1);
        return `trust_game_data_${participantId}_${timestamp}.csv`;
    }
}