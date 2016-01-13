
// TODO: This is mostly just the quickstart.... 
// not sure how the node/js flavor of this interface will be used

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

var CLIENT_SECRET, SCRIPT_ID, APPLICATION_NAME, CREDENTIAL_PATH, CREDENTIAL_DIR, SCOPES;
CLIENT_SECRET = SCRIPT_ID = APPLICATION_NAME = CREDENTIAL_PATH = CREDENTIAL_DIR = SCOPES = undefined;

function loadConfiguration(callback) {
  fs.readFile('package.json', function(err, content) {
    if (err) {
      console.log('Error loading package.json: ' + err);
      return;
    }

    var pkg = JSON.parse(content);
    var path = pkg.config.config_dir;

    APPLICATION_NAME = pkg.description.concat(' (', pkg.name, '-v',  pkg.version, ')');
    CREDENTIAL_DIR = pkg.config.credential_dir;
    CREDENTIAL_PATH = CREDENTIAL_DIR.concat('/', module.filename.split('/').pop().replace('.', '-'), '.json');
    SCOPES = pkg.config.scopes;

    fs.readdir( path, function( err, files ) {
      if( err ) {
        console.error( "Could not list the directory.", err );
        return;
      } 

      files.forEach( function( file ) {
        file = path.concat('/', file);
        if (file.endsWith('script.id')) {
          SCRIPT_ID = fs.readFileSync(file).toString('UTF-8');
        }
        if (file.endsWith('auth_secret')) {
          CLIENT_SECRET = file;
        }
      });

      // console.log(SCRIPT_ID, CLIENT_SECRET, APPLICATION_NAME, CREDENTIAL_DIR, CREDENTIAL_PATH, SCOPES);
      // process.exit();
      callback();
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(CREDENTIAL_DIR);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(CREDENTIAL_PATH, JSON.stringify(token));
  console.log('Token stored to ' + CREDENTIAL_PATH);
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(CREDENTIAL_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

function execMethod(auth, name, params, callback) {
  var script = google.script('v1');
  var request = {};
  request.function = name;
  if(params) {
    // TODO: Ensure params is an array...
    request.parameters = params;
  }

  // Make the API request. The request object is included here as 'resource'.
  script.scripts.run({
    auth: auth,
    resource: request,
    scriptId: SCRIPT_ID
  }, function(err, resp) {
    if (err) {
      // The API encountered a problem before the script started executing.
      console.log('The API returned an error: ' + JSON.stringify(err));
      return;
    }
    if (resp.error) {
      // The API executed, but the script returned an error.
      // Extract the first (and only) set of error details. The values of this
      // object are the script's 'errorMessage' and 'errorType', and an array
      // of stack trace elements.
      var error = resp.error.details[0];
      console.log('Script error message: ' + error.errorMessage);
      console.log('Script error stacktrace:');

      if (error.scriptStackTraceElements) {
        // There may not be a stacktrace if the script didn't start executing.
        for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
          var trace = error.scriptStackTraceElements[i];
          console.log('\t%s: %s', trace.function, trace.lineNumber);
        }
      }
    } else {
      callback(resp);
    }

  });
}

function onConfigLoaded() {
  // Load client secrets from a local file.
  fs.readFile(CLIENT_SECRET, function(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the Google Apps Script Execution API.
    authorize(JSON.parse(content), function(auth) {

      execMethod(auth,
        'getContactList', 
        { g: '2011 South Calgary Garden' }, 
        function(resp) {
          var result = JSON.stringify(resp.response.result);
          console.log(result);
        });

    });
  }); 
}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

// ******************
loadConfiguration(onConfigLoaded);