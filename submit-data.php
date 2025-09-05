<?php
/**
 * GitHub Data Submission Proxy
 * 
 * This script provides a secure way to submit experiment data to GitHub
 * without exposing the GitHub token in client-side code.
 * 
 * To use this script:
 * 1. Deploy this file to a web server that supports PHP
 * 2. Set the GH_TOKEN environment variable with a personal access token
 * 3. Update the data-submitter.js to use this proxy endpoint
 * 
 * Required GitHub token permissions:
 * - Contents: Write (to create files in the repository)
 * - Metadata: Read (basic repository access)
 * 
 * For fine-grained tokens: scope to this repository only
 * For classic tokens: repo (full control of private repositories)
 */

// Set CORS headers to allow requests from GitHub Pages
header('Access-Control-Allow-Origin: https://rempsyc.github.io');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Check for GitHub token
$github_token = getenv('GH_TOKEN');
if (!$github_token) {
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration error: GitHub token not found']);
    exit;
}

// Get and validate request data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['participant_id']) || !isset($data['csv_data'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request data']);
    exit;
}

$participant_id = preg_replace('/[^a-zA-Z0-9_-]/', '', $data['participant_id']);
$csv_data = $data['csv_data'];
$timestamp = date('Ymd_His');
$filename = "trust_game_data_{$participant_id}_{$timestamp}.csv";

// GitHub API configuration
$github_owner = 'rempsyc';
$github_repo = 'lab_copilot_demo_testing';
$github_api_url = "https://api.github.com/repos/{$github_owner}/{$github_repo}/contents/data/{$filename}";

// Prepare GitHub API request
$github_data = [
    'message' => "Add experiment data for participant {$participant_id}",
    'content' => base64_encode($csv_data),
    'branch' => 'main'
];

$context = stream_context_create([
    'http' => [
        'method' => 'PUT',
        'header' => [
            'Authorization: token ' . $github_token,
            'Content-Type: application/json',
            'User-Agent: TrustGameDataSubmitter/1.0'
        ],
        'content' => json_encode($github_data)
    ]
]);

// Make request to GitHub API
$response = file_get_contents($github_api_url, false, $context);

if ($response === false) {
    $error = error_get_last();
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to submit data to GitHub',
        'details' => $error['message'] ?? 'Unknown error'
    ]);
    exit;
}

// Check response status
$response_data = json_decode($response, true);
if (isset($response_data['content'])) {
    // Success
    echo json_encode([
        'success' => true,
        'message' => 'Data successfully submitted to repository',
        'filename' => $filename,
        'download_url' => $response_data['content']['download_url'] ?? null
    ]);
} else {
    // Error
    http_response_code(500);
    echo json_encode([
        'error' => 'GitHub API error',
        'details' => $response_data['message'] ?? 'Unknown error'
    ]);
}
?>