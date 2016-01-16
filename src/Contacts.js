/*
 *
 *
 */ 

function addContact(first, last, email, name) {
  var response = {};
  var contact = getContact({"e": email});
  if (contact.error) { 
    contact = ContactsApp.createContact(first, last, email);  
    // TODO: check for success???    
    contact = contact.addToGroup(defaultGroup());  
    // TODO: check for success???
  } else {
    response.warning = "Contact Exists";
    response.message = "addContact: Existing contact was found with email : "+email;
  } 
  response.id = contact.getId();  
  var group = ContactsApp.getContactGroup(name);
  if (group) {
    contact = contact.addToGroup(group);    
  } else {
    response.warning = "Not Found";
    response.message = "addContact: Group not found with name : "+name;
  }  
  return response;
}

function getContact(options) {
  var response = getIdForEmail(options);
  if (response.error) { return response; }
  return ContactsApp.getContactById(response.id);
}

function getContactList(options) {
  var group = getGroup(options);
  if (group.error) { return group; }
  var contacts = ContactsApp.getContactsByGroup(group);
  if (!contacts) {
    return errorMessage(500, "could not get contacts for group with name ", arguments, options.g);
  }    
  var result = [], uri = "", id = "";
  for (var i in contacts) {
    // TODO: Should the contact list contain more than name and email ?
    uri = contacts[i].getId();
    id = uri.match(/\/base\/(.*)/)[1];
    result.push({
      "id": id,
      "name": contacts[i].getFullName(), 
      "email" : contacts[i].getEmails()[0].getAddress()
    });
  }
  return result;
}

function getIdForEmail(options) {
  if (!options.e) {
    return errorMessage(400, "options.e is required", arguments);
  }
  var contact = ContactsApp.getContact(options.e);
  if (!contact) {
    return errorMessage(404, "contact not found for email", arguments, options.e );
  }
  return { "id" : contact.getId() };
}

function getEmailForId(options) {
  if (!options.i) {
    return errorMessage(400, "options.i is required", arguments);
  }  
  var uri = getContactsUri(options.i);
  var contact = ContactsApp.getContactById(uri);
  if (!contact) {
    return errorMessage(404, "contact not found for id", arguments, options.i);
  }
  if (contact) {
    return { "email" : contact.getEmails()[0].getAddress() };
  }
}
