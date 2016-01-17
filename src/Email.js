/*
 *
 *
 */

function messageDetails(options) {
  var template = validateTemplate(options.t);
  if (!template) {
    return errorMessage(422, "options.t is not a valid template", arguments);
  }
  // TODO: Is subject required? Should there be default subject strings for each template 
  var subject = options.s; 
  return [template, subject];
}

function mailToGroup(options) {
  if (!options.g) {
    return errorMessage(400, "options.g is required", arguments);
  }
  if (!options.t) {
    return errorMessage(400, "options.t is required", arguments);
  }

//--->
  var template = validateTemplate(options.t);
  if (!template) {
    return errorMessage(422, "options.t is not a valid template", arguments);
  }

  // TODO: Is subject required? Should there be default subject strings for each template 
  var subject = options.s; 
// ---<
  // var [template, subject] = messageDetails(options);
  // if (template.error) { return template; }

//--->
  // var group = getGroup(options);
  // if (group.error) { return group; }
  // var contacts = ContactsApp.getContactsByGroup(group);
  // if (!contacts) {
  //   return errorMessage(500, "could not get contacts for group with name", arguments, options.g);
  // }    
// ---<
  var contacts = getGroupContacts(options);
  if (contacts.error) { return contacts; }
    
  var merge = openMergeDocument(template, options);
  var body = replaceDocumentTokens(merge, options);
  for (var i in contacts) {
    var email = contacts[i].getEmails()[0].getAddress();
    MailApp.sendEmail(email, subject, body.getText());
    // Wonder if this might run afowl of googles omni-present monitoring bots?
    // Perhaps build in some kind of delay to prevent unwanted attention...      
  }
  DriveApp.getFileById(merge.getId()).setTrashed(true);
}

function mailToContact(options) {
  if (!options.e && !options.i) {
    return errorMessage(400, "options.i or option.e is required", arguments);
  }
  if (!options.t) {
    return errorMessage(400, "options.t is required", arguments);
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
    return errorMessage(422, "options.t is not a valid template", arguments);
  }
  // TODO: Is subject required? Should there be default subject strings for each template 
  var subject = options.s; 
// >---> ???

  var merge = openMergeDocument(template, options); 
  var body = replaceDocumentTokens(merge, options);  
  MailApp.sendEmail(options.e, subject, body.getText());
  
  DriveApp.getFileById(merge.getId()).setTrashed(true);
}