document.addEventListener('deviceready', deviceIsReady, false);
// TODO: register online/offline events to the tile layer

var map;
var poiLayer = L.layerGroup();
var remotePOIDB;
var localPOIDB;
var REMOTE_DB_ADDR = 'http://gi88.geoinfo.tuwien.ac.at:5984/refu_2';
var VALHALLA_KEY = 'valhalla-glGvZII';
var addMode = false;

var language;
language = "en";
var confRev;
// alert('index loaded');

var noDescReport;
var storeErrorText;

var currentDoc = "";
var currentPosition;
var currentAccuracy;
var locationIcon = L.divIcon({className: 'location-icon'});
var locationLayer = L.layerGroup();
var routeLayer = L.layerGroup();
var tileLayer;

// Offline.options.requests = false; // does not retry requests failed while offline

function gettext(key) {
  var trans;
  if (key in translation[language]) {
    trans = translation[language][key];
  } else {
    console.log('<translation-missing lang=' + language + ' key=' + key + '>');
    trans = translation['en'][key];
  }
  return trans;
}

function gettextFormatted(key, lang) {
  return gettext(key).replace('%l', translation[lang][lang]);
}

var translateMap = {
  "text" : {
    "langopt" : "language",
    "projlink" : "projectName",
    "search-header" : "search",
    // "searchbox" : "searchPrompt",
    "category-header" : "categories",
    "placelist-header" : "places",
    "desc-label" : "descLangPrompt",
    "place-found-text" : "placeFound",
    "place-notfound-text" : "placeNotFound",
    "route-button" : "findRoute",
    "options-header" : "options",
    "privacy-notice" : "privacyNotice",
    "option-submit" : "save",
    "link-about" : "about",
    "about-header" : "about",
    "filter-header" : "chooseFilter",
    "contact-form" : "sendMessagePrompt",
    "user-email-label" : "email",
    "user-lang-label" : "language",
    "submit-desc" : "submit",
    "filter-disp-all" : "displayAll",
    "back-to-options" : "options",
    "add-header" : "addNewPlace",
    "add-category-label" : "category",
    "category-subheader" : "category"
  },
  "placeholder" : {
    "searchbox" : "searchPrompt",
    "add-placename" : "placeName",
    "add-desc" : "description",
    "add-address" : "address",
    "add-website" : "website",
    "add-phone" : "phoneNumber",
    "add-email" : "email"
  }
} 

function saveOptions() {
  language = $('#user-lang').val();
  console.log('<change-language: ' + language + '>');
  translate();
  window.location = '#page-map';
  newConf = {'_id' : '_local/config', '_rev' : confRev, 'email' : $('#user-email').val(), 'language' : language};
  localPOIDB.put(newConf);
}

function translate() {
  console.log('<translate: ' + language + '>');
  var innerTrans = translateMap["text"];
  var placeholderTrans = translateMap["placeholder"];
  var elem;
  for (key in innerTrans) {
    $('#' + key).text(gettext(innerTrans[key]));
  }
  for (key in placeholderTrans) {
    $('#' + key).attr('placeholder', gettext(placeholderTrans[key]) + '...');
  }
  $('.leaflet-control-zoom-in').attr('title', gettext('zoomIn'));
  $('.leaflet-control-zoom-out').attr('title', gettext('zoomOut'));
  $('#submit-desc').val(gettext('submit'));
  // reports within the script
  noDescReport = gettext('noDescriptionReport');
  storeErrorText = gettext('storeError');
  commands.translate();
  translateCategories();
  // if (language != "en")
    // alert('translating ended');
  console.log('</translate: ' + language + '>');
}

function translateCategories() {
  for (category in categories) {
    $('.cat-' + category).text(gettext('cat:' + category));
  }  
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
    this.layerButton = createButton('command-button command-layer', this.expanded, {title: 'Choose what to display', href : '#page-filter'});
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
  initCategories();
  initMap();
  initOptions();
  Offline.on('up', goOnline);
  Offline.on('down', goOffline);
  console.log('</deviceIsReady>');
}

function initMap() {
  console.log('<initMap>');
  map = L.map('map');
  // tiles
  tileLayer = L.tileLayerCordova('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="http://osm.org">OSM contributors</a> | <a href="#page-about" id="projlink">Project Refu</a>',
    folder: 'refuMapTiles',
    name:   'refu',
    debug:   false
  }).addTo(map);
  L.control.scale({imperial : false}).addTo(map);
  commands = L.control.commandpanel();
  commands.addTo(map);
  // locate the device
  initWatchLocation();
  // add the POIs
  poiLayer.addTo(map);
  drawPOIs();
  routeLayer.addTo(map);
  $('#map').on('taphold', gotoAddPage);
  map.locate({setView: true, maxZoom: 14});
  setTimeout(initLocation, 2000);
  console.log('</initMap>');
}

function initLocation() {
  localPOIDB.get('_local/config').then(function (doc) {
    console.log(currentPosition);
    if (typeof currentPosition === 'undefined') {
      console.log('<loc-fromconf>');
      currentPosition = doc.lastPosition;
      currentAccuracy = doc.lastAccuracy;
      console.log(currentPosition);
      console.log(currentAccuracy);
      gotoLocation(14);
    } else {
      console.log('<loc-toconf>');
      doc.lastPosition = currentPosition;
      doc.lastAccuracy = currentAccuracy;
      localPOIDB.put(doc);
    }
  });
}

function initOptions() {
  langSelect = document.getElementById('user-lang');
  for (lang in translation) {
    var langopt = document.createElement("OPTION");
    langopt.value = lang;
    langopt.innerHTML = translation[lang][lang];
    langSelect.add(langopt);
  }
  localPOIDB.get('_local/config').then(function (doc) {
    console.log('<config-get>');
    $('#user-email').val(doc.email);
    language = doc.language;
    confRev = doc._rev;
    $('#user-lang').val(language);
    translate();
  }).catch(function (err) {
    console.log(err);
  });
  // object.onchange = languageChanged;
}

function gotoLocation(zoom) {
  if (typeof zoom === 'undefined') zoom = map.getZoom();
  console.log('<gotoloc ' + currentPosition + '>');
  map.setView(currentPosition, zoom); // cannot use locate because custom watchLocation is on
}

function initWatchLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(storePosition);
    locationLayer.addTo(map);
  }
}

function storePosition(position) {
  console.log('<store-position>');
  currentPosition = [position.coords.latitude, position.coords.longitude];
  currentAccuracy = position.coords.accuracy;
  showPosition();
}

function showPosition() {
  locationLayer.clearLayers();
  console.log('<show-position>');
  if (currentPosition) {
    L.marker(currentPosition, {icon : locationIcon, clickable : false}).addTo(locationLayer);
    L.circle(currentPosition, currentAccuracy, {weight : 1, clickable : false}).addTo(locationLayer);
  }
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
  map.on('click', gotoAddPage);
  $('#post-add').submit(addPlace);
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

function newDBEntry(coor, props) {
  var doc = {
    "_id" : props.name.replace(/\s/g, "").slice(0,10) + parseInt(Math.random() * 1000000000000).toString(16), // first 10 chars of name followed by 12 random hexdigits
    "type" : "Feature",
    "geometry" : {"type" : "Point", "coordinates" : coor},
    "properties" : props
  };
  console.log(doc);
  console.log(coor);
  localPOIDB.put(doc).then(refresh).catch(errorStoring);
  window.location = '#page-map';
}

function refresh(evt) {
  drawPOIs();
}

function errorStoring(err) {
  console.log(err);
  alert(storeErrorText);
}

function drawPOIs() {
  console.log(categories);
  localPOIDB.query('poi/allpoi', {include_docs : true, attachments : true}).then(
    function(results) {
      var entry, props, marker, content, coors, cat;
      var searchBox = $('#search-results');
      poiLayer.clearLayers();
      $('.place-search').remove();
      for (var entrynumber in results.rows) {
        entry = results.rows[entrynumber];
        props = entry.value.properties;
        coors = entry.value.geometry.coordinates;
        cat = categories[props.category];
        if (!cat || cat.display) {
          // marker = L.marker(coors, {icon : cat.icon}).addTo(poiLayer);
          marker = L.marker(coors, {icon : cat.icon}).addTo(poiLayer);
          content = '<p class="popupname">' + props.name + '</p><a class="morelink" href="#" onclick="showDetails(\'' + entry.value._id + '\');">...</a>';
          marker.bindPopup(content);
          var searchResult = '<li class="place-search"><a href="#" class="ui-btn ui-btn-icon-right ui-icon-carat-r" onclick="panTo([' + coors + ']);"><span>' + categoryImage(props.category) + '&nbsp;&nbsp;' + props.name + '</span></a></li>';
          searchBox.append(searchResult);
        }
        // console.log(entry.value);
      }
    }).catch(function (error) {
        console.log(error);
    });
}

function showDetails(id){
  map.closePopup();
  window.location = '#page-details';
  localPOIDB.get(id).then(function(doc){
    console.log('<show-details name=' + doc.properties.name + '>');
    currentDoc = doc;
    var props = doc.properties;
    $('#details-name').text(props.name);
    $('#desc-category').text(gettext('cat:' + props.category));
    $('#desc-phone').text(props.telephone);
    $('#desc-address').text(props.address);
    $('#desc-website').text(props.website);
    $('#desc-cat-img').attr('src', categoryImagePath(props.category));
    initDescription(props);
    updateRating(props);
	}).catch(function(err){console.log(err);});
}

function initDescription(props) {
  // offer alternatives
  var avail = getAvailableDescriptionLanguages(props);
  var notavail = [];
  for (lang in translation) {
    if (avail.indexOf(lang) == -1) { // if not available
      notavail.push(lang);
    }
  }
  var langSelect = $("#desc-lang");
  langSelect.empty();
  for (var i = 0; i < avail.length; i++) {
    langSelect.append(createLangOption(avail[i]));
  }
  if (notavail.length > 0) {
    var notavailGroup = document.createElement('optgroup');
    notavailGroup.label = gettext('noDescLang');
    langSelect.append(notavailGroup);
    for (var i = 0; i < notavail.length; i++) {
      notavailGroup.appendChild(createLangOption(notavail[i]));
    }
  }
  // select the user's language
  langSelect.val(language);
  // hack on jquery (hides the select and displays a span instead) to make the current option visible
  $('#desc-lang-button span:first').text(translation[language][language]);
  // show description in current language
  changeDescLang();
}

function createLangOption(lang) {
  var opt = document.createElement('option');
  var langName = lang;
  if (lang in translation)
    langName = translation[lang][lang];
  opt.value = lang;
  opt.text = langName;
  return opt;
}

function changeDescLang() {
  console.log('<change-desc-lang />');
  showDescription($('#desc-lang').val());
}

function getAvailableDescriptionLanguages(props) {
  var avail = [];
  for (prop in props) {
    if (prop.substr(0, 4) == "desc" && prop.search('author') == -1) {
      avail.push(prop.substr(5));
    }
  }
  return avail;
}

function showDescription(lang) {
  var curDesc = currentDoc.properties["desc:" + lang];
  if (curDesc) {
    $('#desc-add').hide();
    $('#desc-edit').text(gettextFormatted('descEditPrompt', lang));
    $('#desc-edit').show();
  } else {
    // no description found, display the button to add it
    curDesc = gettextFormatted('noDescriptionReport', lang);
    $('#desc-add').text(gettextFormatted('descAddPrompt', lang));
    $('#desc-add').show();
    $('#desc-edit').hide();
  }
  $('#desc-description').text(curDesc);
}

function updateRating(props) {
  // number of people who rated that or that way
  $('#desc-verified').text(props.verified.length);
  $('#desc-disapproved').text(props.disapproved.length);
  var userEmail = $("#user-email").val();
  // disable rating if user has already rated
  if (userEmail) {
    if (props.verified.indexOf(userEmail) != -1)
      $('#place-found').attr("disabled", "disabled");
    if (props.disapproved.indexOf(userEmail) != -1)
      $('#place-notfound').attr("disabled", "disabled");
  }
}

function gotoAddPage(evt){
  $('#add-placename').val('');
  $('#add-category').val('');
  $('#add-address').val('');
  $('#add-phone').val('');
  $('#add-website').val('');
	$('#add-desc').val('');
	// $('#coords-field').text([evt.latlng.lat, evt.latlng.lng]);
	$('#lat').val(evt.latlng.lat);
	$('#lng').val(evt.latlng.lng);
	
  // if user has email in options, supply it for him
  var userEmail = $("#user-email").val();
  if (userEmail){
    $("#add-email").val(userEmail);
  }
  else{
	  $("#add-email").val('');
  };
	window.location = '#page-add';
}

function addPlace(evt){
	var lat = $("#lat").val();
	var lng = $("#lng").val();
	var latf = parseFloat(lat);
	var lngf = parseFloat(lng);
	var coor = [latf, lngf];
	var email = $("#add-email").val();
	var properties = {
			"name" :               $("#add-placename").val(),
			"category" :           $("#add-category").val(),
			"address" :            $("#add-address").val(),
			"verified" :           [email],
			"disapproved" :        [],
			"website" :            $("#add-website").val(),
			"telephone" :          $("#add-phone").val(),
      "creator" :            email
	};
  // outside because js seemingly does not allow expressions in keys
  properties["desc:" + language] = $("#add-desc").val();
  newDBEntry(coor, properties);
  addModeOff();
}

function addDescription() {
  showDescriptionUpdater('');
}

function editDescription() {
  showDescriptionUpdater($("#desc-description").text());
}

function showDescriptionUpdater(current) {
  // refer to the add description page
  var userEmail = $("#user-email").val();
  if (userEmail) {
    $('#descadd-header').text(currentDoc.properties.name);
    // console.log($('#desc-lang').val());
    // console.log(gettextFormatted('descAddPrompt', $('#desc-lang').val()));
    console.log('<show-description-updater>');
    console.log(currentDoc);
    console.log(current);
    $('#descadd-text').val(current);
    $('#descadd-text').attr('placeholder', gettextFormatted('descAddPrompt', $('#desc-lang').val()));
    window.location = '#page-descadd';
  } else {
    alert(gettext('noEditingWithoutEmail'));
  }  
}

function saveDescription() {
  var lang = $('#desc-lang').val();
  var desc = $('#descadd-text').val();
  var userEmail = $("#user-email").val();
  if (desc) {
    props = currentDoc.properties;
    console.log('<save-desc place=' + props.name + ' desc=' + desc + '>');
    if (props['desc:' + lang] != desc) {
      props['desc:' + lang] = desc;
      props['desc:author:' + lang] = userEmail;
      console.log(currentDoc);
      localPOIDB.put(currentDoc).then(function(doc) {
        currentDoc._rev = doc.rev;
        showDescription(lang);
      }).catch(function (err) {
        oldrev = currentDoc._rev;
        currentDoc = localPOIDB.get(currentDoc._id);
        if (currentDoc._rev != oldrev)
          saveDescription();
      });
    }
  }
  initDescription();
  window.location = '#page-details';
}

function rateCurrent(how) { // after pushing "Verify"|"Not here"
  if (currentDoc) {
    var props = currentDoc.properties;
    console.log('<rate place=' + props.name + ' status=' + how + '>');
    var userEmail = $("#user-email").val();
    if (userEmail) {
      // find what to change
      var rated, derated;
      if (how) {
        rated = props.verified;
        derated = props.disapproved;
      } else {
        rated = props.disapproved;
        derated = props.verified;      
      }
      // if valued positively, remove possible negative rating
      var deI = derated.indexOf(userEmail);
      var update = false;
      // console.log(deI);
      if (deI != -1) {
        derated.splice(deI, 1); // removes from array
        update = true;
      }
      if (rated.indexOf(userEmail) == -1) { // if not rated yet
        rated.push(userEmail);
        update = true;
      }
      // console.log(props.verified);
      // console.log(props.disapproved);
      console.log(currentDoc);
      if (update) {
        localPOIDB.put(currentDoc).then(function(doc) {
          // console.log(currentDoc._rev);
          // console.log(doc);
          currentDoc._rev = doc.rev;
          updateRating(props);
        }).catch(function (err) {
          oldrev = currentDoc._rev;
          currentDoc = localPOIDB.get(currentDoc._id);
          if (currentDoc._rev != oldrev)
            rateCurrent(how);
        });
      }
    } else {
      alert(gettext('noEditingWithoutEmail'));
    }
  }  
}

function routeToCurrent() {
  console.log('<route from=' + currentPosition + ' to=' + currentDoc.geometry.coordinates + '>');
  var query = 'http://valhalla.mapzen.com/route?json={"locations":[{"lat":' + 
    currentPosition[0] + ',"lon":' + 
    currentPosition[1] + '},{"lat":' + 
    currentDoc.geometry.coordinates[0] + ',"lon":' +
    currentDoc.geometry.coordinates[1] + '}],"costing":"pedestrian"}&api_key=' + VALHALLA_KEY;
  // var query = 'http://router.project-osrm.org/viaroute?loc=' + currentPosition + '&loc=' + currentDoc.geometry.coordinates + '&instructions=true';
  $.ajax({url : query}).done(showRoute).fail(errorRouting);
}

function showRoute(doc) {
  console.log('<show-route>');
  console.log(doc);
  var legs = doc.trip.legs;
  if (typeof legs === 'undefined' || legs.length == 0) { // no route found
    errorRouting(doc.trip.status_message);
  } else {
    routeLayer.clearLayers();
    line = polyline.decode(legs[0].shape, 6);
    console.log(line);
    var route = L.polyline(line, {color: 'blue'}).addTo(routeLayer);
    route.dblclick = function (evt) {map.fitBounds(route.getBounds());};
    map.fitBounds(route.getBounds());
    cacheTiles();
    window.location = '#page-map';
  }
}

function errorRouting(err) {
  console.log('<error-route>');
  console.log(err);
  alert(gettext('routeError'));
}

function initCategories() {
  var addOpt, searchResult, filterCheck, catImg;
  addCont = $('#add-category');
  searchBox = $('#search-results');
  filterList = $('#filter-list');
  // do not initialize display names, translate() will do that anyway
  for (category in categories) {
    catImg = categoryImage(category);
    // add place dialog
    addOpt = '<option value="' + category + '" class="cat-' + category + '">categoryname</option>';
    addCont.append(addOpt);
    // into search results
    searchResult = '<li><a href="#" class="ui-btn ui-btn-icon-right ui-icon-carat-r" onclick="filterOnly(\'' + category + '\')"><span>' + catImg + '&nbsp;&nbsp;<span class="cat-' + category + '">categoryname</span></span></a></li>';
    searchBox.append(searchResult);
    // into filtering
    filterCheck = '<label for="filter-cat-' + category + '"><span>' + catImg + '&nbsp;&nbsp;<span class="cat-' + category + '">categoryname</span></span></label><input type="checkbox" name="' + category + '" id="filter-cat-' + category + '" value="' + category + '" checked="checked" class="cat-filter-check">';
    filterList.append(filterCheck);
    categories[category]['icon'] = L.icon({iconUrl: categoryImagePath(category),
      iconSize:     [32, 32],
      iconAnchor:   [16, 16], 
    })
  }
  searchBox.append('<li data-role="list-divider" role="heading" id="placelist-header">Places</li>');
  // filterList.checkboxradio('refresh');
}

function categoryImage(category) {
  return '<img class="cat-img-small" src="../images/categories_png/' + category + '.png" alt="" />';
}

function categoryImagePath(category) {
  return '../images/categories_png/' + category + '.png';
}

function filter() {
  var isChecked;
  var filtering = false;
  for (category in categories) {
    isChecked = document.getElementById('filter-cat-' + category).checked;
    categories[category].display = isChecked;
    if (!isChecked) {
      filtering = true;
    }
  }
  // show the user that he has some of the points filtered out
  $('.command-layer').toggleClass('command-button-down', filtering);
  drawPOIs();
  window.location = '#page-map';
}

function filterOnly(category) {
  $('.cat-filter-check').prop('checked', false);
  $('#filter-cat-' + category).prop('checked', true);
  filter();
}

function displayAll() {
  $('.cat-filter-check').prop('checked', true);
  var unchecked = $('#filter-list .ui-checkbox-off');
  unchecked.toggleClass('ui-checkbox-on', true);
  unchecked.toggleClass('ui-checkbox-off', false);
  filter();
}

function panTo(coors) {
  map.panTo(coors);
  window.location = '#page-map';  
}

function goOnline() {
  if (tileLayer.isOffline())
    tileLayer.goOnline();
}

function goOffline() {
  if (tileLayer.isOnline())
    tileLayer.goOffline();
}

function cacheTiles(recurse) {
  if (typeof recurse === 'undefined') recurse = true;
  // caches the tiles of the current view down to maxZoom level
  var tileList = tileLayer.calculateXYZListFromBounds(map.getBounds(), map.getZoom(), MAX_CACHE_ZOOM);
  tileLayer.downloadXYZList(tileList, false);
  tileLayer.getDiskUsage(function (files, bytes) {
    if (bytes > MAX_CACHE_SIZE) {
      tileLayer.emptyCache();
      cacheTiles(false);
    }
  });
}