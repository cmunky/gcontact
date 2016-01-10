/*
 *
 *
 */ 
 
function addContact(first, last, email, name) {
  var response = {};
  var contact = getContact({"e": email})
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
// >--->
  var group = getGroup(options);
  if (group.error) { return group; }
  var contacts = ContactsApp.getContactsByGroup(group);
  if (!contacts) {
    return { "error": "Server Error", "code": "500", "message": "getContactList: could not get contacts for group with name : "+options.g } 
  }    
  var result = [], uri = "", id = "";
  for (var i in contacts) {
    // TODO: Should the contact list have more than name and email ?
    uri = contacts[i].getId()
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
    return { "error": "Invalid argument", "message": "getIdForEmail: options.e is required" } 
  }
  var contact = ContactsApp.getContact(options.e);
  if (!contact) {
    return { "error": "Not Found", "code": "404", "message": "getIdForEmail: contact not found with email : "+options.e } 
  }
  return { "id" : contact.getId() };
}

function getEmailForId(options) {
  if (!options.i) {
    return { "error": "Invalid argument", "message": "getEmailForId: options.i is required" } 
  }  
  var id = "http://www.google.com/m8/feeds/contacts/addr.mgr.bettercode%40gmail.com/base/" + options.i;
  var contact = ContactsApp.getContactById(id);
  if (!contact) {
    return { "error": "Not Found", "code": "404", "message": "getEmailForId: contact not found with id : "+options.i } 
  }
  if (contact) {
    return { "email" : contact.getEmails()[0].getAddress() };
  }
}
