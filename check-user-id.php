<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$input = json_decode(file_get_contents("php://input"), true);
$user_id = $input['user_id'] ?? null;

try {
    $conn = new mysqli("db.tecnico.ulisboa.pt", "ist1111187", "zisz0175", "ist1111187");

    $stmt = $conn->prepare("SELECT 1 FROM users WHERE user_id = ? LIMIT 1");
    $stmt->bind_param("s", $user_id);
    $stmt->execute();
    $stmt->store_result();

    $exists = $stmt->num_rows > 0;

    echo json_encode(["exists" => $exists]);

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}