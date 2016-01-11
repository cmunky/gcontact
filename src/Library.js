/*
 * Utility Library
 * 
 */

function mailToGroup(options) {
  if (!options.g) {
    return { "error": "Invalid argument", "message": "mailToGroup: options.g is required" };
  }
  if (!options.t) {
    return { "error": "Invalid argument", "message": "mailToGroup: options.t is required" };
  }

//--->
  var template = validateTemplate(options.t);
  if (!template) {
    return { "error": "Invalid argument", "message": "mailToGroup: options.t is not a valid template" };
  }
  // TODO: Is subject required? Should there be default subject strings for each template 
  var subject = options.s; 
// ---<

//--->
  var group = getGroup(options);
  if (group.error) { return group; }
  var contacts = ContactsApp.getContactsByGroup(group);
  if (!contacts) {
    return { "error": "Server Error", "code": "500", "message": "mailToGroup: could not get contacts for group with name : "+options.g } 
  }    
// ---<
  
  var merge = openMergeDocument(template, options);
  var body = replaceDocumentTokens(merge, options);
  for (var i in contacts) {
    var email = contacts[i].getEmails()[0].getAddress();
    MailApp.sendEmail(email, subject, body.getText());
    // Wonder if this might run afowl of googles omni-present monitoring bots?
    // Perhaps build in some kind of delay to prevent unwanted attention...      
  }
  DocsList.getFileById(merge.getId()).setTrashed(true);
}

function mailToContact(options) {
  if (!options.e && !options.i) {
    return { "error": "Invalid argument", "message": "mailToContact: options.e or options.i is required" };
  }
  if (!options.t) {
    return { "error": "Invalid argument", "message": "mailToContact: options.t is required" };
  }
  if (options.e) {
    var validation = getIdForEmail(options);
    if (validation.error) { return validation; }
  }
  if (options.i) {
    var response = getEmailForId(options);
    if (response.error) { return response; } else { options.e = response.email; } 
  }
// >--->  
  var template = validateTemplate(options.t);
  if (!template) {
    return { "error": "Invalid argument", "message": "mailToContact: options.t is not a valid template" };
  }
  // TODO: Is subject required? Should there be default subject strings for each template 
  var subject = options.s; 

// >---> ???
  var merge = openMergeDocument(template, options); 
  var body = replaceDocumentTokens(merge, options);  
  MailApp.sendEmail(options.e, subject, body.getText());
  
  DocsList.getFileById(merge.getId()).setTrashed(true);
}

