<?php
/**
 * GoHighLevel API Proxy for SiteGround / PHP Hosting
 * Route: /api/* -> proxy.php?route=*
 */

// Enable CORS headers for frontend requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Authorization, Version, Content-Type, Accept');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. Parse GHL target endpoint path
$route = isset($_GET['route']) ? $_GET['route'] : '';

// Remove the proxy routing param so it's not forwarded to GHL
unset($_GET['route']);
$queryString = http_build_query($_GET);

// 2. Build GoHighLevel target URL
$targetUrl = 'https://services.leadconnectorhq.com/' . $route;
if (!empty($queryString)) {
    $targetUrl .= '?' . $queryString;
}

// 3. Extract and preserve authorization/version headers
$method = $_SERVER['REQUEST_METHOD'];
$headers = [];

// Get headers using standard server vars or Apache functions
$requestHeaders = [];
if (function_exists('apache_request_headers')) {
    $requestHeaders = apache_request_headers();
}

// Support fallback if Apache strips Authorization header
$authHeader = '';
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
} elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
} elseif (isset($requestHeaders['Authorization'])) {
    $authHeader = $requestHeaders['Authorization'];
}

if (!empty($authHeader)) {
    $headers[] = 'Authorization: ' . $authHeader;
}

// Grab API Version header
$versionHeader = '';
if (isset($_SERVER['HTTP_VERSION'])) {
    $versionHeader = $_SERVER['HTTP_VERSION'];
} elseif (isset($requestHeaders['Version'])) {
    $versionHeader = $requestHeaders['Version'];
}

if (!empty($versionHeader)) {
    $headers[] = 'Version: ' . $versionHeader;
}

$headers[] = 'Content-Type: application/json';

// 4. Initialize cURL call
$ch = curl_init($targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// Forward request body payload (for POST/PUT)
if ($method === 'POST' || $method === 'PUT') {
    $body = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

// 5. Send request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

if (curl_errno($ch)) {
    $error_msg = curl_error($ch);
    http_response_code(500);
    echo json_encode([
        'error' => 'Proxy Error',
        'message' => $error_msg
    ]);
} else {
    // 6. Output GHL Response
    http_response_code($httpCode);
    header('Content-Type: ' . ($contentType ? $contentType : 'application/json'));
    echo $response;
}

curl_close($ch);
