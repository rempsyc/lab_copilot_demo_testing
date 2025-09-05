// Data submission utility for Trust Game experiment
// Handles automatic data submission to repository

class DataSubmitter {
    constructor() {
        this.githubConfig = {
            owner: 'rempsyc',
            repo: 'lab_copilot_demo_testing',
            apiBase: 'https://api.github.com'
        };
        
        // Try to detect if we're running in an environment with GitHub access
        this.hasGitHubAccess = this.checkGitHubAccess();
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
     * Submit participant data using multiple strategies
     */
    async submitData(participantData) {
        try {
            // Strategy 1: Try GitHub API if we have access
            if (this.hasGitHubAccess) {
                const apiResult = await this.submitViaGitHubAPI(participantData);
                if (apiResult.success) {
                    return apiResult;
                }
            }
            
            // Strategy 2: Try repository dispatch (requires server-side handling)
            const dispatchResult = await this.submitViaRepositoryDispatch(participantData);
            if (dispatchResult.success) {
                return dispatchResult;
            }
            
            // Strategy 3: Create GitHub issue as fallback
            const issueResult = await this.submitViaGitHubIssue(participantData);
            if (issueResult.success) {
                return {
                    success: true,
                    method: 'github_issue',
                    message: 'Data submitted via GitHub issue. It will be processed automatically.',
                    issueUrl: issueResult.issueUrl
                };
            }
            
            // Strategy 4: Fallback to local storage with detailed instructions
            this.saveToLocalStorage(participantData);
            return {
                success: false,
                method: 'local_storage',
                message: 'Data saved locally. Please follow the manual submission instructions below.',
                showManualInstructions: true
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
                message: 'Data saved locally as fallback. Please copy the data manually.'
            };
        }
    }
    
    /**
     * Submit data via GitHub API (direct file creation)
     */
    async submitViaGitHubAPI(participantData) {
        try {
            const csvData = this.convertToCSV(participantData);
            const filename = this.generateFilename(participantData.participant_id);
            const content = btoa(csvData); // Base64 encode
            
            const response = await fetch(`${this.githubConfig.apiBase}/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/contents/data/${filename}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Add experiment data for participant ${participantData.participant_id}`,
                    content: content,
                    branch: 'main'
                })
            });
            
            if (response.ok) {
                return {
                    success: true,
                    method: 'github_api',
                    message: 'Data successfully committed to repository via GitHub API'
                };
            } else {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.warn('GitHub API submission failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Submit data via repository dispatch event (triggers GitHub Actions)
     */
    async submitViaRepositoryDispatch(participantData) {
        try {
            const csvData = this.convertToCSV(participantData);
            
            const response = await fetch(`${this.githubConfig.apiBase}/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/dispatches`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event_type: 'submit-experiment-data',
                    client_payload: {
                        participant_id: participantData.participant_id,
                        timestamp: participantData.timestamp,
                        csv_data: csvData,
                        total_earnings: participantData.summary?.total_earnings,
                        trust_pattern: participantData.summary?.trust_pattern,
                        completion_time: participantData.summary?.completion_time,
                        create_issue: 'false' // Set to true if you want notification issues
                    }
                })
            });
            
            if (response.ok || response.status === 204) {
                return {
                    success: true,
                    method: 'repository_dispatch',
                    message: 'Data submission triggered. It will be processed automatically by GitHub Actions.'
                };
            } else {
                throw new Error(`Repository dispatch error: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.warn('Repository dispatch submission failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Submit data by creating a GitHub issue
     */
    async submitViaGitHubIssue(participantData) {
        try {
            const issueBody = this.formatDataForIssue(participantData);
            
            const response = await fetch(`${this.githubConfig.apiBase}/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/issues`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: `Trust Game Data Submission - ${participantData.participant_id}`,
                    body: issueBody,
                    labels: ['data-submission', 'trust-game']
                })
            });
            
            if (response.ok) {
                const issue = await response.json();
                return {
                    success: true,
                    issueUrl: issue.html_url
                };
            } else {
                throw new Error(`GitHub Issues API error: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.warn('GitHub issue submission failed:', error);
            return { success: false, error: error.message };
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