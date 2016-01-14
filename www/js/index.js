document.addEventListener('deviceready', deviceIsReady, false);

var map;
var poiLayer = L.layerGroup();
var remotePOIDB;
var localPOIDB;
var REMOTE_DB_ADDR = 'http://gi88.geoinfo.tuwien.ac.at:5984/refu_2';
var addMode = false;

var language;
language = "en";
// alert('index loaded');

var noDescReport;
var storeErrorText;

function gettext(key) {
  if (key in translation[language]) {
    return translation[language][key];
  } else {
    console.log(key);
    return translation['en'][key];
  }
}

var translateMap = {
  "inner" : {
    "langopt" : "language",
    "projlink" : "projectName",
    "search-header" : "search",
    // "searchbox" : "searchPrompt",
    "category-header" : "categories",
    "placelist-header" : "places",
    "desc-label" : "descLangPrompt",
    "desc-add" : "descAddPrompt",
    "place-found" : "placeFound",
    "place-notfound" : "placeNotFound",
    "route-button" : "findRoute",
    "options-header" : "options",
    "privacy-notice" : "privacyNotice",
    "option-submit" : "save",
    "link-about" : "about",
    "about-header" : "about",
    "contact-form" : "sendMessagePrompt",
    "user-email-label" : "email",
    "user-lang-label" : "language"
  }
} 

function saveOptions() {
  language = document.getElementById('user-lang').value;
  console.log('<change-language: ' + language + '>');
  translate();
  window.location = '#page-map';
}

function translate() {
  console.log('<translate: ' + language + '>');
  var innerTrans = translateMap["inner"];
  var elem;
  for (key in innerTrans) {
    // console.log(key);
    $('#' + key).text(gettext(innerTrans[key]));
    // elem = document.getElementById(key);
    // if (elem)
      // elem.innerHTML = gettext(innerTrans[key]);
  }
  $('#searchbox').attr('placeholder', gettext('searchPrompt')); // TODO
  // TODO: translate category names
  // TODO: format with current language
  // TODO: add images to these (categories, places in search page)...
  // TODO: image to use for return-to-map
  // reports within the script
  noDescReport = gettext('noDescriptionReport');
  storeErrorText = gettext('storeError');
  commands.translate();
  if (language != "en")
    alert('translating ended');
  console.log('</translate: ' + language + '>');
}

function createButton(cls, container, options) {
  but = L.DomUtil.create('a', cls, container);
  but.href = '#';
  for (opt in options) {
    but[opt] = options[opt];
  }
  return but;
}

L.Control.CommandPanel = L.Control.extend({
  options: {
    // topright, topleft, bottomleft, bottomright
    position: 'topright',
    placeholder: 'Do'
  },
  initialize: function (options /*{ data: {...}  }*/) {
    // constructor
    L.Util.setOptions(this, options);
  },
  onAdd: function (map) {
    // happens after added to map
    console.log('<commandpanel-onadd>');
    var container = L.DomUtil.create('div', 'command-container');
    this.collapsed = L.DomUtil.create('div', 'leaflet-bar container-collapsed', container);
    this.expandButton = createButton('command-button command-expand', this.collapsed, {title: 'More controls...'});
    this.expandButton.onclick = this.expand;
    // this.expandButton.innerHTML = 'v';
    this.expanded = L.DomUtil.create('div', 'leaflet-bar container-expanded', container);
    this.expanded.style.display = 'none';
    // $('.container-expanded').hide();
    this.collapseButton = createButton('command-button command-collapse', this.expanded, {title: 'Hide controls'});
    this.collapseButton.onclick = this.collapse;
    this.locateButton = createButton('command-button command-locate', this.expanded, {title: 'Locate me'});
    this.locateButton.onclick = gotoLocation;
    this.layerButton = createButton('command-button command-layer', this.expanded, {title: 'Choose what to display'});
    this.searchButton = createButton('command-button command-search', this.expanded, {title: 'Search', href: '#page-search'});
    this.addButton = createButton('command-button command-add', this.expanded, {title: 'Add place'});
    this.addButton.onclick = switchAddMode;
    this.optionsButton = createButton('command-button command-options', this.expanded, {title: 'Options', href: '#page-options'});
    // L.DomEvent.addListener(this.input, 'keyup', _.debounce(this.keyup, 300), this);
    // L.DomEvent.addListener(this.form, 'submit', this.submit, this);
    L.DomEvent.disableClickPropagation(container);
    console.log('</commandpanel-onadd>');
    return container;
  },
  onRemove: function (map) {
    // when removed
    // L.DomEvent.removeListener(this._input, 'keyup', this.keyup, this);
    // L.DomEvent.removeListener(form, 'submit', this.submit, this);
  },
  translate: function () {
    this.expandButton.title = gettext('expandControls');
    this.collapseButton.title = gettext('collapseControls');
    this.locateButton.title = gettext('locateMe');
    this.layerButton.title = gettext('categories');
    this.searchButton.title = gettext('search');
    this.addButton.title = gettext('addPlace');
    this.optionsButton.title = gettext('options');
  },
  expand: function (evt) {
    $('.container-collapsed').hide();
    $('.container-expanded').show();
  },
  collapse: function (evt) {
    $('.container-collapsed').show();
    $('.container-expanded').hide();
  },
});

L.control.commandpanel = function(id, options) {
  return new L.Control.CommandPanel(id, options);
};


function deviceIsReady() {
  console.log('<deviceIsReady>');
  $('#add-mode-off').hide();
  remotePOIDB = new PouchDB(REMOTE_DB_ADDR);
  localPOIDB = new PouchDB('mappoint');
  initSync();
  initMap();
  initOptions();
  translate();
  console.log('</deviceIsReady>');
}

function initMap() {
  console.log('<initMap>');
  map = L.map('map');
  // tiles
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: '&copy; <a href="http://osm.org">OSM contributors</a> | <a href="#page-about" id="projlink">Project Refu</a>'
  }).addTo(map);
  L.control.scale({imperial : false}).addTo(map);
  commands = L.control.commandpanel();
  commands.addTo(map);
  // map.addControl(new controlPanel());
  // locate the device
  gotoLocation();
  // add the POIs
  poiLayer.addTo(map);
  drawPOIs();
  console.log('</initMap>');
}

function initOptions() {
  langSelect = document.getElementById('user-lang');
  for (lang in translation) {
    var langopt = document.createElement("OPTION");
    langopt.value = lang;
    langopt.innerHTML = translation[lang][lang];
    langSelect.add(langopt);
  }
  // object.onchange = languageChanged;
}

function gotoLocation() {
  map.locate({setView: true, maxZoom: 16});
}

function initSync() {
  var options = {live: true, retry: true};
  var sync = PouchDB.sync(localPOIDB, remotePOIDB, options)
    .on('change', function(info) {
      setStatusIcon('refresh');
      console.log('<sync=change>');
    })
    .on('paused', function(info) {
      setStatusIcon('check');
      refresh();
      console.log('<sync=paused>');
    })
    .on('active', function(info) {
      setStatusIcon('delete');
      console.log('<sync=active>');
    })
    .on('error', function(info) {
      setStatusIcon('delete');
      console.log('<sync=error>');
    })
    .on('complete', function(info) {
      setStatusIcon('delete');
      console.log('<sync=complete>');
    });
}

function setStatusIcon(state) {
  if (state == 'refresh') {
    console.log('<statusicon=refresh>');
    $('.status-icon').toggleClass('ui-icon-refresh', true);
    $('.status-icon').toggleClass('ui-icon-delete', false);
    $('.status-icon').toggleClass('ui-icon-check', false);
  } else if (state == 'delete') {
    console.log('<statusicon=delete>');
    $('.status-icon').toggleClass('ui-icon-refresh', false);
    $('.status-icon').toggleClass('ui-icon-delete', true);
    $('.status-icon').toggleClass('ui-icon-check', false);
  } else if (state == 'check') {
    console.log('<statusicon=check>');
    $('.status-icon').toggleClass('ui-icon-refresh', false);
    $('.status-icon').toggleClass('ui-icon-delete', false);
    $('.status-icon').toggleClass('ui-icon-check', true);
  }
}

function switchAddMode() {
  if (addMode) {
    addModeOff();
  } else {
    addModeOn();
  }
}

function addModeOn() {
  console.log('<addmode=true>');
  map.on('click', addPlace);
  $('#add-mode-off').show();
  $('#add-mode-on').hide();
  $('.command-add').toggleClass('command-button', false);
  $('.command-add').toggleClass('command-button-down', true);
  $('#map').toggleClass('locselecting', true);
  addMode = true;
  console.log('</addmode=true>');
}

function addModeOff() {
  console.log('<addmode=false>');
  map.removeEventListener('click');
  $('#add-mode-off').hide();
  $('#add-mode-on').show();
  $('.command-add').toggleClass('command-button', true);
  $('.command-add').toggleClass('command-button-down', false);
  $('#map').toggleClass('locselecting', false);
  addMode = false;
  console.log('</addmode=false>');
}

function addPlace(evt) {
  
  console.log('<addplace>');
  var name = prompt("Name of the Place:");
  if (name == undefined || name == "" || name == null)
    return;
  var creator = device.uuid;
  if (creator == undefined) {
    creator = 'browser';
  }
  newDBEntry([evt.latlng.lat, evt.latlng.lng], {"name" : name, "creator" : creator});
  addModeOff();
}

function newDBEntry(coor, props) {
  var doc = {"_id" : props.name.replace(/\s/g, "") + (Math.random() * 1000000),
    "type" : "Feature",
    "geometry" : {"type" : "Point", "coordinates" : coor},
    "properties" : props
  };
  console.log(doc);
  localPOIDB.put(doc).then(refresh).catch(errorStoring);
}

function refresh(evt) {
  drawPOIs();
}

function errorStoring(err) {
  console.log(err);
  alert(storeErrorText);
}

function drawPOIs() {
  localPOIDB.query('poi/allpoi', {include_docs : true, attachments : true}).then(
    function(results) {
      poiLayer.clearLayers();
      for (var entrynumber in results.rows) {
        var entry = results.rows[entrynumber];
        var marker = L.marker(entry.value.geometry.coordinates).addTo(poiLayer);
        var content = '<p class="popupname">' + entry.value.properties.name + '(' + entry.value.properties.category + ')</p><a class="morelink" href="#" onclick="showDetails(\'' + entry.value._id + '\');">...</a>';
        marker.bindPopup(content);
		console.log(entry.value)
      };
    }).catch(function (error) {
        console.log(error);
    });
}
function showDetails(id){
		map.closePopup();
		window.location = '#page-details';
	    localPOIDB.get(id).then(function(doc){
		$('#details-name').text(doc.properties.name);
		$('#desc-category').text(doc.properties.category);
		$('#desc-description').text(doc.properties["desc:en"]);
		$('#desc-phone').text(doc.properties.phone);
		$('#desc-address').text(doc.properties.address);
		$('#desc-website').text(doc.properties.website);
		console.log(doc.properties.name)
	}).catch(function(err){console.log(err);});
	
}
function addpage(){
		window.location = "#page-add"
}

function addplace(){
	 var name = $("#add-placename").val();
	 var description = $("#add-desc").val();
	 var email = $("#add-email").val();
	 var category = $("#add-category").val();
	 var address = $("#add-address").val();
	 var website = $("#add-website").val();
	 console.log(name);
	
}

function addplacetopouch(){
	localPOIDB.put(doc1).then(refresh).catch(errorStoring);
}
		
// deviceIsReady();