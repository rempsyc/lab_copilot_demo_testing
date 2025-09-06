// Trust Game Experiment for Center for Conflict and Cooperation
// Vanilla JavaScript Implementation

class TrustGameExperiment {
    constructor() {
        this.participantId = 'P' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        this.currentStep = 0;
        this.data = {
            participant_id: this.participantId,
            timestamp: new Date().toISOString(),
            experiment: 'trust_game',
            version: '1.0',
            demographics: {},
            trials: [],
            summary: {}
        };
        this.container = document.getElementById('content');
        this.totalRounds = 5;
        this.currentRound = 0;
        this.decisionStartTime = 0; // Initialize reaction time tracking
        this.dataSubmitter = new DataSubmitter(); // Initialize data submitter
        
        this.init();
    }
    
    init() {
        this.showWelcome();
    }
    
    showWelcome() {
        this.container.innerHTML = `
            <h1>Welcome to the Trust Game</h1>
            <p>Thank you for participating in this research study conducted by the <strong>Center for Conflict and Cooperation</strong>.</p>
            <div class="participant-info">
                <p>Your participant ID is: <strong>${this.participantId}</strong></p>
            </div>
            <div class="trust-scenario">
                <p>This experiment explores decision-making in social situations involving trust and cooperation. 
                   Your participation will help us understand how people make choices in interdependent situations.</p>
            </div>
            <div class="btn-group">
                <button class="btn" onclick="experiment.showInstructions()">Continue</button>
            </div>
        `;
    }
    
    showInstructions() {
        this.container.innerHTML = `
            <h2>Instructions</h2>
            <div class="trust-scenario">
                <p><strong>How the Trust Game works:</strong></p>
                <div class="instructions">
                    <ul>
                        <li>You start each round with <strong>$10</strong></li>
                        <li>You can choose to send some amount ($0, $5, or $10) to your partner</li>
                        <li>Any amount you send will be <strong>tripled</strong> before your partner receives it</li>
                        <li>Your partner can then choose to send some money back to you</li>
                        <li>Your final earnings = (money you kept) + (money partner sends back)</li>
                    </ul>
                </div>
            </div>
            
            <div class="trust-scenario">
                <h3>Example:</h3>
                <p>If you send $5:</p>
                <ul>
                    <li>You keep: $5</li>
                    <li>Partner receives: $5 × 3 = $15 (plus their original $10 = $25 total)</li>
                    <li>Partner might send back $0-$15 to you</li>
                    <li><strong>Your final earnings: $5 + (amount partner sends back)</strong></li>
                </ul>
            </div>
            
            <p style="text-align: center;">You will play this game for <strong>${this.totalRounds} rounds</strong> with different partners.</p>
            
            <div class="btn-group">
                <button class="btn" onclick="experiment.showDemographics()">I Understand - Continue</button>
            </div>
        `;
    }
    
    showDemographics() {
        this.container.innerHTML = `
            <h2>Background Information</h2>
            <p>Please provide some basic information about yourself (all fields optional):</p>
            
            <div class="form-group">
                <label for="age">What is your age? (optional)</label>
                <input type="number" id="age" min="18" max="100">
            </div>
            
            <div class="form-group">
                <label for="gender">What is your gender? (optional)</label>
                <input type="text" id="gender">
            </div>
            
            <div class="form-group">
                <label for="field">What is your field of study or profession? (optional)</label>
                <input type="text" id="field">
            </div>
            
            <div class="btn-group">
                <button class="btn" onclick="experiment.saveDemographics()">Start Experiment</button>
            </div>
        `;
    }
    
    saveDemographics() {
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;
        const field = document.getElementById('field').value;
        
        this.data.demographics = {
            age: age ? parseInt(age) : null,
            gender: gender || 'Not specified',
            field: field || 'Not specified'
        };
        
        this.currentRound = 1;
        this.showTrustDecision();
    }
    
    showTrustDecision() {
        const progress = (this.currentRound - 1) / this.totalRounds * 100;
        
        // Record the start time for reaction time calculation
        this.decisionStartTime = Date.now();
        
        this.container.innerHTML = `
            <h2>Round ${this.currentRound} of ${this.totalRounds}</h2>
            
            <div class="progress">
                <div class="progress-bar" style="width: ${progress}%"></div>
            </div>
            
            <div class="monetary-display">You have $10</div>
            
            <div class="trust-scenario">
                <p>You are now paired with <strong>Partner ${this.currentRound}</strong>.</p>
                <p>How much money would you like to send to your partner?</p>
                <p><em>Remember: Any amount you send will be tripled!</em></p>
            </div>
            
            <div class="btn-group">
                <button class="btn" onclick="experiment.makeDecision(0)">Send $0<br>(Keep $10)</button>
                <button class="btn" onclick="experiment.makeDecision(5)">Send $5<br>(Keep $5)</button>
                <button class="btn" onclick="experiment.makeDecision(10)">Send $10<br>(Keep $0)</button>
            </div>
        `;
    }
    
    makeDecision(amountSent) {
        // Calculate reaction time from when the decision screen was shown
        const reactionTime = Date.now() - this.decisionStartTime;
        
        // Simulate partner response (different personalities for each round)
        const returnRates = [0.3, 0.6, 0.1, 0.8, 0.4]; // Different partner personalities
        const partnerReceived = amountSent * 3 + 10;
        const amountReturned = Math.floor(amountSent * 3 * returnRates[this.currentRound - 1]);
        const finalEarnings = (10 - amountSent) + amountReturned;
        
        const trialData = {
            round: this.currentRound,
            amount_sent: amountSent,
            amount_kept: 10 - amountSent,
            partner_received: partnerReceived,
            amount_returned: amountReturned,
            final_earnings: finalEarnings,
            return_rate: returnRates[this.currentRound - 1],
            timestamp: new Date().toISOString(),
            reaction_time: reactionTime
        };
        
        this.data.trials.push(trialData);
        this.showFeedback(trialData);
    }
    
    showFeedback(trialData) {
        this.container.innerHTML = `
            <h2>Round ${this.currentRound} Results</h2>
            
            <div class="results-display">
                <p>You sent: <strong>$${trialData.amount_sent}</strong></p>
                <p>You kept: <strong>$${trialData.amount_kept}</strong></p>
                <p>Partner received: <strong>$${trialData.partner_received}</strong></p>
                <p>Partner sent back: <strong>$${trialData.amount_returned}</strong></p>
                <div class="monetary-display">Your earnings this round: $${trialData.final_earnings}</div>
            </div>
            
            ${this.currentRound < this.totalRounds ? 
                '<div class="btn-group"><button class="btn" onclick="experiment.nextRound()">Continue to Next Round</button></div>' :
                '<div class="btn-group"><button class="btn" onclick="experiment.showFinalResults()">View Final Results</button></div>'
            }
        `;
    }
    
    nextRound() {
        this.currentRound++;
        this.showTrustDecision();
    }
    
    showFinalResults() {
        const totalEarnings = this.data.trials.reduce((sum, trial) => sum + trial.final_earnings, 0);
        const avgSent = this.data.trials.reduce((sum, trial) => sum + trial.amount_sent, 0) / this.data.trials.length;
        const trustPattern = this.analyzeTrustPattern();
        
        this.data.summary = {
            total_earnings: totalEarnings,
            average_amount_sent: avgSent,
            trust_pattern: trustPattern,
            completion_time: new Date().toISOString()
        };

        // Automatically submit data to repository
        this.submitDataToRepository();
        
        this.container.innerHTML = `
            <h1>Experiment Complete!</h1>
            
            <div class="results-display">
                <h2>Your Final Results</h2>
                <div class="monetary-display">Total Earnings: $${totalEarnings}</div>
                <p><strong>Average amount sent per round:</strong> $${avgSent.toFixed(2)}</p>
                <p><strong>Trust pattern:</strong> ${trustPattern}</p>
                
                <h3>Round-by-round breakdown:</h3>
                <div style="text-align: left; margin: 20px 0;">
                    ${this.data.trials.map(trial => 
                        `<p>Round ${trial.round}: Sent $${trial.amount_sent} → Earned $${trial.final_earnings}</p>`
                    ).join('')}
                </div>
            </div>
            
            <div class="trust-scenario">
                <h3>Thank you for participating!</h3>
                <p>Your data contributes to research on trust, cooperation, and conflict resolution 
                   at the Center for Conflict and Cooperation.</p>
                <div id="data-submission-status" class="participant-info">
                    <p>📤 Submitting your data to repository...</p>
                </div>
            </div>
            
            <div class="participant-info">
                <p>Your data has been saved with ID: <strong>${this.participantId}</strong></p>
            </div>
            
            <div class="btn-group">
                <button class="btn" onclick="experiment.downloadData()">Download Data (JSON)</button>
                <button class="btn" onclick="experiment.downloadDataCSV()">Download Data (CSV)</button>
                <button class="btn" onclick="experiment.restart()">Restart Experiment</button>
            </div>
        `;
    }
    
    analyzeTrustPattern() {
        const amounts = this.data.trials.map(trial => trial.amount_sent);
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        
        if (avgAmount >= 8) return "High Trust";
        if (avgAmount >= 5) return "Moderate Trust";
        if (avgAmount >= 2) return "Low Trust";
        return "Very Low Trust";
    }
    
    downloadData() {
        const jsonData = JSON.stringify(this.data, null, 2);
        const blob = new Blob([jsonData], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `trust_game_data_${this.participantId}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'success';
        successMsg.textContent = 'JSON data downloaded successfully!';
        this.container.appendChild(successMsg);
        
        setTimeout(() => {
            if (successMsg.parentNode) {
                successMsg.parentNode.removeChild(successMsg);
            }
        }, 3000);
    }

    downloadDataCSV() {
        const csvData = this.convertToCSV();
        const blob = new Blob([csvData], {type: 'text/csv'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `trust_game_data_${this.participantId}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'success';
        successMsg.textContent = 'CSV data downloaded successfully!';
        this.container.appendChild(successMsg);
        
        setTimeout(() => {
            if (successMsg.parentNode) {
                successMsg.parentNode.removeChild(successMsg);
            }
        }, 3000);
    }

    convertToCSV() {
        // Define CSV headers
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
        
        // Create CSV rows - one per trial
        const rows = this.data.trials.map(trial => [
            this.data.participant_id,
            this.data.experiment,
            this.data.version,
            this.data.timestamp,
            this.data.demographics.age || '',
            this.data.demographics.gender || '',
            this.data.demographics.field || '',
            trial.round,
            trial.amount_sent,
            trial.amount_kept,
            trial.partner_received,
            trial.amount_returned,
            trial.final_earnings,
            trial.return_rate,
            trial.timestamp,
            trial.reaction_time,
            this.data.summary.total_earnings || '',
            this.data.summary.average_amount_sent || '',
            this.data.summary.trust_pattern || '',
            this.data.summary.completion_time || ''
        ]);
        
        // Combine headers and rows
        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
            
        return csvContent;
    }

    async submitDataToRepository() {
        try {
            const result = await this.dataSubmitter.submitData(this.data);
            const statusElement = document.getElementById('data-submission-status');
            
            if (result.success) {
                let successMessage = `
                    <p>✅ <strong>Data Successfully Saved!</strong></p>
                `;
                
                if (result.method === 'osf_datapipe') {
                    successMessage = `
                        <p>✅ <strong>Data Submitted to OSF DataPipe!</strong></p>
                        <p>Your data has been securely saved to the Open Science Framework.</p>
                        <div class="osf-details">
                            <p><strong>Session ID:</strong> <code>${result.sessionId || 'N/A'}</code></p>
                            <p><strong>Experiment ID:</strong> <code>${result.experimentId || 'N/A'}</code></p>
                            <p><small>Your data is now part of the open science research database.</small></p>
                        </div>
                    `;
                } else if (result.method === 'github_issue') {
                    successMessage = `
                        <p>✅ <strong>Data Submitted Successfully!</strong></p>
                        <p>Your data has been submitted via GitHub issue and will be processed automatically.</p>
                        ${result.issueUrl ? `<p><a href="${result.issueUrl}" target="_blank">View submission details</a></p>` : ''}
                    `;
                } else if (result.method === 'repository_dispatch') {
                    successMessage = `
                        <p>✅ <strong>Data Submission Triggered!</strong></p>
                        <p>Your data is being processed automatically and will be saved to the repository shortly.</p>
                    `;
                } else if (result.method === 'server_proxy') {
                    successMessage = `
                        <p>✅ <strong>Data Saved to Repository!</strong></p>
                        <p>Your data has been automatically saved to the repository's data folder.</p>
                    `;
                }
                
                statusElement.innerHTML = successMessage;
                statusElement.className = 'success-message';
                
            } else {
                let errorMessage = `
                    <p>⚠️ <strong>Data Saved Locally</strong></p>
                    <p>OSF DataPipe unavailable. Your data has been saved locally for download.</p>
                `;
                
                errorMessage += `
                    <div class="download-section">
                        <h4>📥 Download Your Data:</h4>
                        <p>Click the button below to download your experiment data as a CSV file:</p>
                        <button class="btn btn-primary" onclick="experiment.downloadDataCSV()" style="margin: 10px; padding: 12px 24px; font-size: 16px;">📄 Download CSV File</button>
                    </div>
                `;
                
                statusElement.innerHTML = errorMessage;
                statusElement.className = 'warning-message';
            }
        } catch (error) {
            console.error('Error submitting data:', error);
            const statusElement = document.getElementById('data-submission-status');
            statusElement.innerHTML = `
                <p>❌ <strong>Error Saving Data</strong></p>
                <p>Please download your data manually using the button below.</p>
                <div class="download-section">
                    <h4>📥 Download Your Data:</h4>
                    <button class="btn btn-primary" onclick="experiment.downloadDataCSV()" style="margin: 10px; padding: 12px 24px; font-size: 16px;">📄 Download CSV File</button>
                </div>
            `;
            statusElement.className = 'error-message';
        }
    }

    copyDataToClipboard() {
        const csvData = this.convertToCSV();
        navigator.clipboard.writeText(csvData).then(() => {
            this.showToast('✅ CSV data copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy data:', err);
            alert('Failed to copy data to clipboard. Please select and copy the text manually.');
        });
    }

    copyOSFData() {
        // Format data for OSF DataPipe manual submission
        const osfData = {
            experimentID: 'trust_game_ccc_2024',
            sessionID: `session_${this.participantId}`,
            data: this.data.trials.map((trial, index) => ({
                experiment_id: 'trust_game_ccc_2024',
                session_id: `session_${this.participantId}`,
                participant_id: this.data.participant_id,
                trial_index: index,
                trial_type: 'trust-game-trial',
                round: trial.round,
                amount_sent: trial.amount_sent,
                amount_kept: trial.amount_kept,
                partner_received: trial.partner_received,
                amount_returned: trial.amount_returned,
                final_earnings: trial.final_earnings,
                return_rate: trial.return_rate,
                reaction_time: trial.reaction_time,
                trial_timestamp: trial.timestamp,
                participant_age: this.data.demographics.age,
                participant_gender: this.data.demographics.gender,
                participant_field: this.data.demographics.field,
                experiment_version: this.data.version,
                experiment_name: this.data.experiment,
                participant_timestamp: this.data.timestamp,
                total_earnings: this.data.summary.total_earnings,
                average_amount_sent: this.data.summary.average_amount_sent,
                trust_pattern: this.data.summary.trust_pattern,
                completion_time: this.data.summary.completion_time
            }))
        };
        
        const jsonData = JSON.stringify(osfData, null, 2);
        navigator.clipboard.writeText(jsonData).then(() => {
            this.showToast('✅ OSF data copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy OSF data:', err);
            alert('Failed to copy OSF data to clipboard. Please select and copy the text manually.');
        });
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('✅ Copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy text:', err);
            alert('Failed to copy to clipboard. Please copy manually: ' + text);
        });
    }

    copyFilename() {
        const filename = this.dataSubmitter.generateFilename(this.participantId);
        navigator.clipboard.writeText(filename).then(() => {
            this.showToast('✅ Filename copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy filename:', err);
            alert('Failed to copy filename to clipboard. Please copy it manually.');
        });
    }

    downloadCSV() {
        const csvData = this.convertToCSV();
        const filename = this.dataSubmitter.generateFilename(this.participantId);
        
        // Create a blob with the CSV data
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        
        // Create a download link
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showToast('✅ CSV file downloaded!');
        } else {
            // Fallback for browsers that don't support download attribute
            alert('Download not supported. Please copy the CSV data manually.');
        }
    }

    copyText(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('✅ Copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy text:', err);
            alert('Failed to copy to clipboard. Please copy manually: ' + text);
        });
    }

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            z-index: 1000;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
    
    restart() {
        if (confirm('Are you sure you want to restart the experiment? This will clear all current data.')) {
            this.data.trials = [];
            this.currentRound = 0;
            this.currentStep = 0;
            this.showWelcome();
        }
    }
}

// Initialize the experiment when the page loads
let experiment;
document.addEventListener('DOMContentLoaded', function() {
    experiment = new TrustGameExperiment();
});