// Data submission utility for Trust Game experiment
// Handles automatic data submission to repository

class DataSubmitter {
    constructor() {
        this.githubConfig = {
            owner: 'rempsyc',
            repo: 'lab_copilot_demo_testing',
            apiBase: 'https://api.github.com'
        };
        
        // Initialize OSF DataPipe integration
        this.osfDataPipe = new OSFDataPipe();
        this.configureOSFDataPipe();
        
        // Try to detect if we're running in an environment with GitHub access
        this.hasGitHubAccess = this.checkGitHubAccess();
    }

    /**
     * Configure OSF DataPipe with study settings
     */
    configureOSFDataPipe() {
        try {
            this.osfDataPipe.configure({
                experimentId: 'xMeT3pzdPmF9', // DataPipe experiment ID from OSF setup
                studyId: null, // Will be auto-generated per session
                sessionId: null // Will be auto-generated per participant
            });
        } catch (error) {
            console.warn('Failed to configure OSF DataPipe:', error);
        }
    }
    
    /**
     * Check if we have GitHub API access
     */
    checkGitHubAccess() {
        // Check if we're on GitHub Pages or have a token available
        const hostname = window.location.hostname;
        return hostname.includes('github.io') || hostname.includes('githubusercontent.com');
    }

    /**
     * Submit participant data using OSF DataPipe (primary method)
     * Falls back to CSV download only if OSF DataPipe fails
     */
    async submitData(participantData) {
        try {
            // Primary strategy: Try OSF DataPipe (recommended for research)
            const osfResult = await this.submitViaOSFDataPipe(participantData);
            if (osfResult.success) {
                return osfResult;
            }
            
            // Fallback: Save locally with CSV download option
            this.saveToLocalStorage(participantData);
            return {
                success: false,
                method: 'local_storage',
                message: 'OSF DataPipe unavailable. Your data has been saved locally for download.',
                showDownloadButton: true
            };

        } catch (error) {
            console.error('Data submission error:', error);
            // Fallback to local storage
            this.saveToLocalStorage(participantData);
            return {
                success: false,
                error: error.message,
                fallback: true,
                method: 'local_storage',
                message: 'Data saved locally as fallback. Please download the CSV file.',
                showDownloadButton: true
            };
        }
    }

    /**
     * Submit data via OSF DataPipe (primary and recommended method)
     */
    async submitViaOSFDataPipe(participantData) {
        try {
            console.log('Attempting data submission via OSF DataPipe...');
            
            const result = await this.osfDataPipe.submitData(participantData);
            
            if (result.success) {
                return {
                    success: true,
                    method: 'osf_datapipe',
                    message: 'Data successfully submitted to OSF DataPipe! Your data has been securely saved to the Open Science Framework.',
                    sessionId: result.sessionId,
                    experimentId: result.experimentId,
                    details: result.details
                };
            } else {
                console.warn('OSF DataPipe submission failed:', result.error);
                return { success: false, error: result.error || 'OSF DataPipe submission failed' };
            }
        } catch (error) {
            console.warn('OSF DataPipe submission error:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Create manual submission instructions for OSF DataPipe
     */
    getOSFManualSubmissionInstructions() {
        return [
            '1. Go to pipe.jspsych.org',
            '2. Enter your experiment ID: xMeT3pzdPmF9', 
            '3. Upload the JSON data provided below',
            '4. Or use your OSF project to store the CSV data',
            '5. Contact the researcher if you need assistance'
        ];
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