
var remotePOIDB = new PouchDB('http://gi88.geoinfo.tuwien.ac.at:5984/refu_farsitest');
var localPOIDB = new PouchDB('den11');
var category = [internet,basic,work,transport,free,education,health,extra,legal]								
function cat(){
	for(var i = 0; i < category.length; i++){
		var cat = category[i];
console.log(i)(cat)}}

function initsync() {
  var options = {live: true, retry: true};
  var sync = PouchDB.sync(localPOIDB, remotePOIDB, options)
    .on('change', function(info) {
      console.log('<sync=change>');
    })
    .on('paused', function(info) {
 
      console.log('<sync=paused>');
    })
    .on('active', function(info) {
      console.log('<sync=active>');
    })
    .on('error', function(info) {
      console.log('<sync=error>');
    })
    .on('complete', function(info) {
      console.log('<sync=complete>');
    });
}
var errorStoring ="err";

//basic,work,culture,sports and extra does not have seperated website-telephone input. All info has been stored in "Kontakt"
function basic_(){
	for(var i = 0; i < basic.length; i++) {

    
	var doc = {
	"_id":							basic[i].properties.name.replace(/\s/g, "").slice(0,10) + parseInt(Math.random() * 1000000000000).toString(16),
	"geometry" : 					 {"type" : "Point", 
	
	"coordinates" : [basic[i].geometry.coordinates[1], basic[i].geometry.coordinates[0]]
	
	},  
	"properties:"	:					{
			"name" 	:            	basic[i].properties.name,
			"category" :         	"basic",
			"address" :           	null,
			"verified" :          	[],
			"disapproved" :        	[],
			"website" :           	basic[i].properties.Kontakt,
			"desc:en":			 	basic[i].properties.Description,
			"desc:de": 				basic[i].properties.Beschreibung,
			"desc:fa":				basic[i].properties.اطلاعات,			
			"telephone" :         	null,
			"creator" :            	"ardacanuyanik@gmail.com"
		}
		
		}
	console.log(i);
	localPOIDB.put(doc).catch(errorStoring);
		}
};
function sport_(){
	for(var i = 0; i < sport.length; i++) {

    
	var doc = {
	"_id":							sport[i].properties.name.replace(/\s/g, "").slice(0,10) + parseInt(Math.random() * 1000000000000).toString(16),
	"geometry" : 					 {"type" : "Point", 
	
	"coordinates" : [sport[i].geometry.coordinates[1], sport[i].geometry.coordinates[0]]
	
	},  
	"properties"	:					{
			"name" 	:            	sport[i].properties.name,
			"category" :         	"sport",
			"address" :           	null,
			"verified" :          	[],
			"disapproved" :        	[],
			"website" :           	sport[i].properties.Kontakt,
			"desc:en":			 	sport[i].properties.Description,
			"desc:de": 				sport[i].properties.Beschreibung,
			"desc:fa":				sport[i].properties.اطلاعات,
			"telephone" :         	null,
			"creator" :            	"ardacanuyanik@gmail.com"
		}
		
		}
	console.log(i);
	localPOIDB.put(doc).catch(errorStoring);
		}
};
function culture_(){
	for(var i = 0; i < culture.length; i++) {

    
	var doc = {
	"_id":							culture[i].properties.name.replace(/\s/g, "").slice(0,10) + parseInt(Math.random() * 1000000000000).toString(16),
	"geometry" : 					 {"type" : "Point", 
	
	"coordinates" : [culture[i].geometry.coordinates[1], culture[i].geometry.coordinates[0]]
	
	},  
	"properties"	:					{
			"name" 	:            	culture[i].properties.name,
			"category" :         	"culture",
			"address" :           	null,
			"verified" :          	[],
			"disapproved" :        	[],
			"website" :           	culture[i].properties.Kontakt,
			"desc:en":			 	culture[i].properties.Description,
			"desc:de": 				culture[i].properties.Beschreibung,	
			"desc:fa":				culture[i].properties.اطلاعات,
			"telephone" :         	null,
			"creator" :            	"ardacanuyanik@gmail.com"
		}
		
		}
	console.log(i);
	localPOIDB.put(doc).catch(errorStoring);
		}
};

function work_(){
	for(var i = 0; i < work.length; i++) {

    
	var doc = {
	"_id":							work[i].properties.name.replace(/\s/g, "").slice(0,10) + parseInt(Math.random() * 1000000000000).toString(16),
	"geometry" : 					 {"type" : "Point", 
	
	"coordinates" : [work[i].geometry.coordinates[1], work[i].geometry.coordinates[0]]
	
	},  
	"properties"	:					{
			"name" 	:            	work[i].properties.name,
			"category" :         	"work",
			"address" :           	null,
			"verified" :          	[],
			"disapproved" :        	[],
			"website" :           	work[i].properties.Kontakt,
			"desc:en":			 	work[i].properties.Description,
			"desc:de": 				work[i].properties.Beschreibung,	
			"desc:fa":				work[i].properties.اطلاعات,
			"telephone" :         	null,
			"creator" :            	"ardacanuyanik@gmail.com"
		}
		
		}
	console.log(i);
	localPOIDB.put(doc).catch(errorStoring);
		}
};
function extra_(){
	for(var i = 0; i < extra.length; i++) {

    
	var doc = {
	"_id":							extra[i].properties.name.replace(/\s/g, "").slice(0,10) + parseInt(Math.random() * 1000000000000).toString(16),
	"geometry" : 					 {"type" : "Point", 
	
	"coordinates" : [extra[i].geometry.coordinates[1], extra[i].geometry.coordinates[0]]
	
	},  
	"properties"	:					{
			"name" 	:            	extra[i].properties.name,
			"category" :         	"extra",
			"address" :           	null,
			"verified" :          	[],
			"disapproved" :        	[],
			"website" :           	extra[i].properties.Kontakt,
			"desc:en":			 	extra[i].properties.Description,
			"desc:de": 				extra[i].properties.Beschreibung,
			"desc:fa":				extra[i].properties.اطلاعات,			
			"telephone" :         	null,
			"creator" :            	"ardacanuyanik@gmail.com"
		}
		
		}
	console.log(i);
	localPOIDB.put(doc).catch(errorStoring);
		}
};


function intern(){
	for(var i = 0; i < internet.length; i++) {

    
	var doc = {
	"_id":							internet[i].properties.name.replace(/\s/g, "").slice(0,10) + parseInt(Math.random() * 1000000000000).toString(16),
	"geometry" : 					 {"type" : "Point", 
	
	"coordinates" : [internet[i].geometry.coordinates[1], internet[i].geometry.coordinates[0]]
	
	},  
	"properties"	:					{
			"name" 	:            	internet[i].properties.name,
			"category" :         	"Internet",
			"address":				internet[i].properties.Adresse,
			"desc:en":			 	internet[i].properties.Description,
			"desc:de": 				internet[i].properties.Beschreibung,	
			"desc:fa":				internet[i].properties.اطلاعات,
			"telephone" :         	internet[i].properties.Telefon,
			"website" :           	[internet[i].properties.Website,internet[i].properties.Facebook],
			"verified" :          	[],
			"disapproved" :        	[],
			"creator" :            	"ardacanuyanik@gmail.com"
		}
		
		}
	console.log(i);
	localPOIDB.put(doc).catch(errorStoring);
		}
};
function health_(){
	for(var i = 0; i < health.length; i++) {
	console.log('sd')

    
	var doc = {
	"_id":							health[i].properties.name.replace(/\s/g, "").slice(0,10) + parseInt(Math.random() * 1000000000000).toString(16),
	"geometry" : 					 {"type" : "Point", 
	
	"coordinates" : [health[i].geometry.coordinates[1], health[i].geometry.coordinates[0]]
	
	},  
	"properties"	:					{
			"name" 	:            	health[i].properties.name,
			"category" :         	"health",
			"address":				health[i].properties.Adresse,
			"desc:en":			 	health[i].properties.Description,
			"desc:de": 				health[i].properties.Beschreibung,	
			"desc:fa":				health[i].properties.اطلاعات,
			"telephone" :         	health[i].properties.Telefon,
			"website" :           	[health[i].properties.Website,health[i].properties.Facebook],
			"verified" :          	[],
			"disapproved" :        	[],
			"creator" :            	"ardacanuyanik@gmail.com"
		}
		
		}
	console.log(i);
	localPOIDB.put(doc).catch(errorStoring);
		}
};
function legal_(){
	for(var i = 0; i < legal.length; i++) {
	console.log('sd')

    
	var doc = {
	"_id":							legal[i].properties.name.replace(/\s/g, "").slice(0,10) + parseInt(Math.random() * 1000000000000).toString(16),
	"geometry" : 					 {"type" : "Point", 
	
	"coordinates" : [legal[i].geometry.coordinates[1], legal[i].geometry.coordinates[0]]
	
	},  
	"properties"	:					{
			"name" 	:            	legal[i].properties.name,
			"category" :         	"legal",
			"address":				legal[i].properties.Adresse,
			"desc:en":			 	legal[i].properties.Description,
			"desc:de": 				legal[i].properties.Beschreibung,	
			"desc:fa":				legal[i].properties.اطلاعات,
			"telephone" :         	legal[i].properties.Telefon,
			"website" :           	[legal[i].properties.Website,legal[i].properties.Facebook],
			"verified" :          	[],
			"disapproved" :        	[],
			"creator" :            	"ardacanuyanik@gmail.com"
		}
		
		}
	console.log(i);
	localPOIDB.put(doc).catch(errorStoring);
		}
};

function transport_(){
	for(var i = 0; i < transport.length; i++) {
	console.log('sd')

    
	var doc = {
	"_id":							transport[i].properties.name.replace(/\s/g, "").slice(0,10) + parseInt(Math.random() * 1000000000000).toString(16),
	"geometry" : 					 {"type" : "Point", 
	
	"coordinates" : [transport[i].geometry.coordinates[1], transport[i].geometry.coordinates[0]]
	
	},  
	"properties"	:					{
			"name" 	:            	transport[i].properties.name,
			"category" :         	"transport",
			"address":				transport[i].properties.Adresse,
			"desc:en":			 	transport[i].properties.Description,
			"desc:de": 				transport[i].properties.Beschreibung,
			"desc:fa":				transport[i].properties.اطلاعات,			
			"telephone" :         	transport[i].properties.Telefon,
			"website" :           	[transport[i].properties.Website,transport[i].properties.Facebook],
			"verified" :          	[],
			"disapproved" :        	[],
			"creator" :            	"ardacanuyanik@gmail.com"
		}
		
		}
	console.log(i);
	localPOIDB.put(doc).catch(errorStoring);
		}
};
function education_(){
	for(var i = 0; i < education.length; i++) {

	var doc = {
	"_id":							education[i].properties.name.replace(/\s/g, "").slice(0,10) + parseInt(Math.random() * 1000000000000).toString(16),
	"geometry" : 					 {"type" : "Point", 
	
	"coordinates" : [education[i].geometry.coordinates[1], education[i].geometry.coordinates[0]]
	
	},  
	"properties"	:					{
			"name" 	:            	education[i].properties.name,
			"category" :         	"education",
			"address":				education[i].properties.Adresse,
			"desc:en":			 	education[i].properties.Description,
			"desc:de": 				education[i].properties.Beschreibung,
			"desc:fa":				education[i].properties.اطلاعات,
			"telephone" :         	education[i].properties.Telefon,
			"website" :           	[education[i].properties.Website,education[i].properties.Facebook],
			"verified" :          	[],
			"disapproved" :        	[],
			"creator" :            	"ardacanuyanik@gmail.com"
		}
		
		}
		console.log(i);
	localPOIDB.put(doc).catch(errorStoring);
		}
};

function free_(){
	for(var i = 0; i < free.length; i++) {

	var doc = {
	"_id":							free[i].properties.name.replace(/\s/g, "").slice(0,10) + parseInt(Math.random() * 1000000000000).toString(16),
	"geometry" : 					 {"type" : "Point", 
	
	"coordinates" : [free[i].geometry.coordinates[1], free[i].geometry.coordinates[0]]
	
	},  
	"properties"	:					{
			"name" 	:            	free[i].properties.name,
			"category" :         	"free",
			"address":				free[i].properties.Adresse,
			"desc:en":			 	free[i].properties.Description,
			"desc:de": 				free[i].properties.Beschreibung,
			"desc:fa":				free[i].properties.اطلاعات,
			"telephone" :         	free[i].properties.Telefon,
			"website" :           	[free[i].properties.Website,free[i].properties.Facebook],
			"verified" :          	[],
			"disapproved" :        	[],
			"creator" :            	"ardacanuyanik@gmail.com"
		}
		
		}
		console.log(i);
	localPOIDB.put(doc).catch(errorStoring);
		}
};

/*
function jsontocouch(){
	for(var i=0; i< category.length; i++){
		var cat = [category[i]];
		for(var i = 0; i < cat[i].length; i++) {
			console.log(cat);
		var doc = {
		"_id":							cat[i].properties.name.replace(/\s/g, "").slice(0,10) + parseInt(Math.random() * 1000000000000).toString(16),
		"geometry" : 					 {"type" : "Point", 
		
		"coordinates" : [cat[i].geometry.coordinates[1], cat[i].geometry.coordinates[0]]
		
		},  
		"properties"	:					{
				"name" 	:            	cat[i].properties.name,
				"category" :         	cat,
				"address" :           	null,
				"verified" :          	null,
				"disapproved" :        	[],
				"website" :           	cat[i].properties.Kontakt,
				"desc:en":			 	cat[i].properties.Description,
				"desc:de": 				cat[i].properties.Beschreibung,	
				"telephone" :         	null,
				"address":				cat[i],
				"creator" :            	"ardacanuyanik@gmail.com"
			}
			
			}
		console.log(i)(cat[i]);
		//localPOIDB.put(doc).catch(errorStoring);
			};
	}
};

*/

    
