/**
 * The function in this script will be called by the Apps Script Execution API.
 * scriptId = 1fh8s_N1SYYnO_Wmx53HuLtggArgPKs-8tDbCb21bwOHCQA3Zm8wKX_-Z
 * API ID = Mfo91XSssFjwuI2DJtMctQXmYF1VsHRwD
 */

var scope = "http://www.google.com/m8/feeds";
var scriptId = '1fh8s_N1SYYnO_Wmx53HuLtggArgPKs-8tDbCb21bwOHCQA3Zm8wKX_-Z';

function defaultGroup() {
  return ContactsApp.getContactGroup('System Group: My Contacts');
}

function getContactsUri(id) {
  var re = /[@]/, at = '%40', 
  email = DriveApp.getFileById(scriptId).getOwner().getEmail();
  return scope.concat('/contacts/', email.replace(re, at), '/base/', options.i);
}

function addContactToGroup(options) {
  // TODO: Validate options, ensure non blank strings, email-ish value
  if (!options.g) {
    return errorMessage(400, "options.g is required", arguments);
  }
  if (!options.e) {
    return errorMessage(400, "options.e is required", arguments);
  }  
  if (!options.f || !options.l) {
    return errorMessage(400, "option.f and option.l are required", arguments);
  }    
  return addContact(options.f, options.l, options.e, options.g);
}
