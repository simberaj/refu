document.addEventListener('deviceready', deviceIsReady, false);

var map;
var poiLayer = L.layerGroup();
var remotePOIDB;
var localPOIDB;

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
    this.expandButton = createButton('command.button command-expand', this.collapsed, {title: 'More controls...'});
    this.expandButton.onclick = this.expand;
    // this.expandButton.innerHTML = 'v';
    this.expanded = L.DomUtil.create('div', 'leaflet-bar container-expanded', container);
    this.expanded.style.display = 'none';
    // $('.container-expanded').hide();
    this.collapseButton = createButton('command-button command-collapse', this.expanded, {title: 'Locate me'});
    this.collapseButton.onclick = this.collapse;
    this.locateButton = createButton('command-button command-locate', this.expanded, {title: 'Locate me'});
    this.layerButton = createButton('command-button command-layer', this.expanded, {title: 'Choose what to display'});
    this.searchButton = createButton('command-button command-search', this.expanded, {title: 'Search'});
    this.addButton = createButton('command-button command-add', this.expanded, {title: 'Add place'});
    this.optionsButton = createButton('command-button command-options', this.expanded, {title: 'Options'});
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
  // $('#page-map').one('pageshow', initMap);
  $('#add-mode-off').hide();
  // $.one('pageshow', initMap);
  // db setup
  remotePOIDB = new PouchDB('http://gi88.geoinfo.tuwien.ac.at:5984/refu');
  localPOIDB = new PouchDB('mappoint');
  initSync();
  initMap();
  console.log('</deviceIsReady>');
}

function initMap() {
  console.log('<initMap>');
  map = L.map('map');
  // tiles
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: '&copy; <a href="http://osm.org">OSM contributors</a>'
  }).addTo(map);
  L.control.scale({imperial : false}).addTo(map);
  L.control.commandpanel().addTo(map);
  // map.addControl(new controlPanel());
  // locate the device
  map.locate({setView: true, maxZoom: 16});
  // add the POIs
  poiLayer.addTo(map);
  drawPOIs();
  console.log('</initMap>');
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

function addModeOn() {
  map.on('click', addPlace);
  $('#add-mode-off').show();
  $('#add-mode-on').hide();  
}

function addModeOff() {
  map.removeEventListener('click');
  $('#add-mode-off').hide();
  $('#add-mode-on').show();  
}

function addPlace(evt) {
  console.log(evt);
  var name = prompt("Name of the Place:");
  if (name != "") {
    var creator = device.uuid;
    if (creator == undefined) {
      creator = 'browser';
    }
    newDBEntry([evt.latlng.lat, evt.latlng.lng], {"name" : name, "creator" : creator});
  }
  addModeOff();
}

function newDBEntry(coor, props) {
  var doc = {"_id" : props.name.replace(/\s/g, "") + (Math.random() * 1000000),
    "type" : "Feature",
    "geometry" : {"type" : "Point", "coordinates" : coor},
    "properties" : props
  };
  localPOIDB.put(doc).then(refresh).catch(errorStoring);
}

function refresh(evt) {
  drawPOIs();
}

function errorStoring(err) {
  console.log(err);
  alert("Error storing the point.");
}

function drawPOIs() {
  localPOIDB.query('poi/allpoi', {include_docs : true, attachments : true}).then(
    function(results) {
      poiLayer.clearLayers();
      for (var entrynumber in results.rows) {
        var entry = results.rows[entrynumber];
        var marker = L.marker(entry.value.geometry.coordinates).addTo(poiLayer);
        marker.bindPopup(entry.value.properties.name);
      };
    }).catch(function (error) {
        console.log(error);
    });
}