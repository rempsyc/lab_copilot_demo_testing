// OSF DataPipe integration for Trust Game experiment
// Provides reliable data submission to Open Science Framework

class OSFDataPipe {
    constructor() {
        this.dataPipeUrl = 'https://pipe.jspsych.org/api/data/';
        this.isConfigured = false;
        this.configuration = {
            experimentId: null, // Will be set by configure() method
            sessionId: null,
            studyId: null
        };
    }

    /**
     * Initialize OSF DataPipe with study configuration
     * @param {Object} config - Configuration object
     * @param {string} config.experimentId - Unique experiment identifier  
     * @param {string} config.studyId - OSF study/project identifier
     * @param {string} config.sessionId - Optional session identifier
     */
    configure(config) {
        if (!config.experimentId) {
            throw new Error('experimentId is required for OSF DataPipe');
        }
        
        this.configuration = {
            experimentId: config.experimentId,
            studyId: config.studyId || null,
            sessionId: config.sessionId || this.generateSessionId()
        };
        
        this.isConfigured = true;
        console.log('OSF DataPipe configured:', this.configuration);
    }

    /**
     * Generate a unique session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Submit data to OSF DataPipe
     * @param {Object} data - Experiment data to submit
     * @returns {Promise<Object>} Submission result
     */
    async submitData(data) {
        if (!this.isConfigured) {
            throw new Error('OSF DataPipe not configured. Call configure() first.');
        }

        try {
            // Prepare data for OSF DataPipe format
            const submissionData = this.formatDataForOSF(data);
            
            console.log('Submitting data to OSF DataPipe:', submissionData);

            const response = await fetch(this.dataPipeUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData)
            });

            if (response.ok) {
                const result = await response.json();
                return {
                    success: true,
                    method: 'osf_datapipe',
                    message: 'Data successfully submitted to OSF DataPipe!',
                    sessionId: this.configuration.sessionId,
                    experimentId: this.configuration.experimentId,
                    details: result
                };
            } else {
                const errorText = await response.text();
                throw new Error(`DataPipe API error: ${response.status} ${errorText}`);
            }

        } catch (error) {
            console.error('OSF DataPipe submission error:', error);
            return {
                success: false,
                error: error.message,
                method: 'osf_datapipe_failed'
            };
        }
    }

    /**
     * Format experiment data for OSF DataPipe
     * DataPipe expects specific format matching jsPsych DataPipe plugin
     */
    formatDataForOSF(data) {
        // Generate unique filename for this session
        const timestamp = new Date().toISOString().replace(/[:.]/g, '').replace('T', '_').slice(0, -8);
        const filename = `${data.participant_id}_${timestamp}.csv`;
        
        // Format data as CSV string (required by DataPipe)
        const csvData = this.convertToCSV(data);
        
        // Return format matching jsPsych DataPipe plugin as shown in OSF configuration
        return {
            action: "save",
            experiment_id: this.configuration.experimentId,
            session_id: this.configuration.sessionId,
            filename: filename,
            data_string: csvData
        };
    }

    /**
     * Convert experiment data to CSV format for DataPipe
     */
    convertToCSV(data) {
        // CSV headers with all required jsPsych and experiment fields
        const headers = [
            'trial_type',
            'trial_index', 
            'time_elapsed',
            'rt',
            'experiment_id',
            'session_id',
            'participant_id',
            'round',
            'amount_sent',
            'amount_kept',
            'partner_received',
            'amount_returned',
            'final_earnings',
            'return_rate',
            'trial_timestamp',
            'participant_age',
            'participant_gender',
            'participant_field',
            'experiment_version',
            'experiment_name',
            'participant_timestamp',
            'total_earnings',
            'average_amount_sent',
            'trust_pattern',
            'completion_time'
        ];
        
        // Convert each trial to CSV row
        const rows = data.trials.map((trial, index) => [
            'trust-game-trial',
            index,
            (index + 1) * 10000, // Approximate time elapsed
            trial.reaction_time || '',
            this.configuration.experimentId,
            this.configuration.sessionId,
            data.participant_id,
            trial.round,
            trial.amount_sent,
            trial.amount_kept,
            trial.partner_received,
            trial.amount_returned,
            trial.final_earnings,
            trial.return_rate,
            trial.timestamp,
            data.demographics.age || '',
            data.demographics.gender || '',
            data.demographics.field || '',
            data.version,
            data.experiment,
            data.timestamp,
            data.summary.total_earnings || '',
            data.summary.average_amount_sent || '',
            data.summary.trust_pattern || '',
            data.summary.completion_time || ''
        ]);
        
        // Combine headers and rows into CSV format
        return [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
    }

    /**
     * Create a backup submission option when DataPipe fails
     * Returns clean instructions focused on CSV download
     */
    async createBackupSubmission(data) {
        const csvData = this.convertToCSV(data);
        return {
            success: false,
            method: 'local_fallback',
            message: 'OSF DataPipe unavailable. Data saved locally for download.',
            csvData: csvData,
            instructions: this.getDataSubmissionInstructions()
        };
    }

    /**
     * Get clean instructions for data submission fallback
     */
    getDataSubmissionInstructions() {
        return [
            'OSF DataPipe submission failed.',
            'Your data has been saved locally.',
            'Please download the CSV file using the button provided.',
            'Contact the researcher if you need assistance.'
        ];
    }

    /**
     * Validate DataPipe configuration
     */
    validateConfiguration() {
        const errors = [];
        
        if (!this.configuration.experimentId) {
            errors.push('Missing experimentId');
        }
        
        if (this.configuration.experimentId && !/^[a-zA-Z0-9_-]+$/.test(this.configuration.experimentId)) {
            errors.push('experimentId must contain only letters, numbers, underscores, and dashes');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Get current configuration status
     */
    getStatus() {
        return {
            configured: this.isConfigured,
            configuration: this.configuration,
            dataPipeUrl: this.dataPipeUrl,
            validation: this.validateConfiguration()
        };
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OSFDataPipe;
}
