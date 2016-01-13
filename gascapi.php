<?php

// git clone -b v1-master https://github.com/google/google-api-php-client.git

$vendor = __DIR__ . '/google-api-php-client/src/Google';
set_include_path(get_include_path() . PATH_SEPARATOR . $vendor);
require $vendor . '/autoload.php';

$pkg = json_decode(file_get_contents("package.json"));

$path = $pkg->config->config_dir;
$dir = new DirectoryIterator(dirname(__FILE__).DIRECTORY_SEPARATOR . $path);
foreach ($dir as $fileinfo) {
  if (!$fileinfo->isDot()) {
    $f = $path . DIRECTORY_SEPARATOR . $fileinfo->getFilename();
    if (endsWith($f, 'script.id')) { $scriptId = file_get_contents($f); }
    if (endsWith($f, 'auth_secret')) { $clientSecret = $f; }
  }
}

define('APPLICATION_NAME', "$pkg->description ({$pkg->name}-v{$pkg->version})");
define('SCRIPT_ID', "$scriptId");
define('CLIENT_SECRET', "$clientSecret");
define('CREDENTIAL_PATH', $pkg->config->credential_dir. DIRECTORY_SEPARATOR . str_replace('.', '-', basename(__FILE__)).'.json');
define('SCOPES', implode(' ', $pkg->config->scopes));

// print (SCRIPT_ID . "  ". CLIENT_SECRET . "  ". APPLICATION_NAME . "  ". CREDENTIAL_PATH . "  ". SCOPES);
// die;

if (php_sapi_name() != 'cli') {
  throw new Exception('This application must be run on the command line.');
}

function getClient() {
  $client = new Google_Client();
  $client->setApplicationName(APPLICATION_NAME);
  $client->setScopes(SCOPES);
  $client->setAuthConfigFile(CLIENT_SECRET);
  $client->setAccessType('offline');

  // Load previously authorized credentials from a file.
  $credentialsPath = expandHomeDirectory(CREDENTIAL_PATH);
  if (file_exists($credentialsPath)) {
    $accessToken = file_get_contents($credentialsPath);
  } else {
    // Request authorization from the user.
    $authUrl = $client->createAuthUrl();
    printf("Open the following link in your browser:\n\n\t%s\n\n", $authUrl);
    print 'Enter verification code: ';
    $authCode = trim(fgets(STDIN));

    // Exchange authorization code for an access token.
    $accessToken = $client->authenticate($authCode);

    // Store the credentials to disk.
    if(!file_exists(dirname($credentialsPath))) {
      mkdir(dirname($credentialsPath), 0700, true);
    }
    file_put_contents($credentialsPath, $accessToken);
    printf("Credentials saved to %s\n", $credentialsPath);
  }
  $client->setAccessToken($accessToken);

  // Refresh the token if it's expired.
  if ($client->isAccessTokenExpired()) {
    $client->refreshToken($client->getRefreshToken());
    file_put_contents($credentialsPath, $client->getAccessToken());
  }
  return $client;
}

function endsWith($haystack, $needle) {
  // search forward starting from end minus needle length characters
  return $needle === "" || (($temp = strlen($haystack) - strlen($needle)) >= 0 && strpos($haystack, $needle, $temp) !== FALSE);
}

/**
 * Expands the home directory alias '~' to the full path.
 * @param string $path the path to expand.
 * @return string the expanded path.
 */
function expandHomeDirectory($path) {
  $homeDirectory = getenv('HOME');
  if (empty($homeDirectory)) {
    $homeDirectory = getenv("HOMEDRIVE") . getenv("HOMEPATH");
  }
  return str_replace('~', realpath($homeDirectory), $path);
}

function isErrorResponse($response) {
  $result = false;
  if ($response->getError()) {
    $result = true;
    // Extract the first (and only) set of error details. The values of this
    // object are the script's 'errorMessage' and 'errorType', and an array of
    // stack trace elements.
    $error = $response->getError();
    $details = $error['details'][0];
    printf("Script error message: %s\n", $details['errorMessage']);

    if (array_key_exists('scriptStackTraceElements', $details)) {
      // There may not be a stacktrace if the script didn't start executing.
      print "Script error stacktrace:\n";
      foreach($details['scriptStackTraceElements'] as $trace) {
        printf("\t%s: %d\n", $trace['function'], $trace['lineNumber']);
      }
    }
  }
  return $result;
}

function createService() {
  // Get the API client and construct the service object.
  $client = getClient();
  return new Google_Service_Script($client);
}

function createRequest($name, $arguments) {
  // TODO: validate that arguments are an array
  $request = new Google_Service_Script_ExecutionRequest();
  $request->setFunction($name);
  $request->setParameters($arguments);
  return $request;
}

function execute($request, $callback) {
  $service = createService();
  try {
    $response = $service->scripts->run(SCRIPT_ID, $request);
    if (!isErrorResponse($response)) {
       return call_user_func_array($callback, array($response));
    }
  } catch (Exception $e) {
    // The API encountered a problem before the script started executing.
    echo 'Caught exception: ', $e->getMessage(), "\n";
  }
}

function encodeResult($response) {
  // The structure of the result will depend upon what the Apps Script function returns. 
  // var_dump($resp);
  $resp = $response->getResponse();
  $result = $resp['result'];
  return json_encode($result);
}

// -----------------
function getContactList($groupName) {
  $request = createRequest('getContactList', array('g' => $groupName));
  return execute($request, 'encodeResult');
}

function addContactToGroup($firstName,$lastName, $email, $groupName) {
  $request = createRequest('addContactToGroup', array('f' => $firstName, 'l' => $lastName, 'e' => $email, 'g' => $groupName ));
  return execute($request, 'encodeResult');
}

// -----------------
echo getContactList('2011 South Calgary Garden');

// function encode($response) { echo json_encode($response->getResponse()); }
// function noop($response) { echo ''; }
// $request = createRequest('mailToContact', array('e' => 'cmunky@uk2.net', 's' => 'Email Subject Here', 't' => 'Generic Template' ));
// execute($request, 'encode');
