<?php

require_once 'gascapi.php';

function encode($response) { echo json_encode($response->getResponse()); }
function noop($response) { echo ''; }

// TODO: This is just snippets... needs to put in some kind of runner that can exercised the endpoint...

$request = createRequest('mailToContact', array('e' => 'cmunky@uk2.net', 's' => 'Email Subject Here', 't' => 'Generic Template' ));

$request = createRequest('getGroup', array('e' => 'cmunky@uk2.net'));

$request = createRequest('getContactList', array('g' => 'cmunky@uk2.net'));

$request = createRequest('getEmailForId', array('i' => 'invalid-string-of-values-for-an-id'));

$request = createRequest('getEmailForId', array('i' => '5ae2597c0e0558a9'));

addContactToGroup( 'foo', 'bar', 'foo@bar.com', '2008 Random Location Garden');

$request = createRequest('addGroup', array('g' => '2008 Random Location Garden'));

execute($request, 'encode');
