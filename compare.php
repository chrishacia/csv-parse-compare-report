<?php
// save me from rewriting the same exit clause over and over, and allow me to control it from one spot
function endReq($msg = null) {
    echo json_encode(array());
    exit($msg);
}

// invalid request type
if($_SERVER['REQUEST_METHOD'] !== 'POST') {
    endReq('not post');
}

// expected parameter not set or empty
if(!isset($_POST['csv'])||empty($_POST['csv'])) {
    endReq('empty not set');
}

// expected parameter is set, but not the data format we are hoping for
// or count is 0 (which may be redundant with empty)
if(!is_array($_POST['csv'])) {
    endReq('not array');
}

// skipping the actual db, if I were to use a DB it'd like be mysql
// db.json contents into script
$dbJsonFile = file_get_contents("db.json");
// deconde the string into an associative array
$dbJson = json_decode($dbJsonFile, true);

// search over every entry in the db.json traversing down the children arrays.
function arrSearch($needle, $haystack, $id = null) {
    $output = array();
    // loop over the entire
    foreach($haystack as $key => $arr) {
        // uncomment below to get full details back to the UI
        // for different ui usage
        //$pushArr = $haystack[$key];
        $pushArrID = $id !== null ? $id : $haystack[$key]["id"];
        if(!is_array($arr)){
            // this isn't an array its a string, take a run over needle to compare
            foreach($needle as $item) {
                if( strpos(strtolower($arr), strtolower($item)) !== false ) {
                    array_push($output, $pushArrID);
                }
            }
            continue;
        }

        foreach($arr as $val) {
            // this value is an array within an array, callback over the function to treat as its own, needle/haystack
            // this way we could loop over nearly an endless amount of sub-arrays
            // pass the id used to retain the id of the parent object
            if(is_array($val)) {
                arrSearch($needle, $val, $pushArrID);
                continue;
            }

            // value was a string, check needle and see if there is matches
            foreach($needle as $item) {
                if( strpos(strtolower($val), strtolower($item)) !== false ) {
                    array_push($output, $pushArrID);
                }
            }
        }
    }
    // return the final output.
    // due to the way we search over the data set, this will return duplicate ID's
    // we want to make sure when returning data to the UI that all values are unique
    return array_unique($output);
}

// final output returns either an empty array or matches
echo json_encode(arrSearch($_POST['csv'], $dbJson));
?>
