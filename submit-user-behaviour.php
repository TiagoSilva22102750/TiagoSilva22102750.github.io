<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$input = json_decode(file_get_contents("php://input"), true);

try {
    $conn = new mysqli("db.tecnico.ulisboa.pt", "ist1111187", "zisz0175", "ist1111187");

    $stmt = $conn->prepare("
        INSERT INTO user_behaviour (
            user_id, visibilityCount
        ) VALUES (?, ?)
    ");

    $log = json_encode($input['interaction_log']);
    $stmt->bind_param(
        "ss",
        $input['user_id'],
        $input['visibilityCount']
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