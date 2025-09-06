// Serverless function for GitHub data submission
// Deploy this to Netlify Functions, Vercel, or similar
// Environment variable required: GITHUB_TOKEN

exports.handler = async (event, context) => {
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': 'https://rempsyc.github.io',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { participant_id, csv_data, timestamp } = JSON.parse(event.body);
        
        if (!participant_id || !csv_data) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        const githubToken = process.env.GITHUB_TOKEN;
        if (!githubToken) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Server configuration error' })
            };
        }

        // Generate filename
        const now = new Date().toISOString().replace(/[:.]/g, '').replace('T', '_').slice(0, -1);
        const filename = `trust_game_data_${participant_id}_${now}.csv`;

        // Submit to GitHub API
        const githubResponse = await fetch(`https://api.github.com/repos/rempsyc/lab_copilot_demo_testing/contents/data/${filename}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add experiment data for participant ${participant_id}`,
                content: Buffer.from(csv_data).toString('base64'),
                branch: 'main'
            })
        });

        if (githubResponse.ok) {
            const result = await githubResponse.json();
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Data successfully submitted to repository',
                    filename,
                    download_url: result.content?.download_url
                })
            };
        } else {
            const error = await githubResponse.text();
            throw new Error(`GitHub API error: ${githubResponse.status} ${error}`);
        }

    } catch (error) {
        console.error('Submission error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to submit data',
                details: error.message
            })
        };
    }
};