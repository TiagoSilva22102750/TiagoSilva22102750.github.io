<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$input = json_decode(file_get_contents("php://input"), true);

try {
    $conn = new mysqli("db.tecnico.ulisboa.pt", "ist1111187", "zisz0175", "ist1111187");

    $stmt = $conn->prepare("INSERT INTO users (user_id) VALUES (?)");
    $stmt->bind_param("s", $input['user_id']);

    $stmt->execute();
    $inserted_id = $stmt->insert_id;

    echo json_encode(["status" => "success", "inserted_id" => $inserted_id]);

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}