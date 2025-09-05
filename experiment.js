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
            <p>Please provide some basic information about yourself:</p>
            
            <div class="form-group">
                <label for="age">What is your age?</label>
                <input type="number" id="age" min="18" max="100" required>
            </div>
            
            <div class="form-group">
                <label for="gender">What is your gender? (optional)</label>
                <input type="text" id="gender">
            </div>
            
            <div class="form-group">
                <label for="field">What is your field of study or profession? (optional)</label>
                <input type="text" id="field">
            </div>
            
            <div id="error-msg" class="error hidden">Please enter your age to continue.</div>
            
            <div class="btn-group">
                <button class="btn" onclick="experiment.saveDemographics()">Start Experiment</button>
            </div>
        `;
    }
    
    saveDemographics() {
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;
        const field = document.getElementById('field').value;
        
        if (!age || age < 18) {
            document.getElementById('error-msg').classList.remove('hidden');
            return;
        }
        
        this.data.demographics = {
            age: parseInt(age),
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
                statusElement.innerHTML = `
                    <p>✅ <strong>Data Successfully Saved!</strong></p>
                    <p>Your data has been automatically saved to the repository's data folder.</p>
                `;
                statusElement.className = 'success-message';
            } else {
                statusElement.innerHTML = `
                    <p>⚠️ <strong>Data Saved Locally</strong></p>
                    <p>Your data has been saved locally. Please copy the CSV data below and submit manually:</p>
                    <div class="data-copy-area">
                        <p><strong>Filename:</strong> ${this.dataSubmitter.generateFilename(this.participantId)}</p>
                        <textarea readonly style="width: 100%; height: 200px; font-family: monospace; font-size: 12px;">${this.convertToCSV()}</textarea>
                        <button class="btn" onclick="experiment.copyDataToClipboard()">Copy CSV Data</button>
                    </div>
                `;
                statusElement.className = 'warning-message';
            }
        } catch (error) {
            console.error('Error submitting data:', error);
            const statusElement = document.getElementById('data-submission-status');
            statusElement.innerHTML = `
                <p>❌ <strong>Error Saving Data</strong></p>
                <p>Please download your data manually using the buttons below.</p>
            `;
            statusElement.className = 'error-message';
        }
    }

    copyDataToClipboard() {
        const csvData = this.convertToCSV();
        navigator.clipboard.writeText(csvData).then(() => {
            alert('CSV data copied to clipboard! You can now paste it into a file.');
        }).catch(err => {
            console.error('Failed to copy data:', err);
            alert('Failed to copy data to clipboard. Please select and copy the text manually.');
        });
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