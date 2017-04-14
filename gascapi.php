<?php

// git clone -b v1-master https://github.com/google/google-api-php-client.git

$vendor = __DIR__ . '/google-api-php-client/src/Google';
set_include_path(get_include_path() . PATH_SEPARATOR . $vendor);
require $vendor . '/autoload.php';

if (!$gascapi_config) {
  if (!$config_file) { $config_file = null; }
  $gascapi_config = configureFromConf($config_file);
  if (!$gascapi_config) {
     $gascapi_config = configureFromPackageJson();
  }
  if (!$gascapi_config) {
    throw new Exception('Could not find suitable application configuration');
  }
}

define('APPLICATION_NAME', $gascapi_config['name']);
define('SCRIPT_ID', $gascapi_config['script']);
define('CLIENT_SECRET', $gascapi_config['secret']);
define('CREDENTIAL_PATH', $gascapi_config['path']);
define('SCOPES', $gascapi_config['scopes']);

// print (SCRIPT_ID . "  ". CLIENT_SECRET . "  ". APPLICATION_NAME . "  ". CREDENTIAL_PATH . "  ". SCOPES);
// die;

function configureFromConf($filename) {
  $base = __DIR__ . DIRECTORY_SEPARATOR;
  $_gcontact = $base . '.gcontact' . DIRECTORY_SEPARATOR;
  $filename = is_null($filename) ? basename(__FILE__, '.php').'.conf' : $filename;
  $conf = json_decode(@file_get_contents($base . $filename)); // assumes local path !!
  if ($conf) {
    $result = array();
    $result['name'] = $conf->name;
    $result['script'] = $conf->script;
    $result['secret'] = $_gcontact . $conf->secret;
    $result['path'] = $_gcontact . str_replace('.', '-', basename(__FILE__)).'.token';
    $result['scopes'] = implode(' ', $conf->scopes);
  }
  return $result;
}

function configureFromPackageJson() {
  $base = __DIR__ . DIRECTORY_SEPARATOR;
  $_gcontact = $base . '.gcontact' . DIRECTORY_SEPARATOR;
  $pkg = json_decode(file_get_contents($base . "package.json"));

  $result = array();
  $result['name'] = "$pkg->description ({$pkg->name}-v{$pkg->version})";
  $result['script'] = $pkg->config->script;
  $result['secret'] = $base . $pkg->config->secret; // assumes local path
  $result['path'] = $_gcontact . str_replace('.', '-', basename(__FILE__)).'.token';
  $result['scopes'] = implode(' ', $pkg->config->scopes);
  return $result;
}

function requestUserAuthorization($client, $credentialsPath) {
  if (php_sapi_name() != 'cli') {
    throw new Exception('Run this module (gascapi.php) from the command line for user authorization.');
  }
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
  return $accessToken;
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
    $accessToken = requestUserAuthorization($client, $credentialsPath);
    /*printf("Open the following link in your browser:\n\n\t%s\n\n", $authUrl);
    print 'Enter verification code: ';
    $authCode = trim(fgets(STDIN));

    // Exchange authorization code for an access token.
    $accessToken = $client->authenticate($authCode);

    // Store the credentials to disk.
    if(!file_exists(dirname($credentialsPath))) {
      mkdir(dirname($credentialsPath), 0700, true);
    }
    file_put_contents($credentialsPath, $accessToken);
    printf("Credentials saved to %s\n", $credentialsPath);*/
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
    if (php_sapi_name() != 'cli') {
      printf("Script error message: %s\n", $details['errorMessage']);

      if (array_key_exists('scriptStackTraceElements', $details)) {
        // There may not be a stacktrace if the script didn't start executing.
        print "Script error stacktrace:\n";
        foreach($details['scriptStackTraceElements'] as $trace) {
          printf("\t%s: %d\n", $trace['function'], $trace['lineNumber']);
        }
      }
    } else {
      throw new Exception('Error occured in gascapi.php : '.json_encode($details));
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
  try {
    if ((!file_exists(CLIENT_SECRET)) || (filesize(CLIENT_SECRET) < 23)) {
      throw new Exception("auth_secret must exist and must not be empty", 404);
    }
    if ((!SCRIPT_ID) || strlen(SCRIPT_ID) < 42) {
      throw new Exception("script.id must exist and must not be empty ", 404);
    }
    $service = createService();
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
// echo getContactList('2016 SC Gardeners');
