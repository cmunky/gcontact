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

function validateTemplate(template) {
  var result = false;
  var templateList = [];
  var props = PropertiesService.getScriptProperties();
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
