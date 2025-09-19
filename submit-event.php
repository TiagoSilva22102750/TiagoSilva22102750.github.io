<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$input = json_decode(file_get_contents("php://input"), true);

try {
    $conn = new mysqli("db.tecnico.ulisboa.pt", "ist1111187", "zisz0175", "ist1111187");

    $stmt = $conn->prepare("
        INSERT INTO events (
            user_id, file_name,
            start_position_left, end_position_left,
            start_position_right, end_position_right,
            interaction_log
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    $log = json_encode($input['interaction_log']);
    $stmt->bind_param(
        "sssssss",
        $input['user_id'],
        $input['file_name'],
        $input['start_position_left'],
        $input['end_position_left'],
        $input['start_position_right'],
        $input['end_position_right'],
        $log
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