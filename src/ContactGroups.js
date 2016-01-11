/*
 *
 *
 */ 

// TODO: Move to Library ?!?!?!
function errorMessage(err, msg, fcn, opt) {
  opt = opt || '';
  var codes = { "Server Error": "500", "Not Found": "404", "Invalid argument": "400" };
  var fn = fcn ? fcn.callee.toString().match(/function ([^\(]+)/)[1] : '';
  var m = fn.concat(': ', msg, ': ', opt);
  var o = {"error": err, "message": m };
  var c = codes[err];
  if (c) { o.code = c; }
  return o;
}

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
    return errorMessage("Invalid argument", "options.g is required", arguments);
    //return { "error": "Invalid argument", "message": "getGroup: options.g is required" };
  }
  var group = ContactsApp.getContactGroup(options.g);
  if (!group) {
    return errorMessage("Not Found", "group not found with name ", arguments, options.g);
    //return { "error": "Not Found", "code": "404", "message": "getGroup: group not found with name : "+options.g };
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
