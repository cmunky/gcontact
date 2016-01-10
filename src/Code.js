/**
 * The function in this script will be called by the Apps Script Execution API.
 * scriptId = 1fh8s_N1SYYnO_Wmx53HuLtggArgPKs-8tDbCb21bwOHCQA3Zm8wKX_-Z
 * API ID = Mfo91XSssFjwuI2DJtMctQXmYF1VsHRwD
 */

function defaultGroup() {
  return ContactsApp.getContactGroup('System Group: My Contacts');
}

function addContactToGroup(options) {
  // TODO: Validate options, ensure non blank strings, email-ish value
  if (!options.g) {
    return { "error": "Invalid argument", "message": "create: options.g is required" } 
  }
  if (!options.e) {
    return { "error": "Invalid argument", "message": "create: options.e is required" } 
  }  
  if (!options.f || !options.l) {
    return { "error": "Invalid argument", "message": "create: options.f and option.l are required" } 
  }    
  return addContact(options.f, options.l, options.e, options.g);
}
