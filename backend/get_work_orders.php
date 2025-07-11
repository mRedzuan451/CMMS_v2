<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$servername = "localhost"; $username = "root"; $password = ""; $dbname = "mancis_db";
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) { die("Connection failed: " . $conn->connect_error); }

$sql = "SELECT * FROM workorders ORDER BY dueDate DESC";
$result = $conn->query($sql);

$output_array = array();
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $row['id'] = intval($row['id']);
        $row['assetId'] = intval($row['assetId']);
        $row['assignedTo'] = intval($row['assignedTo']);
        
        // Decode JSON fields from text into arrays
        $row['checklist'] = json_decode($row['checklist'], true); // true for associative array
        $row['requiredParts'] = json_decode($row['requiredParts'], true);

        // Ensure they are arrays even if null/empty
        if (!is_array($row['checklist'])) {
            $row['checklist'] = [];
        }
        if (!is_array($row['requiredParts'])) {
            $row['requiredParts'] = [];
        }

        $output_array[] = $row;
    }
}
$conn->close();
echo json_encode($output_array);
?>