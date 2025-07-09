<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$servername = "localhost"; $username = "root"; $password = ""; $dbname = "mancis_db";
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) { die("Connection failed: " . $conn->connect_error); }

$sql = "SELECT * FROM workOrders ORDER BY dueDate DESC";
$result = $conn->query($sql);

$output_array = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $row['id'] = intval($row['id']);
        $row['assetId'] = intval($row['assetId']);
        $row['assignedTo'] = intval($row['assignedTo']);
        // You might need to decode JSON fields if you store them as text in the DB
        // For example: $row['checklist'] = json_decode($row['checklist']);
        $output_array[] = $row;
    }
}
$conn->close();
echo json_encode($output_array);
?>