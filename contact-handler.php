<?php
/**
 * Contact form handler for johnacharles.co
 * Uses PHP's built-in mail() function — works on standard GoDaddy Linux
 * hosting with no third-party service or API key required.
 */

header('Content-Type: application/json');

// Only allow requests from this site
header('Access-Control-Allow-Origin: https://johnacharles.co');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Where submissions get sent
$recipient = 'johnacharles93@gmail.com';

$name    = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$email   = isset($_POST['email']) ? trim(strip_tags($_POST['email'])) : '';
$message = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';
$botField = isset($_POST['bot-field']) ? trim($_POST['bot-field']) : '';

// Honeypot — if this hidden field got filled in, it's a bot. Pretend success,
// discard silently, so bots don't learn the field is being checked.
if ($botField !== '') {
    echo json_encode(['success' => true]);
    exit;
}

if ($name === '' || $email === '' || $message === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

$subject = "New project inquiry from $name";
$body = "$message\r\n\r\n— $name ($email)";

// Reply-To is the visitor's address so you can just hit "Reply" in your inbox.
// From must be a johnacharles.co address for best deliverability with GoDaddy mail.
$headers  = "From: Website Contact Form <no-reply@johnacharles.co>\r\n";
$headers .= "Reply-To: $name <$email>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

$sent = mail($recipient, $subject, $body, $headers);

if ($sent) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'mail() failed to send.']);
}
