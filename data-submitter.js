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
            // Strategy 1: Try server-side proxy (submit-data.php)
            const proxyResult = await this.submitViaProxy(participantData);
            if (proxyResult.success) {
                return proxyResult;
            }
            
            // Strategy 2: Try GitHub hosted solution (if available)
            const hostedResult = await this.submitViaHostedEndpoint(participantData);
            if (hostedResult.success) {
                return hostedResult;
            }
            
            // Fallback: Save locally with clear manual instructions
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
     * Note: This method cannot work from client-side without authentication
     */
    async submitViaGitHubAPI(participantData) {
        console.warn('GitHub API submission skipped: Client-side authentication not possible');
        return { 
            success: false, 
            error: 'GitHub API requires authentication not available in client-side code' 
        };
    }
    
    /**
     * Submit data via repository dispatch event (triggers GitHub Actions)
     * Note: This method cannot work from client-side without authentication
     */
    async submitViaRepositoryDispatch(participantData) {
        console.warn('Repository dispatch submission skipped: Client-side authentication not possible');
        return { 
            success: false, 
            error: 'Repository dispatch requires authentication not available in client-side code' 
        };
    }
    
    /**
     * Submit data via server-side proxy (PHP script or serverless function)
     */
    async submitViaProxy(participantData) {
        try {
            const csvData = this.convertToCSV(participantData);
            
            // Try different possible proxy URLs
            const proxyUrls = [
                '/.netlify/functions/submit-data', // Netlify function
                '/api/submit-data', // Vercel function
                'submit-data.php', // PHP script (same domain)
                './submit-data.php', // Relative path
                '/submit-data.php' // Root path
            ];
            
            for (const proxyUrl of proxyUrls) {
                try {
                    console.log(`Attempting data submission via: ${proxyUrl}`);
                    
                    const response = await fetch(proxyUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            participant_id: participantData.participant_id,
                            csv_data: csvData,
                            timestamp: participantData.timestamp
                        })
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                            return {
                                success: true,
                                method: 'server_proxy',
                                message: 'Data successfully submitted to GitHub repository via server proxy!',
                                details: result,
                                filename: result.filename
                            };
                        }
                    } else {
                        console.warn(`Proxy ${proxyUrl} returned ${response.status}: ${response.statusText}`);
                    }
                } catch (proxyError) {
                    console.warn(`Proxy attempt failed for ${proxyUrl}:`, proxyError.message);
                    continue; // Try next URL
                }
            }
            
            throw new Error('All proxy endpoints failed or are not available');
        } catch (error) {
            console.warn('Server proxy submission failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Submit data via GitHub Pages hosted endpoint (using GitHub Actions)
     */
    async submitViaHostedEndpoint(participantData) {
        // For now, this method is not implemented as GitHub's public APIs
        // require authentication for most operations
        console.warn('Hosted endpoint submission not implemented: Requires authenticated endpoints');
        return { 
            success: false, 
            error: 'Hosted endpoint not available - authentication required' 
        };
    }

    /**
     * Format participant data for public GitHub issue submission
     */
    formatDataForPublicIssue(data) {
        const csvData = this.convertToCSV(data);
        
        return `## 🔬 Trust Game Experiment Data Submission

**Participant ID:** \`${data.participant_id}\`  
**Timestamp:** ${data.timestamp}  
**Completion Time:** ${data.summary.completion_time || 'N/A'}  

### 📊 Summary Statistics
- **Total Earnings:** $${data.summary.total_earnings || 0}
- **Average Amount Sent:** $${(data.summary.average_amount_sent || 0).toFixed(2)}
- **Trust Pattern:** ${data.summary.trust_pattern || 'N/A'}

### 📋 Experiment Data

<details>
<summary>Click to view CSV data</summary>

\`\`\`csv
${csvData}
\`\`\`

</details>

### 🤖 Processing Instructions
This issue was automatically created by the Trust Game experiment. The CSV data above should be saved to the \`/data\` folder using the filename: \`trust_game_data_${data.participant_id}_${new Date().toISOString().replace(/[:.]/g, '').replace('T', '_').slice(0, -1)}.csv\`

To process this data:
1. Copy the CSV data from the code block above
2. Create a new file in the \`/data\` folder with the specified filename
3. Paste the CSV data and commit the file
4. Close this issue

---
*Automated submission from Trust Game experiment v${data.version}*`;
    }

    /**
     * Format participant data for GitHub issue submission
     */
    formatDataForIssue(data) {
        return this.formatDataForPublicIssue(data);
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