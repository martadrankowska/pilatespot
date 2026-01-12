<?php
/**
 * PilateSpot — Obsługa wysyłania emaili z formularza kontaktu
 * 
 * Ten plik obsługuje POST request z formularza i wysyła dwa emaile:
 * 1. Email do klienta (podziękowanie)
 * 2. Email do właściciela studia (powiadomienie)
 */

header('Content-Type: application/json; charset=utf-8');

// Załaduj konfigurację
require_once __DIR__ . '/config.php';

// Załaduj PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/PHPMailer/src/Exception.php';
require_once __DIR__ . '/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/src/SMTP.php';

// Zdefiniuj odpowiedzi
$response = [
    'success' => false,
    'message' => '',
    'errors' => []
];

try {
    // ==================== WALIDACJA ====================
    
    // Sprawdź, czy request jest POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Metoda żądania nie jest wspierana. Użyj POST.');
    }
    
    // Pobierz dane z formularza - spróbuj zarówno $_POST jak i JSON
    $name = '';
    $email = '';
    $message = '';
    
    // Jeśli to form data
    if (!empty($_POST)) {
        $name = isset($_POST['name']) ? trim($_POST['name']) : '';
        $email = isset($_POST['email']) ? trim($_POST['email']) : '';
        $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    }
    
    // Jeśli to JSON (axios, fetch z JSON)
    if (empty($name) && empty($email) && empty($message)) {
        $json = file_get_contents('php://input');
        if (!empty($json)) {
            $data = json_decode($json, true);
            if ($data) {
                $name = isset($data['name']) ? trim($data['name']) : '';
                $email = isset($data['email']) ? trim($data['email']) : '';
                $message = isset($data['message']) ? trim($data['message']) : '';
            }
        }
    }
    
    // Debug - wyświetl co otrzymaliśmy
    error_log('Received data - Name: ' . $name . ', Email: ' . $email . ', Message length: ' . strlen($message));
    
    // Walidacja - nazwa
    if (empty($name)) {
        $response['errors'][] = 'Imię jest wymagane.';
    } elseif (strlen($name) < 2) {
        $response['errors'][] = 'Imię musi mieć co najmniej 2 znaki.';
    } elseif (strlen($name) > 100) {
        $response['errors'][] = 'Imię nie może mieć więcej niż 100 znaków.';
    }
    
    // Walidacja - email
    if (empty($email)) {
        $response['errors'][] = 'Email jest wymagany.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['errors'][] = 'Email jest nieprawidłowy.';
    }
    
    // Walidacja - wiadomość
    if (empty($message)) {
        $response['errors'][] = 'Wiadomość jest wymagana.';
    } elseif (strlen($message) < 10) {
        $response['errors'][] = 'Wiadomość musi mieć co najmniej 10 znaków.';
    } elseif (strlen($message) > MAX_MESSAGE_LENGTH) {
        $response['errors'][] = 'Wiadomość nie może mieć więcej niż ' . MAX_MESSAGE_LENGTH . ' znaków.';
    }
    
    // Jeśli są błędy walidacji
    if (!empty($response['errors'])) {
        http_response_code(400);
        $response['message'] = 'Proszę poprawić błędy w formularzu.';
        echo json_encode($response);
        exit;
    }
    
    // ==================== WYSYŁANIE EMAILI ====================
    
    // Inicjalizuj PHPMailer
    $mail = new PHPMailer(PHPMAILER_DEBUG);
    
    // Ustawienia SMTP
    $mail->isSMTP();
    $mail->Host = PHPMAILER_HOST;
    $mail->Port = PHPMAILER_PORT;
    $mail->SMTPAuth = PHPMAILER_SMTP_AUTH;
    $mail->SMTPSecure = PHPMAILER_SMTP_SECURE;
    $mail->Username = PHPMAILER_USERNAME;
    $mail->Password = PHPMAILER_PASSWORD;
    
    // Kodowanie
    $mail->CharSet = 'UTF-8';
    
    // Adres nadawcy
    $mail->setFrom(PHPMAILER_FROM_EMAIL, PHPMAILER_FROM_NAME);
    
    // ==================== EMAIL 1: DO KLIENTA ====================
    
    $mail->ClearAddresses();
    $mail->addAddress($email, $name);
    
    $mail->Subject = '✨ Dziękujemy za kontakt! — PilateSpot';
    $mail->isHTML(true);
    
    // Załaduj szablon emaila dla klienta
    $customerTemplate = file_get_contents(__DIR__ . '/email_templates/customer-template.html');
    $mail->Body = str_replace(
        ['{name}', '{message}'],
        [$name, htmlspecialchars($message)],
        $customerTemplate
    );
    
    // Wersja tekstowa (fallback)
    $mail->AltBody = "Cześć $name,\n\nDziękujemy za wiadomość! Oddzwonimy do Ciebie wkrótce.\n\nPozdrawiamy,\nZespół PilateSpot";
    
    // Wyślij email do klienta
    if (!$mail->send()) {
        throw new Exception('Nie udało się wysłać emaila do Ciebie: ' . $mail->ErrorInfo);
    }
    
    // ==================== EMAIL 2: DO WŁAŚCICIELA ====================
    
    $mail->ClearAddresses();
    $mail->addAddress(OWNER_EMAIL, OWNER_NAME);
    $mail->addAddress(PHPMAILER_ADDITIONAL_GMAIL);
    
    $mail->Subject = '📧 Nowa wiadomość z formularza kontaktu — ' . $name;
    
    // Załaduj szablon emaila dla właściciela
    $ownerTemplate = file_get_contents(__DIR__ . '/email_templates/owner-template.html');
    $mail->Body = str_replace(
        ['{name}', '{email}', '{message}', '{date}'],
        [$name, $email, nl2br(htmlspecialchars($message)), date('d.m.Y o H:i')],
        $ownerTemplate
    );
    
    // Wersja tekstowa (fallback)
    $mail->AltBody = "Nowa wiadomość z formularza kontaktu:\n\nImię: $name\nEmail: $email\nWiadomość:\n$message\n\nData: " . date('d.m.Y o H:i');
    
    // Wyślij email do właściciela
    if (!$mail->send()) {
        throw new Exception('Nie udało się wysłać powiadomienia do właściciela: ' . $mail->ErrorInfo);
    }
    
    // ==================== SUKCES ====================
    
    $response['success'] = true;
    $response['message'] = 'Dziękujemy! Wiadomość została wysłana. Odezwiemy się do Ciebie wkrótce.';
    http_response_code(200);
    
} catch (Exception $e) {
    // ==================== BŁĄD ====================
    
    http_response_code(500);
    $response['message'] = 'Coś poszło nie tak. Spróbuj ponownie później.';
    $response['errors'][] = $e->getMessage();
    
    // Log błędu (opcjonalnie)
    error_log('[PilateSpot] Email Error: ' . $e->getMessage());
}

// Wyślij odpowiedź JSON
echo json_encode($response);
exit;
?>
