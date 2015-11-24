// $(weAreReady);
$(weAreReady);
var map;
var trackline;

function locateme() {
  navigator.geolocation.getCurrentPosition(foundLocation);
}

function foundLocation(loc) {
  console.log(loc);
  var lat = loc.coords.latitude;
  var lon = loc.coords.longitude;
  map.setView([lat, lon], 19);
}

function addlocation(event) {
  console.log('new location');
  console.log(event);
  var lat = event.latlng.lat;
  var lon = event.latlng.lng;
  // L.marker([lat, lon]).bindPopup('New Marker').addTo(map);
  // trackline.addLatLng([lat, lon]);
  // trackline.redraw();
  return false;
}

function initMap() {
  map = L.map('map');

  var osmLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'});

  osmLayer.addTo(map);

  remoteDB = new PouchDB('128.130.78.185:5984/refu');
  remoteDB.query('views/all').then(displayPOIs).catch(function (err) {console.log(err);});

  map.setView([48.2, 16.36], 13);
  // L.marker([51.5, -0.09]).addTo(map)
      // .bindPopup('A pretty CSS3 popup.<br /> Easily customizable.')
      // .openPopup();

  // trackline = L.polyline([]);
  // trackline.addTo(map);

  map.on('click', addlocation);
}

function weAreReady() {
  console.log('webpage ready');
  initMap();
  // $('#mainpage').one('pageshow', function() {initMap();});
}