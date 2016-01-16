/*
 *
 *
 */

function documentName(templateName, email) {
  var now = Utilities.formatDate(new Date(), "GMT", "yyMMddHHmmss");
  var parts = [templateName, email, now];
  return parts.join("_");  
}

function daysBetween(start, end) {
  var elapsed = end.getTime() - start.getTime();  
  return Math.floor(elapsed / (1000 * 60 * 60 * 24));
}

function errorMessage(err, msg, fcn, opt) {
  opt = opt || '';
  var codes = { 500: "Server Error", 404: "Not Found", 400: "Invalid Argument", 422: "Invalid Template" };
  var fn = fcn ? fcn.callee.toString().match(/function ([^\(]+)/)[1] : '';
  var m = fn.concat(': ', msg, ': ', opt);
  var o = {"error": codes[err], "message": m, "code": err };
  return o;
}

function getGroupContacts(options) {
  var group = getGroup(options);
  if (group.error) { return group; }
  var contacts = ContactsApp.getContactsByGroup(group);
  if (!contacts) {
    return errorMessage(500, "could not get contacts for group with name", arguments, options.g);
  }    
  return contacts;
}

function getTimestamp() {
  var tz = "MDT", 
  format = "YYYY,MM,dd,k,m,'0'";
  return Utilities.formatDate(new Date(), tz, format);  
}

function hoursBetween(start, end) {
  var elapsed = end.getTime() - start.getTime();  
  return Math.floor(elapsed / (1000 * 60 * 60));
}

function isTemplate(description) {
  var re = /(\W|^)template(\W|$)/i;
  return re.exec(description);
}

function makeTimestamp(y, m, d, h, mm) {
  y = y || 2005;
  m = (m - 1) || 7; 
  d = d || 23;
  h = h || 4;
  mm = mm || 42;
  var tz = "MDT", 
  format = "YYYY,MM,dd,k,m,'0'";
  return Utilities.formatDate(new Date(y, m, d, h, mm, 0), tz, format);  
}

function timestampToDate(timestamp) {
  timestamp = timestamp || getTimestamp();
  var ts = timestamp.split(',');  
  return new Date(ts[0], ts[1] - 1, ts[2], ts[3], ts[4], ts[5]);
}
