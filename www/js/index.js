document.addEventListener('deviceready', deviceIsReady, false);

var map;
var poiLayer = L.layerGroup();
var remotePOIDB;
var localPOIDB;

function deviceIsReady() {
  console.log('<deviceIsReady>');
  $('#page-map').one('pageshow', initMap);
  $('#add-mode-off').hide();
  // $.one('pageshow', initMap);
  // db setup
  remotePOIDB = new PouchDB('http://gi88.geoinfo.tuwien.ac.at:5984/refu');
  localPOIDB = new PouchDB('mappoint');
  initSync();
  console.log('</deviceIsReady>');
}

function initMap() {
  console.log('<initMap>');
  map = L.map('map');
  // tiles
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    maxZoom: 16,
    attribution: '&copy; <a href="http://osm.org">OSM contributors</a>'
  }).addTo(map);
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

// var app = {
    // // Application Constructor
    // initialize: function() {
        // this.bindEvents();
    // },
    // // Bind Event Listeners
    // //
    // // Bind any events that are required on startup. Common events are:
    // // 'load', 'deviceready', 'offline', and 'online'.
    // bindEvents: function() {
        
    // },
    // // deviceready Event Handler
    // //
    // // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // // function, we must explicitly call 'app.receivedEvent(...);'
    // onDeviceReady: function() {
        // app.receivedEvent('deviceready');
    // },
    // // Update DOM on a Received Event
    // receivedEvent: function(id) {
        // var parentElement = document.getElementById(id);
        // var listeningElement = parentElement.querySelector('.listening');
        // var receivedElement = parentElement.querySelector('.received');

        // listeningElement.setAttribute('style', 'display:none;');
        // receivedElement.setAttribute('style', 'display:block;');

        // console.log('Received Event: ' + id);
    // }
// };

// app.initialize();