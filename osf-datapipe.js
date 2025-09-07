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
     * DataPipe expects a specific format with trial-level data
     */
    formatDataForOSF(data) {
        const formattedTrials = data.trials.map((trial, index) => ({
            // Required DataPipe/jsPsych core fields
            trial_type: 'trust-game-trial',
            trial_index: index,
            time_elapsed: (index + 1) * 10000, // Approximate time elapsed
            rt: trial.reaction_time || null,
            
            // Standard DataPipe fields  
            experiment_id: this.configuration.experimentId,
            session_id: this.configuration.sessionId,
            participant_id: data.participant_id,
            
            // Trust game specific data
            round: trial.round,
            amount_sent: trial.amount_sent,
            amount_kept: trial.amount_kept,
            partner_received: trial.partner_received,
            amount_returned: trial.amount_returned,
            final_earnings: trial.final_earnings,
            return_rate: trial.return_rate,
            trial_timestamp: trial.timestamp,
            
            // Participant demographics
            participant_age: data.demographics.age,
            participant_gender: data.demographics.gender,
            participant_field: data.demographics.field,
            
            // Experiment metadata
            experiment_version: data.version,
            experiment_name: data.experiment,
            participant_timestamp: data.timestamp,
            
            // Summary statistics (for analysis convenience)
            total_earnings: data.summary.total_earnings,
            average_amount_sent: data.summary.average_amount_sent,
            trust_pattern: data.summary.trust_pattern,
            completion_time: data.summary.completion_time
        }));

        return {
            experimentID: this.configuration.experimentId,
            sessionID: this.configuration.sessionId,
            data: formattedTrials
        };
    }

    /**
     * Create a backup submission option when DataPipe fails
     * Returns clean instructions focused on CSV download
     */
    async createBackupSubmission(data) {
        return {
            success: false,
            method: 'local_fallback',
            message: 'OSF DataPipe unavailable. Data saved locally for download.',
            data: this.formatDataForOSF(data),
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
