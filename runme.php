<?php

date_default_timezone_set('America/Edmonton');

require_once './gascapi.php';

$season = 2016; // ???

print getContactList("$season Wait List");

print addContactToGroup('Random', 'Dude', 'random.dude@example.net', "$season SC Gardeners");

?>