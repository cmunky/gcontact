/*
 *
 *
 */ 

function addGroup(options) {
  var group = getGroup(options);
  Logger.log(group);
  if (group.error) {
    Logger.log(group.code);
    if (group.code !== "404") {
      return group; 
    } else { 
      group = ContactsApp.createContactGroup(options.g);
    }
  }
  if (!group) {
    return { "error": "Server Error", "code": "500", "message": "addGroup: could not create group with name : "+options.g };
  }  
  return { "id" : group.getId(), "name": options.g };
}

function getGroup(options) {
  if (!options.g) {
    return { "error": "Invalid argument", "message": "getGroup: options.g is required" };
  }
  var group = ContactsApp.getContactGroup(options.g);
  if (!group) {
    return { "error": "Not Found", "code": "404", "message": "getGroup: group not found with name : "+options.g };
  }
  return group;
}

function getIdForGroup(options) {
  var group = getGroup(options);
  if (group.error) { return group; }
  return { "id" : group.getId() };
}

function removeFromGroup(options) {
  var contact = getContact(options);
  if (contact.error) { return contact; }
  var group = getGroup(options);
  if (group.error) { return group; }  
  contact = contact.removeFromGroup(group);  
  return getGroupsForContact(contact);
}

function addToGroup(options) {
  var contact = getContact(options);
  if (contact.error) { return contact; }
  var group = getGroup(options);
  if (group.error) { return group; }  
  contact = contact.addToGroup(group); 
  return getGroupsForContact(contact);
}

function getGroupsForContact(contact) {
  var groups = contact.getContactGroups();
  var result = [];
  for(var item in groups) {
    result.push(groups[item].getName());
  }
  return result;
}
