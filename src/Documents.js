/*
 *
 *
 */ 

function getTemplateDocuments() {
  var response = [];
  var iterator = DriveApp.getFiles();
  
  while (iterator.hasNext()) {
    var file = iterator.next();
    var d = file.getDescription();
    if (d && isTemplate(d)) {
      response.push({"id": file.getId(), "name": file.getName(), "desc": d});
    }
  }
  return response;
}

function isTemplate(description) {
  var re = /(\W|^)template(\W|$)/i;
  return re.exec(description);
}

function getTimestamp() {
  var tz = "MDT", 
  format = "YYYY,MM,dd,k,m,'0'";
  return Utilities.formatDate(new Date(), tz, format);  
}

function timestampToDate(timestamp) {
  timestamp = timestamp || getTimestamp();
  var ts = timestamp.split(',');  
  return new Date(ts[0], ts[1] - 1, ts[2], ts[3], ts[4], ts[5]);
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

function daysBetween(start, end) {
  var elapsed = end.getTime() - start.getTime();  
  return Math.floor(elapsed / (1000 * 60 * 60 * 24));
}

function hoursBetween(start, end) {
  var elapsed = end.getTime() - start.getTime();  
  return Math.floor(elapsed / (1000 * 60 * 60));
}

function setTemplateCacheTimestamp(yr, m, d, h, mm, properties) {  
  properties.setProperty('TEMPLATE_CACHE_TIMESTAMP', makeTimestamp(yr, m, d, h, mm));
}

function validateTemplate(template) {
  var result = false;
  var templateList = [];
  var props = PropertiesService.getScriptProperties();
  //setTemplateCacheTimestamp(2014, 10, 31, 4, 20, props); // to "pre age" the cache
  var maxDays = 5; // TODO: read from property!!??
  var templateCache = props.getProperty('TEMPLATE_CACHE');
  if (templateCache) { 
    var cacheTimestamp = props.getProperty('TEMPLATE_CACHE_TIMESTAMP');
    var cacheDate = timestampToDate(cacheTimestamp);
    if (daysBetween(cacheDate, timestampToDate()) > maxDays) {
      templateCache = JSON.stringify(getTemplateDocuments());
      props.setProperty('TEMPLATE_CACHE', templateCache);
      props.setProperty('TEMPLATE_CACHE_TIMESTAMP', getTimestamp());
    }
    templateList = JSON.parse(templateCache);
  } else { 
    templateList = getTemplateDocuments();
    props.setProperty('TEMPLATE_CACHE', JSON.stringify(templateList));
    props.setProperty('TEMPLATE_CACHE_TIMESTAMP', getTimestamp());
  }
  for (var i in templateList) {
    var found = (templateList[i].id === template || templateList[i].name === template);
    if (found) { 
      return templateList[i].id;
    }
  }
  return result;
}

function openMergeDocument(template, options) {
  var templateDoc = DriveApp.getFileById(template);
  var docName = documentName(templateDoc.getName(), options.e);
  var docId = templateDoc.makeCopy(docName).getId();
  return DocumentApp.openById(docId);
}

function replaceDocumentTokens(doc, options) {
  var copyBody = doc.getBody();
  
  copyBody.replaceText("^#.*", ""); // remove comments 
  var reserved = ['t', 'e', 'i', 's', 'op'];
  for (var tag in options) {
     // this ensures we don't try to the option keys for text replacements
     var found = false;
     for(var i in reserved) {
       found = (reserved[i] === tag);
       if (found) { break; }
     }
     // TODO: How to validate options to be merged with the template
     if (!found) {
       var value = options[tag];
       tag = "\\["+tag+"\\]";
       // Logger.log(tag + " : " + value);
       copyBody.replaceText(tag, value);
     }
  }
  doc.saveAndClose();
  return copyBody;
}

function documentName(templateName, email) {
  var now = Utilities.formatDate(new Date(), "GMT", "yyMMddHHmmss");
  var parts = [templateName, email, now];
  return parts.join("_");  
}
