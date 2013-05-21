function initialize(){
  if(window.localStorage){
    Storage.prototype.setObject = function(key, value) {
      this.setItem(key, JSON.stringify(value));
    }
    Storage.prototype.getObject = function(key) {
      var value = this.getItem(key);
      return value && JSON.parse(value);
    }
    doInitialization();
  } else {
    $('.badNews').show();
    $('.mainControls').hide();
  }
}

function doInitialization(){
  $('#addNewDataForm').hide();
  $('.badNews').hide();
  $('.backToMain').hide();

  chrome.tabs.query({'active': true}, function(tabs) {
    var tabUrl = getHostOfUrl(tabs[0].url);
    $('#content > center').append('<i>' + tabUrl + '</i>');
  });

  forMainControls();
  forAddNewDataForm();
  getAllSavedDataForTheSite();
}

function forMainControls(){
  forAddNew();
  forViewAll();
  forDeleteAll();
}

function forAddNew(){
  $('.addNew').click(function(){
    $('#addNewDataForm').show();
    $('.mainControls').hide();
  });  
}

function forViewAll(){
  $('.viewAll').click(function(){
    $('.mainControls').hide();
    $('#savedData').empty();
    $('#content > center > h4').next().hide();
    $('.backToMain').show();

    for(var i = 0; i < window.localStorage.length; i++){
      var aSavedUrl = window.localStorage.key(i);
      $('#savedData').append('<b>' + aSavedUrl + '</b><hr/>');
      
      var savedData = window.localStorage.getObject(aSavedUrl);
      $('#savedData').append("<label>" + JSON.stringify(savedData) + "</label>" + "<br/>");
    }
  });
  $('.backToMain').click(function(){
    $(this).hide();
    $('#savedData').empty();
    getAllSavedDataForTheSite();
    $('.mainControls').show();
  });
}

function forDeleteAll(){
  $('.deleteAll').click(function(){
    chrome.tabs.query({'active': true}, function(tabs) {
      var tabUrl = getHostOfUrl(tabs[0].url);
      window.localStorage.setObject(tabUrl, []);

      getAllSavedDataForTheSite();
    });
  });  
}

function forAddNewDataForm(){
  $('.closeNewDataForm').click(function(){
    $('#addNewDataForm').hide();
    $('.mainControls').show();
  });

  $('.addTheData').click(function(){
    saveDataAction();
  });
}

function getAllSavedDataForTheSite(){
  chrome.tabs.query({'active': true}, function(tabs) {
    var tabUrl = getHostOfUrl(tabs[0].url);
    
    for(var i = 0; i < window.localStorage.length; i++){
      var aSavedUrl = window.localStorage.key(i);
      if(tabUrl == aSavedUrl){
        var savedData = window.localStorage.getObject(aSavedUrl);
        $('#savedData').html("<label>" + JSON.stringify(savedData) + "</label>" + "<br/>");
      }
    }
  });
}

function saveDataAction(){
  chrome.tabs.query({'active': true}, function(tabs) {
    var tabUrl = getHostOfUrl(tabs[0].url);
    var storedKeyAndValues = window.localStorage.getObject(tabUrl);  
    
    var dataName = $('textarea[name=dataName]').val();
    var dataValue = $('textarea[name=dataValue]').val();
    if(dataName.trim() != "" & dataValue.trim() != ""){
      if(storedKeyAndValues !== null & storedKeyAndValues !== undefined & storedKeyAndValues !== ""){
        var anObj = {};
        anObj["" + dataName] = dataValue;
        storedKeyAndValues.push(anObj);
        
        window.localStorage.setObject(tabUrl, storedKeyAndValues);
      } else {
        var newListOfKeysAndValues = [];
        var anObj = {};
        anObj["" + dataName] = dataValue;
        newListOfKeysAndValues.push(anObj);
        
        window.localStorage.setObject(tabUrl, newListOfKeysAndValues);
      }
      getAllSavedDataForTheSite();
    } else 
      alert("Dude, you gotta type it all!");
  });
}

function getHostOfUrl(tabUrl){
  //Position of parts are as follows:
  //int SCHEMA = 2, DOMAIN = 3, PORT = 5, PATH = 6, FILE = 8, QUERYSTRING = 9, HASH = 12
  var myHostGetterRegex = /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)(:([^\/]*))?((\/[\w/-]+)*\/)([\w\-\.]+[^#?\s]+)(\?([^#]*))?(#(.*))?$/i;

  var domain = tabUrl.match(myHostGetterRegex)[3];
  return domain;
}

// As soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
  initialize();
});