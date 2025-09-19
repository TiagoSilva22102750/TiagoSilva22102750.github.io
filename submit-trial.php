<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON"]);
    http_response_code(400);
    exit;
}

try {
    $conn = new mysqli("db.tecnico.ulisboa.pt", "ist1111187", "zisz0175", "ist1111187");

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    $stmt = $conn->prepare("
        INSERT INTO trials (
            user_id, file_name, slope, timespent,
            start_position_left, end_position_left,
            start_position_right, end_position_right
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->bind_param(
        "ssssssss",
        $input['user_id'],
        $input['file_name'],
        $input['slope'],
        $input['timespent'],
        $input['start_position_left'],
        $input['end_position_left'],
        $input['start_position_right'],
        $input['end_position_right']
    );

    $stmt->execute();
    $inserted_id = $stmt->insert_id;

    echo json_encode(["status" => "success", "inserted_id" => $inserted_id]);

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}