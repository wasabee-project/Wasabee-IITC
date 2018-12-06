// ==UserScript==
// @id             iitc-plugin-arc
// @name           IITC plugin: Arc
// @category       Layer
// @version        1.67
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      http://ingress.wolflight.us/Arcs/arc.meta.js
// @downloadURL    http://ingress.wolflight.us/Arcs/arc.user.js
// @description    Allows you to create Great Circle arcs to plan long links safely
// @include        *://*.ingress.com/intel*
// @include        *://*.ingress.com/mission/*
// @include        *://intel.ingress.com/*
// @match          *://*.ingress.com/intel*
// @match          *://*.ingress.com/mission/*
// @match          *://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper() {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

// PLUGIN START ////////////////////////////////////////////////////////
// use own namespace for plugin
/* jshint shadow:true */
window.plugin.arcs = function() {};
window.plugin.arcs.loadExternals = function() {
	try { console.log('Loading arc.js now'); } catch(e) {}

    //Lets create an independent layer for this hey?
    //create a leaflet FeatureGroup to hold arcs
    window.plugin.arcs.drawlayer = new L.FeatureGroup();

    window.addLayerGroup('Arcs', window.plugin.arcs.drawlayer, true);

	/* jshint ignore:start */
	/* arc.js by Dane Springmeyer, https://github.com/springmeyer/arc.js */
	var D2R=Math.PI/180,R2D=180/Math.PI,Coord=function(c,e){this.lon=c;this.lat=e;this.x=D2R*c;this.y=D2R*e;};Coord.prototype.view=function(){return String(this.lon).slice(0,4)+","+String(this.lat).slice(0,4);};Coord.prototype.antipode=function(){return new Coord(0>this.lon?180+this.lon:-1*(180-this.lon),-1*this.lat);};var LineString=function(){this.coords=[];this.length=0;};LineString.prototype.move_to=function(c){this.length++;this.coords.push(c);};
    var Arc=function(c){this.properties=c||{};this.geometries=[];};
    Arc.prototype.json=function(){if(0>=this.geometries.length)return{geometry:{type:"LineString",coordinates:null},type:"Feature",properties:this.properties};if(1==this.geometries.length)return{geometry:{type:"LineString",coordinates:this.geometries[0].coords},type:"Feature",properties:this.properties};var c=[];for(i=0;i<this.geometries.length;i++)c.push(this.geometries[i].coords);return{geometry:{type:"MultiLineString",coordinates:c},type:"Feature",properties:this.properties};};
    Arc.prototype.wkt=function(){var c="";for(i=0;i<this.geometries.length;i++){if(0===this.geometries[i].coords.length)return"LINESTRING(empty)";var e="LINESTRING(";this.geometries[i].coords.forEach(function(a,c){e+=a[0]+" "+a[1]+",";});c+=e.substring(0,e.length-1)+")";}return c;};
    var GreatCircle=function(c,e,a){this.start=c;this.end=e;this.properties=a||{};a=this.start.x-this.end.x;a=Math.pow(Math.sin((this.start.y-this.end.y)/2),2)+Math.cos(this.start.y)*Math.cos(this.end.y)*Math.pow(Math.sin(a/2),2);this.g=2*Math.asin(Math.sqrt(a));if(this.g==Math.PI)throw Error("it appears "+c.view()+" and "+e.view()+" are 'antipodal', e.g diametrically opposite, thus there is no single route but rather infinite");if(isNaN(this.g))throw Error("could not calculate great circle between "+
    c+" and "+e);};
    GreatCircle.prototype.interpolate=function(c){var e=Math.sin((1-c)*this.g)/Math.sin(this.g),a=Math.sin(c*this.g)/Math.sin(this.g);c=e*Math.cos(this.start.y)*Math.cos(this.start.x)+a*Math.cos(this.end.y)*Math.cos(this.end.x);var g=e*Math.cos(this.start.y)*Math.sin(this.start.x)+a*Math.cos(this.end.y)*Math.sin(this.end.x),e=e*Math.sin(this.start.y)+a*Math.sin(this.end.y),e=R2D*Math.atan2(e,Math.sqrt(Math.pow(c,2)+Math.pow(g,2)));return[R2D*Math.atan2(g,c),e];};
    GreatCircle.prototype.Arc=function(c,e){var a=[];if(2>=c)a.push([this.start.lon,this.start.lat]),a.push([this.end.lon,this.end.lat]);else for(var g=1/(c-1),b=0;b<c;b++){var k=this.interpolate(g*b);a.push(k)}for(var d=!1,h=0,b=1;b<a.length;b++){var g=a[b-1][0],k=a[b][0],m=Math.abs(k-g);350<m&&(170<k&&-170>g||170<g&&-170>k)?d=!0:m>h&&(h=m)}g=[];if(d&&10>h)for(d=[],g.push(d),b=0;b<a.length;b++)if(k=parseFloat(a[b][0]),0<b&&350<Math.abs(k-a[b-1][0])){var f=parseFloat(a[b-1][0]),h=parseFloat(a[b-1][1]),
    l=parseFloat(a[b][0]),m=parseFloat(a[b][1]);if(-180<f&&-170>f&&180==l&&b+1<a.length&&-180<a[b-1][0]&&-170>a[b-1][0])d.push([-180,a[b][1]]),b++,d.push([a[b][0],a[b][1]]);else if(170<f&&180>f&&-180==l&&b+1<a.length&&170<a[b-1][0]&&180>a[b-1][0])d.push([180,a[b][1]]),b++,d.push([a[b][0],a[b][1]]);else{if(-170>f&&170<l)var n=f,f=l,l=n,n=h,h=m,m=n;170<f&&-170>l&&(l+=360);180>=f&&180<=l&&f<l?(f=(180-f)/(l-f),h=f*m+(1-f)*h,d.push([170<a[b-1][0]?180:-180,h]),d=[],d.push([170<a[b-1][0]?-180:180,h])):d=[];
    g.push(d);d.push([k,a[b][1]])}}else d.push([a[b][0],a[b][1]]);else for(d=[],g.push(d),b=0;b<a.length;b++)d.push([a[b][0],a[b][1]]);a=new Arc(this.properties);for(b=0;b<g.length;b++)for(k=new LineString,a.geometries.push(k),d=g[b],h=0;h<d.length;h++)k.move_to(d[h]);return a};if("undefined"===typeof window)module.exports.Coord=Coord,module.exports.Arc=Arc,module.exports.GreatCircle=GreatCircle;else{var arc={};arc.Coord=Coord;arc.Arc=Arc;arc.GreatCircle=GreatCircle};
	/* jshint ignore:end */

	window.plugin.arcs.arc = arc;
	$('#toolbox').append(' <a id="arcButton" onclick="window.plugin.arcs.draw()" title="Start an arc from this portal">Start arc</a>');
	$('#toolbox').append(' <a id="recButton" onclick="window.plugin.arcs.crosslinkRecord()" title="Toggle crosslink recording">Arc REC xlinks</a>');
	$('#toolbox').append(' <a onclick="window.plugin.arcs.list()" title="Arc details">Arc List</a>');
	$('#toolbox').append(' <a onclick="window.plugin.arcs.dialogDrawer()" title="Draw lines/triangles between bookmarked portals">Arc Auto Draw</a>');
	$('#toolbox').append(' <a id="anchorButton" onclick="window.plugin.arcs.anchorShift()" title="Shift all arcs from one portal to another">Anchor Shift Start</a>');
	$('#toolbox').append(' <a id="arcRangeButton" onclick="window.plugin.arcs.rangePopup()" title="Range Calculator">Arc Range</a>');

	//list of all links on map
	window.plugin.arcs.link_list = [];
	window.plugin.arcs.blockerRecording = false;


	var version_number = 12;
	var update_message = 'Added colour choice and persistent Xlinks.<br/>--Remember this tool is enlightened only.';
	var arc_version = JSON.parse(localStorage.getItem('arc_version' ));
	if (arc_version===null||arc_version<version_number)
	{
		dialog({
		html:'<div>'+update_message+'</div>',
		dialogClass:'ui-dialog-update',
		title:'Arcs Update',
		width: 500
		});
		localStorage.setItem( 'arc_version', JSON.stringify(version_number) );
	}



	var arc_list = JSON.parse(localStorage.getItem('arc_list' ));
	if (arc_list===null)
	{
		arc_list = [];
		localStorage.setItem( 'arc_list', JSON.stringify(arc_list) );
	}
	else
	{
		//cycle through and print them on load.
		for (var m=0;m<arc_list.length;m++)
		{
			var link = arc_list[m];
			var startCoord = new window.plugin.arcs.arc.Coord(link.startPortal.lon, link.startPortal.lat);
			var stopCoord = new window.plugin.arcs.arc.Coord(link.endPortal.lon, link.endPortal.lat);
			window.plugin.arcs.create(startCoord, stopCoord, link);
		}
	}
	//Lets make our table pretty CSS!!!
	  $('head').append('<style>' +
	'#linkslist table {margin-top:5px; border-collapse: collapse; empty-cells: show; width:100%; clear: both;}' +
	'#linkslist table td { text-align: left;}' +
	'#linkslist table td:nth-child(3) { text-align: right;}' +
	'#linkslist .portalTitle { display: inline-block; width: 160px !important; min-width: 160px !important; max-width: 160px !important; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }' +
	'#rangecalc table {margin-top:5px; border-collapse: collapse; empty-cells: show; width:100%; clear: both;}' +
	'#rangecalc table td { text-align: center; user-select: none; -webkit-user-select: none;}' +
	'#leftarcbutton a {display: block;} #arcbutton a.active {	background-color: #BBB;}' +
	'</style>');

	window.plugin.arcs.addArcsButtons();

	//Popups for errors
	var ARCNotifcation = '.ARCNotifcation{width:200px;height:20px;height:auto;position:absolute;left:50%;margin-left:-100px;top:50%;z-index:10000;background-color: #EE3838;color: #F0F0F0;font-family: Calibri;font-size: 20px;padding:10px;text-align:center;border-radius: 2px;-webkit-box-shadow: 0px 0px 24px -1px rgba(56, 56, 56, 1);-moz-box-shadow: 0px 0px 24px -1px rgba(56, 56, 56, 1);box-shadow: 0px 0px 24px -1px rgba(56, 56, 56, 1);}';
    $('head').append("<style>" + ARCNotifcation + "</style>");
	$('body').append("<div id='ArcError1' class='ARCNotifcation' style='display:none'>Portal Details Not Yet Loaded</div>");
	$('body').append("<div id='ArcError2' class='ARCNotifcation' style='display:none'>Same Start And End Portal</div>");
	$('body').append("<div id='ArcRefresh' class='ARCNotifcation' style='display:none'>Building Request</div>");

	$('head').append('<style type="text/css">.plugin-arcs-crosslinks-stats {background-color: rgba(8, 48, 78, 0.9);border-bottom: 0;border-top: 1px solid #20A8B1;border-left: 1px solid #20A8B1;top: 0;color: #ffce00;font-size: 13px;padding: 4px;position: fixed; left: 47%; z-index: 3002;box-sizing: border-box;margin-right: 312px;text-overflow: ellipsis;white-space: nowrap;overflow: hidden;}</style>');
	$('body').append('<div class="plugin-arcs-crosslinks-stats"></div>');
	$('.plugin-arcs-crosslinks-stats').html("Arcs Blockers - R: --&nbsp;&nbsp;&nbsp;E: --").hide();

	// Check if Arc Cross Links group is turned on or first time user. If either one of them is true, show crosslink counter
	if(JSON.parse(localStorage['ingress.intelmap.layergroupdisplayed'])["Arc Cross Links"] || typeof JSON.parse(localStorage['ingress.intelmap.layergroupdisplayed'])["Arc Cross Links"] == "undefined"){
		$('.plugin-arcs-crosslinks-stats').show();
	}

	$(document).ready(function() {
		console.log('Loading Arcs Hooks');
		if(window.plugin.bookmarks){
			window.addHook('pluginBkmrksEdit', arc_hook_pluginBkmrksEdit );
			window.addHook('pluginBkmrksSyncEnd', arc_hook_pluginBkmrksSyncEnd );
		}
		console.log('Done Loading Arcs Hooks');
    });
	window.plugin.arcs.createLayer();
	console.log('Done');

};

window.plugin.arcs.addArcsButtons = function(){
	window.plugin.arcs.arcsButtons = L.Control.extend({
			options:{
					position: 'topleft'
			},
			onAdd: function (map) {
					var container = L.DomUtil.create('div', 'leaflet-arcs leaflet-bar');
					$(container).append('<a id="leftarcbutton" href="javascript: void(0);" class="arcs-control" title="Arcs Control">A</a>').on('click', '#leftarcbutton' , function() {
							window.plugin.arcs.draw();
						});
					$(container).append('<a id="arcCrosslinkCheck" href="javascript: void(0);" class="arcs-control" title="Arcs Crosslink Check">X</a>').on('click', '#arcCrosslinkCheck', function() {
							window.plugin.arcs.checkAllLinks();
						});
					$(container).append('<a id="arcListButton" href="javascript: void(0);" class="arcs-control" title="Arc List">L</a>').on('click', '#arcListButton', function() {
							window.plugin.arcs.list();
						});
					return container;
			}
	});
	map.addControl(new window.plugin.arcs.arcsButtons());
};

function arc_hook_pluginBkmrksEdit(data){
   //Update Bookmarklist on BkmrksEdit
	if(window.DIALOGS['dialog-arcs-dialog-window']){
	   window.plugin.arcs.dialogDrawer();
	}
}

function arc_hook_pluginBkmrksSyncEnd(data){
 //Update Bookmarklist on BkmrksSyncEnd
	if(window.DIALOGS['dialog-arcs-dialog-window']){
	   window.plugin.arcs.dialogDrawer();
	}
}

// hotkey
function doc_keyUp(e) {

    // this would test for whichever key is 40 and the ctrl key at the same time
    if (e.altKey && e.keyCode == 65) {
        // call your function to do the thing
        window.plugin.arcs.draw();
    }
}
// register the handler
document.addEventListener('keyup', doc_keyUp, false);


window.plugin.arcs.clear = function() {
	//clears storage array and refreshes page
	if (confirm('Are you sure you want to remove all arcs')) {
		arc_list =[];
		localStorage.setItem( 'arc_list', JSON.stringify(arc_list) );
		//refresh the layer group
		window.plugin.arcs.drawlayer.clearLayers();
		window.plugin.arcs.link_list = [];
		// Run a crosslink check to remove all crossing links
		window.plugin.arcs.checkAllLinks();
		//now to close the dialogue
		window.plugin.arcs.list();
	}
};

window.plugin.arcs.distance = function(link) {
	//How far between portals.
	var R = 6367; // km

	lat1 = link.startPortal.lat;
	lon1 = link.startPortal.lon;
	lat2 = link.endPortal.lat;
	lon2 = link.endPortal.lon;

	var dLat = (lat2-lat1) * Math.PI / 180;
	var dLon = (lon2-lon1) * Math.PI / 180;
	var lat1 = lat1 * Math.PI / 180;
	var lat2 = lat2 * Math.PI / 180;
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c;
	d = Math.round(d * 1000) / 1000;
	return d;
};

window.plugin.arcs.create = function(startCoord, stopCoord, link, xLink) {
	//draws the link on the map
	if (typeof xLink === 'undefined') { xLink = false; }
	//if colour is set use that else use red as default
	//this preserves old plans
	if (link.color)
	{
		colour = link.color;
	}
	else
	{
		colour = "#ff0000";
	}


	if (xLink)
	{
		myStyle = {
			"color": colour,
			"weight": 5,
			"opacity": 0.7,
			"dashArray": [10, 10, 1, 10]
		};
	}
	else
	{
		myStyle = {
			"color": colour,
			"weight": 5,
			"opacity": 0.7
		};
	}
	var gc = new window.plugin.arcs.arc.GreatCircle(startCoord, stopCoord);
	var geojson_feature = gc.Arc(Math.round(link.distance)).json();
	var line = new L.geoJson(geojson_feature,{style: myStyle}).addTo(window.plugin.arcs.drawlayer);
	//map.addLayer(line);
	window.plugin.arcs.link_list.push(line);
	bindString='';
	bindString+='<div>Length: <a onclick="window.plugin.arcs.rangePopup('+link.distance+')">'+link.distance+'</a>km<br/>';
	bindString+='Start: '+window.plugin.arcs.getPortalLink(link.startPortal);
	bindString+='End: '+window.plugin.arcs.getPortalLink(link.endPortal);
	bindString+='<hr/><a onclick="window.plugin.arcs.extend('+link.endPortal.lat+','+link.endPortal.lon+','+link.startPortal.lat+','+link.startPortal.lon+')">Great Circle</a>';
	bindString+='<hr/><a id="arc_remove">Remove Arc</a></div>';

	line.bindPopup(bindString);
	line.on('contextmenu', function() { window.plugin.arcs.kill_line(line,link); } );
    line.on('popupopen', function() { document.getElementById("arc_remove").onclick = function () {window.plugin.arcs.kill_line(line,link);map.closePopup();} ;} );
};

window.plugin.arcs.kill_line = function(line,link) {
	map.removeLayer(line);
	//remove from storage
	var arc_list = JSON.parse(localStorage.getItem('arc_list' ));
	for (var i=0;i<arc_list.length;i++)
			{
					var link_test = arc_list[i];
					if (JSON.stringify(link_test) === JSON.stringify(link))
					{
							j=i;
					}
			}
	arc_list.splice(j,1);
	localStorage.setItem( 'arc_list', JSON.stringify(arc_list) );
};

window.plugin.arcs.getPortalLink = function(portal) {
	var latlng = [portal.lat, portal.lon].join();
	var jsSingleClick = 'window.renderPortalDetails(\''+portal.guid+'\');return false';
	var jsDoubleClick = 'window.zoomToAndShowPortal(\''+portal.guid+'\', ['+latlng+']);return false';
	var perma = '/intel?ll='+portal.lat+','+portal.lon+'&z=17&pll='+portal.lat+','+portal.lon;

	//Use Jquery to create the link, which escape characters in TITLE and ADDRESS of portal
	var a = $('<a>',{
	"class": 'help',
	text: portal.title,
	//title: portal.address,
	href: perma,
	onClick: jsSingleClick,
	onDblClick: jsDoubleClick
	})[0].outerHTML;
	var div = '<div class="portalTitle">'+a+'</div>';
	return div;
};

window.plugin.arcs.getRange = function() {
	//select mods
	var mod_handicap_effect = [1, 0.25, 0.125, 0.125];
	var link_amp_multiplier = 0;
	var countVRLA = parseInt(document.getElementById('VRLA').innerHTML, 10);
	var countSBULA = parseInt(document.getElementById('SBULA').innerHTML, 10);
	var countRLA = parseInt(document.getElementById('RLA').innerHTML, 10);

	for (i=0;i<4;i++)
	{
		if (countVRLA>0)
		{
			link_amp_multiplier += mod_handicap_effect[i]*7;
			countVRLA--;
			continue;
		}
		if (countSBULA>0)
		{
			link_amp_multiplier += mod_handicap_effect[i]*5;
			countSBULA--;
			continue;
		}
		if (countRLA>0)
		{
			link_amp_multiplier += mod_handicap_effect[i]*2;
			countRLA--;
			continue;
		}
		//console.log(link_amp_multiplier);
	}
	if (link_amp_multiplier===0)
	{
		link_amp_multiplier=1;
	}

	var portalLevel = 0;
	for (i=1;i<=8;i++)
	{
		portalLevel = portalLevel + parseInt(document.getElementById('R'+i).innerHTML, 10)/8;
	}
	//console.log(portalLevel);
	var portalRange = Math.pow(portalLevel,4)*0.16*link_amp_multiplier;
	portalRange = Math.floor(portalRange * 1000) / 1000;
	//console.log(portalRange);
	document.getElementById("portalLevel").innerHTML =portalLevel;
	document.getElementById("portalRange").innerHTML =portalRange;
	if (portalRange>document.getElementById("linkDistance").innerHTML)
	{
		document.getElementById("inRange").innerHTML ='YES';
		document.getElementById("inRange").style.color="green";
	}
	else
	{
		document.getElementById("inRange").innerHTML ='NO';
		document.getElementById("inRange").style.color="red";
	}
};

window.plugin.arcs.rangePopup = function(d) {
	//select mods
	html = 'Mods:';
	html += '<table><tr><td>RLA</td><td>SBULA</td><td>VRLA</td></tr>';
	html += '<tr><td><a onclick=\'window.plugin.arcs.incrementValue("RLA",-1);\'>-</a><span id="RLA">  0  </span><a onclick=\'window.plugin.arcs.incrementValue("RLA",1);\'>+</a></td>';
	html += '<td><a onclick=\'window.plugin.arcs.incrementValue("SBULA",-1);\'>-</a><span id="SBULA">  0  </span><a onclick=\'window.plugin.arcs.incrementValue("SBULA",1);\'>+</a></td>';
	html += '<td><a onclick=\'window.plugin.arcs.incrementValue("VRLA",-1);\'>-</a><span id="VRLA">  0  </span><a onclick=\'window.plugin.arcs.incrementValue("VRLA",1);\'>+</a></td></tr></table>';
	html +='<hr/>Resonators:<table>';
	html += '<tr><td><a onclick=\'window.plugin.arcs.incrementRes("R1",1);\'>+</a></td><td><a onclick=\'window.plugin.arcs.incrementRes("R2",1);\'>+</a></td><td><a onclick=\'window.plugin.arcs.incrementRes("R3",1);\'>+</a></td><td><a onclick=\'window.plugin.arcs.incrementRes("R4",1);\'>+</a></td><td><a onclick=\'window.plugin.arcs.incrementRes("R5",1);\'>+</a></td><td><a onclick=\'window.plugin.arcs.incrementRes("R6",1);\'>+</a></td><td><a onclick=\'window.plugin.arcs.incrementRes("R7",1);\'>+</a></td><td><a onclick=\'window.plugin.arcs.incrementRes("R8",1);\'>+</a></td></tr>';
	html += '<tr><td><div id="R1">4</div></td><td><div id="R2">4</div></td><td><div id="R3">5</div></td><td><div id="R4">5</div></td><td><div id="R5">6</div></td><td><div id="R6">6</div></td><td><div id="R7">7</div></td><td><div id="R8">8</div></td></tr>';
	html += '<tr><td><a onclick=\'window.plugin.arcs.incrementRes("R1",-1);\'>-</a></td><td><a onclick=\'window.plugin.arcs.incrementRes("R2",-1);\'>-</a></td><td><a onclick=\'window.plugin.arcs.incrementRes("R3",-1);\'>-</a></td><td><a onclick=\'window.plugin.arcs.incrementRes("R4",-1);\'>-</a></td><td><a onclick=\'window.plugin.arcs.incrementRes("R5",-1);\'>-</a></td><td><a onclick=\'window.plugin.arcs.incrementRes("R6",-1);\'>-</a></td><td><a onclick=\'window.plugin.arcs.incrementRes("R7",-1);\'>-</a></td><td><a onclick=\'window.plugin.arcs.incrementRes("R8",-1);\'>-</a></td></tr></table>';
	html +='<hr/>Portal Level: <span id="portalLevel"></span></br>Portal Range: <span id="portalRange"></span>km</br>Link: <span id="linkDistance">'+d+'</span>km</br>Success: <span id="inRange"></span>';

	dialog({
		html: '<div id="rangecalc">' + html + '</div>',
		dialogClass: 'ui-dialog-portal',
		title: 'Range',
		id: 'portal-arc-range',
		width: 300
	});
	window.plugin.arcs.getRange();
};

window.plugin.arcs.incrementValue = function(id,amount)
{
	var total = parseInt(document.getElementById("RLA").innerHTML, 10)+parseInt(document.getElementById("SBULA").innerHTML, 10)+parseInt(document.getElementById("VRLA").innerHTML, 10);
    var value = parseInt(document.getElementById(id).innerHTML, 10);
	if((total<4&&amount==1)||(total>0&&amount==-1&&value>0))
	{
		value=value+amount;
		document.getElementById(id).innerHTML = '  '+value+'  ';
	}
	window.plugin.arcs.getRange();
};
window.plugin.arcs.incrementRes = function(id,amount)
{
    var value = parseInt(document.getElementById(id).innerHTML, 10);
	if((value<8&&amount==1)||(value>1&&amount==-1))
	{
		value=value+amount;
		document.getElementById(id).innerHTML = value;
	}
	window.plugin.arcs.getRange();
};

window.plugin.arcs.drawToolsExport = function() {
	var arc_list = JSON.parse(localStorage.getItem('arc_list' ));
	var data = [];
	for (var i=0;i<arc_list.length;i++)
	{
		var link = arc_list[i];
		var item = {};
		item.type = 'polyline';

		a= {};
		a.lat=link.startPortal.lat;
		a.lng=link.startPortal.lon;

		b= {};
		b.lat=link.endPortal.lat;
		b.lng=link.endPortal.lon;

		temp = [a,b];
		//temp[0]['lat']=link.startPortal.lat;
		//temp[0]['lng']=link.startPortal.lon;
		//temp[1]['lat']=link.endPortal.lat;
		//temp[1]['lng']=link.endPortal.lon;
		item.latLngs = temp;
		item.color = link.color;

		data.push(item);
		//console.log(data);
	}

	return JSON.stringify(data);
};

window.plugin.arcs.edit =function(position,operation) {
	//edit the local storage and redraw everything is the only way to be safe.
	//this is expensive but shouldn't be a big issue
	//Lets create an independent layer for this hey?

	var arc_list = JSON.parse(localStorage.getItem('arc_list' ));
	var link = arc_list[position];

	if (operation=='swap')
	{
		window.plugin.arcs.link = {};
		window.plugin.arcs.link.color = link.color;
		window.plugin.arcs.link.startPortal = link.endPortal;
		window.plugin.arcs.link.endPortal = link.startPortal;
		window.plugin.arcs.link.distance = window.plugin.arcs.distance(window.plugin.arcs.link);
		arc_list[position]=window.plugin.arcs.link;
	}
	if (operation=='delete')
	{
		arc_list.splice(position,1);
	}
	if (operation=='color')
	{
		link.color=arcColor;
		arc_list[position]=link;
	}

	//save changes
	localStorage.setItem( 'arc_list', JSON.stringify(arc_list) );

	//refresh the layer group
	window.plugin.arcs.drawlayer.clearLayers();
	window.plugin.arcs.link_list = [];
	//redraw all lines
	for (var m=0;m<arc_list.length;m++)
	{
		var link = arc_list[m];
		var startCoord = new window.plugin.arcs.arc.Coord(link.startPortal.lon, link.startPortal.lat);
		var stopCoord = new window.plugin.arcs.arc.Coord(link.endPortal.lon, link.endPortal.lat);
		window.plugin.arcs.create(startCoord, stopCoord, link);
	}
	//refresh list
	arcslist_top = $('#dialog-portal-arc').dialog('widget').position().top;
	arcslist_left= $('#dialog-portal-arc').dialog('widget').position().left;
	arcslist_scroll= document.getElementById('dialog-portal-arc').scrollTop;
	window.plugin.arcs.list();
};

window.plugin.arcs.arcsparsing = function() {
	//make form
	var arcForm = document.createElement("form");
    arcForm.target = "_blank";
    arcForm.method = "POST";
	arcForm.name = "form1";
    arcForm.action = "http://ingress.sebbens.com/arcsparsing.php";
	//add data
    var arcInput = document.createElement("input");
    arcInput.type = "text";
    arcInput.name = "arcslist";
    arcInput.value = localStorage.getItem('arc_list');
    arcForm.appendChild(arcInput);
	var arcInput = document.createElement("input");
    arcInput.type = "text";
    arcInput.name = "Submit";
    arcInput.value = 'Submit';
    arcForm.appendChild(arcInput);
    document.body.appendChild(arcForm);

    arcForm.submit();
};

//list box positions
var arcslist_scroll=0;
// Declare them but leave them undefined for first load so we can center the window
var arcslist_top, arcslist_left;


window.plugin.arcs.list = function() {
	var arc_list = JSON.parse(localStorage.getItem('arc_list' ));
	//lets create a table
	var html = '<table class="arc-link-table"><thead style="text-align: left;"><tr><th style="width:5px;"></th><th>Start Portal</th><th></th><th>End Portal</th><th>Distance(km)</th><th></th><th></th></tr></thead><tbody>';
	for (var i=0;i<arc_list.length;i++)
			{
					var link = arc_list[i];
					html +='<tr><td style="background-color:'+link.color+';" onclick="window.plugin.arcs.edit('+i+',\'color\')">  </td>';
					html +='<td>'+window.plugin.arcs.getPortalLink(link.startPortal)+'</td>';
					html +='<td><a onclick="window.plugin.arcs.edit('+i+',\'swap\')">«»</a></td>';
					html +='<td>'+window.plugin.arcs.getPortalLink(link.endPortal)+'</td>';
					html +='<td><a onclick="window.plugin.arcs.rangePopup('+link.distance+')">'+link.distance+'</a></td>';
					html +='<td><a onclick="window.plugin.arcs.edit('+i+',\'delete\')">X</a></td>';
					html +='<td><span class="link-drag-handle" style="cursor:move;">=</span></td></tr>';

			}
	html +='</tbody></table>';
	//color select
	html +='<hr/>Arc Colour: <form method="POST" action="" onsubmit="window.plugin.arcs.changeColor(\'\');return false;"><input style="color:'+arcColor+';" type="text" onclick="this.focus();this.select()" id="colorString" name="Arc Color" cols="7" rows="1" value="'+arcColor+'">';
	html +='<button type="button" onclick="window.plugin.arcs.changeColor(\'\');">Set</button> <button type="button" style="background-color:#ff0000;min-height:19px;" onclick="window.plugin.arcs.changeColor(\'#ff0000\');"></button>';
	html +='<button type="button" style="background-color:#00ff77;min-height:19px;" onclick="window.plugin.arcs.changeColor(\'#00ff77\');"></button>';
	html +='<button type="button" style="background-color:#ff00ff;min-height:19px;" onclick="window.plugin.arcs.changeColor(\'#ff00ff\');"></button>';
	html +='<button type="button" style="background-color:#ffff00;min-height:19px;" onclick="window.plugin.arcs.changeColor(\'#ffff00\');"></button>';
	html +='<button type="button" style="background-color:#ffffff;min-height:19px;" onclick="window.plugin.arcs.changeColor(\'#ffffff\');"></button>';
	html +='</form>';

	html +='<hr/>Import/Export (copy out to share links or paste in to add links)<br/>';
	//Lets add in the JSON text for storage and shareing.
	html += '<form method="POST" action=""><textarea onclick="this.focus();this.select()" id="JSONstring" name="jsondata" cols="50" rows="3">'+localStorage.getItem('arc_list')+'</textarea></form><button type="button" onclick="window.plugin.arcs.list.addJSONdata()">Add Data</button>';
	html +='<hr/><div>DRAW TOOLS EXPORT: For lowly users that only have draw tools give them this to import your plan</div><textarea onclick="this.focus();this.select()" id="JSONstring" name="jsondata" cols="50" rows="3">'+window.plugin.arcs.drawToolsExport()+'</textarea>';
	//Link to Darryls parser
	html +='<hr/><div><a onclick="window.plugin.arcs.arcsparsing()" title="Send to http://ingress.sebbens.com/arcsparsing.php">Export to parser</a><br/>Gives a summary including key counts and csv exports. [[ALLOW POPUPS]]</div>';
	//small readme
	html +='<hr/><div><p class="arcs-help" style="display:none;">';
	html +='You can left click a link to get details about it on the map.<br/>';
	html +='If you right click the link it will remove it.<br/>';
	html +='Click a distance to see the range calculator.<br/>';
	html +='Alt+A is the start stop arc shortcut.<br/>';
	html +='The A, X and L buttons on the left control arc creation, check for cross links and display this list.<br/>';
	html +='Chat about Arcs here: <a target="_blank" href="https://telegram.me/joinchat/AucXcz0XP34Rc8mQr8Oxzg">Telegram Link</a><br/>';
	html +='Please feel free to share to any confirmed enlightened player. This plugin is <u><b>not</b></u> considered highly secure:  <a target="_blank" href="http://ingress.wolflight.us/Arcs/arc.user.js">Arcs Plugin Link</a><br/>';
	html +='Resistance agents: Use at your own risk.<br/>';
	html +='</p>';
	html += '<a onclick="$(\'.arcs-help\').slideToggle(); return false;">Show/Hide Arcs Help</a>';
	html += '</div><hr/><a onclick="window.plugin.arcs.clear(); return false;" title="Delete EVERYTHING FOREVER!">Clear arcs</a>';

	dialog({
		//html: '<div id="linkslist">' + html + '</div>',
		html:'<div id="linkslist">test</div>',
		dialogClass: 'ui-dialog-portal-arcs',
		title: 'Links',
		id: 'portal-arc',
		width: 550,
		position: { my: "left top", at: "left+"+arcslist_left+" top+"+arcslist_top},
		beforeClose: function(event, ui) {
			   //$('#dialog-portal-arc').dialog('widget').position().top
			   arcslist_top = $('#dialog-portal-arc').dialog('widget').position().top;
			   arcslist_left= $('#dialog-portal-arc').dialog('widget').position().left;
			   arcslist_scroll= document.getElementById('dialog-portal-arc').scrollTop;
            },
		dragStop: function( event, ui ) {
			   //$('#dialog-portal-arc').dialog('widget').position().top
			   arcslist_top = $('#dialog-portal-arc').dialog('widget').position().top;
			   arcslist_left= $('#dialog-portal-arc').dialog('widget').position().left;
			   arcslist_scroll= document.getElementById('dialog-portal-arc').scrollTop;
            }
	});

	//change the html of the dialog box.
	document.getElementById('linkslist').innerHTML=html;


	//lets move this to any previous scroll or position
	//document.getElementById('dialog-portal-arc').scrollTop;
	document.getElementById('dialog-portal-arc').scrollTop=arcslist_scroll;
	//also the on page position
	//save when closed
	//local varible (no change when page reset)

	// Upon first load arcslist_top and arcslist_left are still undefined so we can safely center the window
	if(typeof arcslist_top === "undefined" || typeof arcslist_left === "undefined") {
		$('#dialog-portal-arc').parent('.ui-dialog').position({
			my: "center",
			at: "center",
			of: window
		});
	}

	$('.arc-link-table > tbody').sortable({
		axis: 'y',
	    handle: '.link-drag-handle',
	    helper: function(e, ui) {
	    	ui.children().each(function() {
				$(this).width($(this).width());
	    	});
	    	return ui;
	    },
	    start: function(event, ui){
	    	// Stores the position the link is coming from
			ui.item.fromIndex = ui.item.index();
	    },
	    stop: function(event, ui){
	    	// Gets new position of the link
	    	var index = ui.item.index();
	    	// Reorder json
	    	window.plugin.arcs.list.reorder(ui.item.fromIndex, index);
	    }
  });
};

window.plugin.arcs.list.reorder = function(fromIndex, newIndex){

	// Load arc_list
	var arc_list = JSON.parse(localStorage.getItem('arc_list' ));

	// Re-orders json
	if (newIndex >= arc_list.length) {
        var k = newIndex - arc_list.length;
        while ((k--) + 1) {
            arc_list.push(undefined);
        }
    }
    arc_list.splice(newIndex, 0, arc_list.splice(fromIndex, 1)[0]);

	// save changes
	localStorage.setItem( 'arc_list', JSON.stringify(arc_list));

	//refresh the layer group
	window.plugin.arcs.drawlayer.clearLayers();
	window.plugin.arcs.link_list = [];

	//redraw all lines
	for (var m=0;m<arc_list.length;m++)
	{
		var link = arc_list[m];
		var startCoord = new window.plugin.arcs.arc.Coord(link.startPortal.lon, link.startPortal.lat);
		var stopCoord = new window.plugin.arcs.arc.Coord(link.endPortal.lon, link.endPortal.lat);
		window.plugin.arcs.create(startCoord, stopCoord, link);
	}
	//refresh list
	arcslist_top = $('#dialog-portal-arc').dialog('widget').position().top;
	arcslist_left= $('#dialog-portal-arc').dialog('widget').position().left;
	arcslist_scroll= document.getElementById('dialog-portal-arc').scrollTop;
	window.plugin.arcs.list();
};

//schema validation program
/* jshint ignore:start */
!function(a,b){"function"==typeof define&&define.amd?define([],b):"undefined"!=typeof module&&module.exports?module.exports=b():a.tv4=b()}(this,function(){function a(b,c){if(b===c)return!0;if("object"==typeof b&&"object"==typeof c){if(Array.isArray(b)!==Array.isArray(c))return!1;if(Array.isArray(b)){if(b.length!==c.length)return!1;for(var d=0;d<b.length;d++)if(!a(b[d],c[d]))return!1}else{var e;for(e in b)if(void 0===c[e]&&void 0!==b[e])return!1;for(e in c)if(void 0===b[e]&&void 0!==c[e])return!1;for(e in b)if(!a(b[e],c[e]))return!1}return!0}return!1}function b(a){var b=String(a).replace(/^\s+|\s+$/g,"").match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);return b?{href:b[0]||"",protocol:b[1]||"",authority:b[2]||"",host:b[3]||"",hostname:b[4]||"",port:b[5]||"",pathname:b[6]||"",search:b[7]||"",hash:b[8]||""}:null}function c(a,c){function d(a){var b=[];return a.replace(/^(\.\.?(\/|$))+/,"").replace(/\/(\.(\/|$))+/g,"/").replace(/\/\.\.$/,"/../").replace(/\/?[^\/]*/g,function(a){"/.."===a?b.pop():b.push(a)}),b.join("").replace(/^\//,"/"===a.charAt(0)?"/":"")}return c=b(c||""),a=b(a||""),c&&a?(c.protocol||a.protocol)+(c.protocol||c.authority?c.authority:a.authority)+d(c.protocol||c.authority||"/"===c.pathname.charAt(0)?c.pathname:c.pathname?(a.authority&&!a.pathname?"/":"")+a.pathname.slice(0,a.pathname.lastIndexOf("/")+1)+c.pathname:a.pathname)+(c.protocol||c.authority||c.pathname?c.search:c.search||a.search)+c.hash:null}function d(a){return a.split("#")[0]}function e(a,b){if(a&&"object"==typeof a)if(void 0===b?b=a.id:"string"==typeof a.id&&(b=c(b,a.id),a.id=b),Array.isArray(a))for(var d=0;d<a.length;d++)e(a[d],b);else{"string"==typeof a.$ref&&(a.$ref=c(b,a.$ref));for(var f in a)"enum"!==f&&e(a[f],b)}}function f(a,b,c,d,e){if(Error.call(this),void 0===a)throw new Error("No code supplied for error: "+b);this.message=b,this.code=a,this.dataPath=c||"",this.schemaPath=d||"",this.subErrors=e||null;var f=new Error(this.message);if(this.stack=f.stack||f.stacktrace,!this.stack)try{throw f}catch(f){this.stack=f.stack||f.stacktrace}}function g(a,b){if(b.substring(0,a.length)===a){var c=b.substring(a.length);if(b.length>0&&"/"===b.charAt(a.length-1)||"#"===c.charAt(0)||"?"===c.charAt(0))return!0}return!1}function h(a){var b=new i,f=a||"en",g={addFormat:function(){b.addFormat.apply(b,arguments)},language:function(a){return a?(n[a]||(a=a.split("-")[0]),n[a]?(f=a,a):!1):f},addLanguage:function(a,b){var c;for(c in j)b[c]&&!b[j[c]]&&(b[j[c]]=b[c]);var d=a.split("-")[0];if(n[d]){n[a]=Object.create(n[d]);for(c in b)"undefined"==typeof n[d][c]&&(n[d][c]=b[c]),n[a][c]=b[c]}else n[a]=b,n[d]=b;return this},freshApi:function(a){var b=h();return a&&b.language(a),b},validate:function(a,c,d,e){var g=new i(b,!1,n[f],d,e);"string"==typeof c&&(c={$ref:c}),g.addSchema("",c);var h=g.validateAll(a,c,null,null,"");return!h&&e&&(h=g.banUnknownProperties()),this.error=h,this.missing=g.missing,this.valid=null===h,this.valid},validateResult:function(){var a={};return this.validate.apply(a,arguments),a},validateMultiple:function(a,c,d,e){var g=new i(b,!0,n[f],d,e);"string"==typeof c&&(c={$ref:c}),g.addSchema("",c),g.validateAll(a,c,null,null,""),e&&g.banUnknownProperties();var h={};return h.errors=g.errors,h.missing=g.missing,h.valid=0===h.errors.length,h},addSchema:function(){return b.addSchema.apply(b,arguments)},getSchema:function(){return b.getSchema.apply(b,arguments)},getSchemaMap:function(){return b.getSchemaMap.apply(b,arguments)},getSchemaUris:function(){return b.getSchemaUris.apply(b,arguments)},getMissingUris:function(){return b.getMissingUris.apply(b,arguments)},dropSchemas:function(){b.dropSchemas.apply(b,arguments)},defineKeyword:function(){b.defineKeyword.apply(b,arguments)},defineError:function(a,b,c){if("string"!=typeof a||!/^[A-Z]+(_[A-Z]+)*$/.test(a))throw new Error("Code name must be a string in UPPER_CASE_WITH_UNDERSCORES");if("number"!=typeof b||b%1!==0||1e4>b)throw new Error("Code number must be an integer > 10000");if("undefined"!=typeof j[a])throw new Error("Error already defined: "+a+" as "+j[a]);if("undefined"!=typeof k[b])throw new Error("Error code already used: "+k[b]+" as "+b);j[a]=b,k[b]=a,m[a]=m[b]=c;for(var d in n){var e=n[d];e[a]&&(e[b]=e[b]||e[a])}},reset:function(){b.reset(),this.error=null,this.missing=[],this.valid=!0},missing:[],error:null,valid:!0,normSchema:e,resolveUrl:c,getDocumentUri:d,errorCodes:j};return g}Object.keys||(Object.keys=function(){var a=Object.prototype.hasOwnProperty,b=!{toString:null}.propertyIsEnumerable("toString"),c=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],d=c.length;return function(e){if("object"!=typeof e&&"function"!=typeof e||null===e)throw new TypeError("Object.keys called on non-object");var f=[];for(var g in e)a.call(e,g)&&f.push(g);if(b)for(var h=0;d>h;h++)a.call(e,c[h])&&f.push(c[h]);return f}}()),Object.create||(Object.create=function(){function a(){}return function(b){if(1!==arguments.length)throw new Error("Object.create implementation only accepts one parameter.");return a.prototype=b,new a}}()),Array.isArray||(Array.isArray=function(a){return"[object Array]"===Object.prototype.toString.call(a)}),Array.prototype.indexOf||(Array.prototype.indexOf=function(a){if(null===this)throw new TypeError;var b=Object(this),c=b.length>>>0;if(0===c)return-1;var d=0;if(arguments.length>1&&(d=Number(arguments[1]),d!==d?d=0:0!==d&&1/0!==d&&d!==-1/0&&(d=(d>0||-1)*Math.floor(Math.abs(d)))),d>=c)return-1;for(var e=d>=0?d:Math.max(c-Math.abs(d),0);c>e;e++)if(e in b&&b[e]===a)return e;return-1}),Object.isFrozen||(Object.isFrozen=function(a){for(var b="tv4_test_frozen_key";a.hasOwnProperty(b);)b+=Math.random();try{return a[b]=!0,delete a[b],!1}catch(c){return!0}});var i=function(a,b,c,d,e){if(this.missing=[],this.missingMap={},this.formatValidators=a?Object.create(a.formatValidators):{},this.schemas=a?Object.create(a.schemas):{},this.collectMultiple=b,this.errors=[],this.handleError=b?this.collectError:this.returnError,d&&(this.checkRecursive=!0,this.scanned=[],this.scannedFrozen=[],this.scannedFrozenSchemas=[],this.scannedFrozenValidationErrors=[],this.validatedSchemasKey="tv4_validation_id",this.validationErrorsKey="tv4_validation_errors_id"),e&&(this.trackUnknownProperties=!0,this.knownPropertyPaths={},this.unknownPropertyPaths={}),this.errorMessages=c,this.definedKeywords={},a)for(var f in a.definedKeywords)this.definedKeywords[f]=a.definedKeywords[f].slice(0)};i.prototype.defineKeyword=function(a,b){this.definedKeywords[a]=this.definedKeywords[a]||[],this.definedKeywords[a].push(b)},i.prototype.createError=function(a,b,c,d,e){var g=this.errorMessages[a]||m[a];if("string"!=typeof g)return new f(a,"Unknown error code "+a+": "+JSON.stringify(b),c,d,e);var h=g.replace(/\{([^{}]*)\}/g,function(a,c){var d=b[c];return"string"==typeof d||"number"==typeof d?d:a});return new f(a,h,c,d,e)},i.prototype.returnError=function(a){return a},i.prototype.collectError=function(a){return a&&this.errors.push(a),null},i.prototype.prefixErrors=function(a,b,c){for(var d=a;d<this.errors.length;d++)this.errors[d]=this.errors[d].prefixWith(b,c);return this},i.prototype.banUnknownProperties=function(){for(var a in this.unknownPropertyPaths){var b=this.createError(j.UNKNOWN_PROPERTY,{path:a},a,""),c=this.handleError(b);if(c)return c}return null},i.prototype.addFormat=function(a,b){if("object"==typeof a){for(var c in a)this.addFormat(c,a[c]);return this}this.formatValidators[a]=b},i.prototype.resolveRefs=function(a,b){if(void 0!==a.$ref){if(b=b||{},b[a.$ref])return this.createError(j.CIRCULAR_REFERENCE,{urls:Object.keys(b).join(", ")},"","");b[a.$ref]=!0,a=this.getSchema(a.$ref,b)}return a},i.prototype.getSchema=function(a,b){var c;if(void 0!==this.schemas[a])return c=this.schemas[a],this.resolveRefs(c,b);var d=a,e="";if(-1!==a.indexOf("#")&&(e=a.substring(a.indexOf("#")+1),d=a.substring(0,a.indexOf("#"))),"object"==typeof this.schemas[d]){c=this.schemas[d];var f=decodeURIComponent(e);if(""===f)return this.resolveRefs(c,b);if("/"!==f.charAt(0))return void 0;for(var g=f.split("/").slice(1),h=0;h<g.length;h++){var i=g[h].replace(/~1/g,"/").replace(/~0/g,"~");if(void 0===c[i]){c=void 0;break}c=c[i]}if(void 0!==c)return this.resolveRefs(c,b)}void 0===this.missing[d]&&(this.missing.push(d),this.missing[d]=d,this.missingMap[d]=d)},i.prototype.searchSchemas=function(a,b){if(a&&"object"==typeof a){"string"==typeof a.id&&g(b,a.id)&&void 0===this.schemas[a.id]&&(this.schemas[a.id]=a);for(var c in a)if("enum"!==c)if("object"==typeof a[c])this.searchSchemas(a[c],b);else if("$ref"===c){var e=d(a[c]);e&&void 0===this.schemas[e]&&void 0===this.missingMap[e]&&(this.missingMap[e]=e)}}},i.prototype.addSchema=function(a,b){if("string"!=typeof a||"undefined"==typeof b){if("object"!=typeof a||"string"!=typeof a.id)return;b=a,a=b.id}a===d(a)+"#"&&(a=d(a)),this.schemas[a]=b,delete this.missingMap[a],e(b,a),this.searchSchemas(b,a)},i.prototype.getSchemaMap=function(){var a={};for(var b in this.schemas)a[b]=this.schemas[b];return a},i.prototype.getSchemaUris=function(a){var b=[];for(var c in this.schemas)(!a||a.test(c))&&b.push(c);return b},i.prototype.getMissingUris=function(a){var b=[];for(var c in this.missingMap)(!a||a.test(c))&&b.push(c);return b},i.prototype.dropSchemas=function(){this.schemas={},this.reset()},i.prototype.reset=function(){this.missing=[],this.missingMap={},this.errors=[]},i.prototype.validateAll=function(a,b,c,d,e){var g;if(b=this.resolveRefs(b),!b)return null;if(b instanceof f)return this.errors.push(b),b;var h,i=this.errors.length,j=null,k=null;if(this.checkRecursive&&a&&"object"==typeof a){if(g=!this.scanned.length,a[this.validatedSchemasKey]){var l=a[this.validatedSchemasKey].indexOf(b);if(-1!==l)return this.errors=this.errors.concat(a[this.validationErrorsKey][l]),null}if(Object.isFrozen(a)&&(h=this.scannedFrozen.indexOf(a),-1!==h)){var m=this.scannedFrozenSchemas[h].indexOf(b);if(-1!==m)return this.errors=this.errors.concat(this.scannedFrozenValidationErrors[h][m]),null}if(this.scanned.push(a),Object.isFrozen(a))-1===h&&(h=this.scannedFrozen.length,this.scannedFrozen.push(a),this.scannedFrozenSchemas.push([])),j=this.scannedFrozenSchemas[h].length,this.scannedFrozenSchemas[h][j]=b,this.scannedFrozenValidationErrors[h][j]=[];else{if(!a[this.validatedSchemasKey])try{Object.defineProperty(a,this.validatedSchemasKey,{value:[],configurable:!0}),Object.defineProperty(a,this.validationErrorsKey,{value:[],configurable:!0})}catch(n){a[this.validatedSchemasKey]=[],a[this.validationErrorsKey]=[]}k=a[this.validatedSchemasKey].length,a[this.validatedSchemasKey][k]=b,a[this.validationErrorsKey][k]=[]}}var o=this.errors.length,p=this.validateBasic(a,b,e)||this.validateNumeric(a,b,e)||this.validateString(a,b,e)||this.validateArray(a,b,e)||this.validateObject(a,b,e)||this.validateCombinations(a,b,e)||this.validateFormat(a,b,e)||this.validateDefinedKeywords(a,b,e)||null;if(g){for(;this.scanned.length;){var q=this.scanned.pop();delete q[this.validatedSchemasKey]}this.scannedFrozen=[],this.scannedFrozenSchemas=[]}if(p||o!==this.errors.length)for(;c&&c.length||d&&d.length;){var r=c&&c.length?""+c.pop():null,s=d&&d.length?""+d.pop():null;p&&(p=p.prefixWith(r,s)),this.prefixErrors(o,r,s)}return null!==j?this.scannedFrozenValidationErrors[h][j]=this.errors.slice(i):null!==k&&(a[this.validationErrorsKey][k]=this.errors.slice(i)),this.handleError(p)},i.prototype.validateFormat=function(a,b){if("string"!=typeof b.format||!this.formatValidators[b.format])return null;var c=this.formatValidators[b.format].call(null,a,b);return"string"==typeof c||"number"==typeof c?this.createError(j.FORMAT_CUSTOM,{message:c}).prefixWith(null,"format"):c&&"object"==typeof c?this.createError(j.FORMAT_CUSTOM,{message:c.message||"?"},c.dataPath||null,c.schemaPath||"/format"):null},i.prototype.validateDefinedKeywords=function(a,b){for(var c in this.definedKeywords)if("undefined"!=typeof b[c])for(var d=this.definedKeywords[c],e=0;e<d.length;e++){var f=d[e],g=f(a,b[c],b);if("string"==typeof g||"number"==typeof g)return this.createError(j.KEYWORD_CUSTOM,{key:c,message:g}).prefixWith(null,"format");if(g&&"object"==typeof g){var h=g.code||j.KEYWORD_CUSTOM;if("string"==typeof h){if(!j[h])throw new Error("Undefined error code (use defineError): "+h);h=j[h]}var i="object"==typeof g.message?g.message:{key:c,message:g.message||"?"},k=g.schemaPath||"/"+c.replace(/~/g,"~0").replace(/\//g,"~1");return this.createError(h,i,g.dataPath||null,k)}}return null},i.prototype.validateBasic=function(a,b,c){var d;return(d=this.validateType(a,b,c))?d.prefixWith(null,"type"):(d=this.validateEnum(a,b,c))?d.prefixWith(null,"type"):null},i.prototype.validateType=function(a,b){if(void 0===b.type)return null;var c=typeof a;null===a?c="null":Array.isArray(a)&&(c="array");var d=b.type;"object"!=typeof d&&(d=[d]);for(var e=0;e<d.length;e++){var f=d[e];if(f===c||"integer"===f&&"number"===c&&a%1===0)return null}return this.createError(j.INVALID_TYPE,{type:c,expected:d.join("/")})},i.prototype.validateEnum=function(b,c){if(void 0===c["enum"])return null;for(var d=0;d<c["enum"].length;d++){var e=c["enum"][d];if(a(b,e))return null}return this.createError(j.ENUM_MISMATCH,{value:"undefined"!=typeof JSON?JSON.stringify(b):b})},i.prototype.validateNumeric=function(a,b,c){return this.validateMultipleOf(a,b,c)||this.validateMinMax(a,b,c)||null},i.prototype.validateMultipleOf=function(a,b){var c=b.multipleOf||b.divisibleBy;return void 0===c?null:"number"==typeof a&&a%c!==0?this.createError(j.NUMBER_MULTIPLE_OF,{value:a,multipleOf:c}):null},i.prototype.validateMinMax=function(a,b){if("number"!=typeof a)return null;if(void 0!==b.minimum){if(a<b.minimum)return this.createError(j.NUMBER_MINIMUM,{value:a,minimum:b.minimum}).prefixWith(null,"minimum");if(b.exclusiveMinimum&&a===b.minimum)return this.createError(j.NUMBER_MINIMUM_EXCLUSIVE,{value:a,minimum:b.minimum}).prefixWith(null,"exclusiveMinimum")}if(void 0!==b.maximum){if(a>b.maximum)return this.createError(j.NUMBER_MAXIMUM,{value:a,maximum:b.maximum}).prefixWith(null,"maximum");if(b.exclusiveMaximum&&a===b.maximum)return this.createError(j.NUMBER_MAXIMUM_EXCLUSIVE,{value:a,maximum:b.maximum}).prefixWith(null,"exclusiveMaximum")}return null},i.prototype.validateString=function(a,b,c){return this.validateStringLength(a,b,c)||this.validateStringPattern(a,b,c)||null},i.prototype.validateStringLength=function(a,b){return"string"!=typeof a?null:void 0!==b.minLength&&a.length<b.minLength?this.createError(j.STRING_LENGTH_SHORT,{length:a.length,minimum:b.minLength}).prefixWith(null,"minLength"):void 0!==b.maxLength&&a.length>b.maxLength?this.createError(j.STRING_LENGTH_LONG,{length:a.length,maximum:b.maxLength}).prefixWith(null,"maxLength"):null},i.prototype.validateStringPattern=function(a,b){if("string"!=typeof a||void 0===b.pattern)return null;var c=new RegExp(b.pattern);return c.test(a)?null:this.createError(j.STRING_PATTERN,{pattern:b.pattern}).prefixWith(null,"pattern")},i.prototype.validateArray=function(a,b,c){return Array.isArray(a)?this.validateArrayLength(a,b,c)||this.validateArrayUniqueItems(a,b,c)||this.validateArrayItems(a,b,c)||null:null},i.prototype.validateArrayLength=function(a,b){var c;return void 0!==b.minItems&&a.length<b.minItems&&(c=this.createError(j.ARRAY_LENGTH_SHORT,{length:a.length,minimum:b.minItems}).prefixWith(null,"minItems"),this.handleError(c))?c:void 0!==b.maxItems&&a.length>b.maxItems&&(c=this.createError(j.ARRAY_LENGTH_LONG,{length:a.length,maximum:b.maxItems}).prefixWith(null,"maxItems"),this.handleError(c))?c:null},i.prototype.validateArrayUniqueItems=function(b,c){if(c.uniqueItems)for(var d=0;d<b.length;d++)for(var e=d+1;e<b.length;e++)if(a(b[d],b[e])){var f=this.createError(j.ARRAY_UNIQUE,{match1:d,match2:e}).prefixWith(null,"uniqueItems");if(this.handleError(f))return f}return null},i.prototype.validateArrayItems=function(a,b,c){if(void 0===b.items)return null;var d,e;if(Array.isArray(b.items)){for(e=0;e<a.length;e++)if(e<b.items.length){if(d=this.validateAll(a[e],b.items[e],[e],["items",e],c+"/"+e))return d}else if(void 0!==b.additionalItems)if("boolean"==typeof b.additionalItems){if(!b.additionalItems&&(d=this.createError(j.ARRAY_ADDITIONAL_ITEMS,{}).prefixWith(""+e,"additionalItems"),this.handleError(d)))return d}else if(d=this.validateAll(a[e],b.additionalItems,[e],["additionalItems"],c+"/"+e))return d}else for(e=0;e<a.length;e++)if(d=this.validateAll(a[e],b.items,[e],["items"],c+"/"+e))return d;return null},i.prototype.validateObject=function(a,b,c){return"object"!=typeof a||null===a||Array.isArray(a)?null:this.validateObjectMinMaxProperties(a,b,c)||this.validateObjectRequiredProperties(a,b,c)||this.validateObjectProperties(a,b,c)||this.validateObjectDependencies(a,b,c)||null},i.prototype.validateObjectMinMaxProperties=function(a,b){var c,d=Object.keys(a);return void 0!==b.minProperties&&d.length<b.minProperties&&(c=this.createError(j.OBJECT_PROPERTIES_MINIMUM,{propertyCount:d.length,minimum:b.minProperties}).prefixWith(null,"minProperties"),this.handleError(c))?c:void 0!==b.maxProperties&&d.length>b.maxProperties&&(c=this.createError(j.OBJECT_PROPERTIES_MAXIMUM,{propertyCount:d.length,maximum:b.maxProperties}).prefixWith(null,"maxProperties"),this.handleError(c))?c:null},i.prototype.validateObjectRequiredProperties=function(a,b){if(void 0!==b.required)for(var c=0;c<b.required.length;c++){var d=b.required[c];if(void 0===a[d]){var e=this.createError(j.OBJECT_REQUIRED,{key:d}).prefixWith(null,""+c).prefixWith(null,"required");if(this.handleError(e))return e}}return null},i.prototype.validateObjectProperties=function(a,b,c){var d;for(var e in a){var f=c+"/"+e.replace(/~/g,"~0").replace(/\//g,"~1"),g=!1;if(void 0!==b.properties&&void 0!==b.properties[e]&&(g=!0,d=this.validateAll(a[e],b.properties[e],[e],["properties",e],f)))return d;if(void 0!==b.patternProperties)for(var h in b.patternProperties){var i=new RegExp(h);if(i.test(e)&&(g=!0,d=this.validateAll(a[e],b.patternProperties[h],[e],["patternProperties",h],f)))return d}if(g)this.trackUnknownProperties&&(this.knownPropertyPaths[f]=!0,delete this.unknownPropertyPaths[f]);else if(void 0!==b.additionalProperties){if(this.trackUnknownProperties&&(this.knownPropertyPaths[f]=!0,delete this.unknownPropertyPaths[f]),"boolean"==typeof b.additionalProperties){if(!b.additionalProperties&&(d=this.createError(j.OBJECT_ADDITIONAL_PROPERTIES,{}).prefixWith(e,"additionalProperties"),this.handleError(d)))return d}else if(d=this.validateAll(a[e],b.additionalProperties,[e],["additionalProperties"],f))return d}else this.trackUnknownProperties&&!this.knownPropertyPaths[f]&&(this.unknownPropertyPaths[f]=!0)}return null},i.prototype.validateObjectDependencies=function(a,b,c){var d;if(void 0!==b.dependencies)for(var e in b.dependencies)if(void 0!==a[e]){var f=b.dependencies[e];if("string"==typeof f){if(void 0===a[f]&&(d=this.createError(j.OBJECT_DEPENDENCY_KEY,{key:e,missing:f}).prefixWith(null,e).prefixWith(null,"dependencies"),this.handleError(d)))return d}else if(Array.isArray(f))for(var g=0;g<f.length;g++){var h=f[g];if(void 0===a[h]&&(d=this.createError(j.OBJECT_DEPENDENCY_KEY,{key:e,missing:h}).prefixWith(null,""+g).prefixWith(null,e).prefixWith(null,"dependencies"),this.handleError(d)))return d}else if(d=this.validateAll(a,f,[],["dependencies",e],c))return d}return null},i.prototype.validateCombinations=function(a,b,c){return this.validateAllOf(a,b,c)||this.validateAnyOf(a,b,c)||this.validateOneOf(a,b,c)||this.validateNot(a,b,c)||null},i.prototype.validateAllOf=function(a,b,c){if(void 0===b.allOf)return null;for(var d,e=0;e<b.allOf.length;e++){var f=b.allOf[e];if(d=this.validateAll(a,f,[],["allOf",e],c))return d}return null},i.prototype.validateAnyOf=function(a,b,c){if(void 0===b.anyOf)return null;var d,e,f=[],g=this.errors.length;this.trackUnknownProperties&&(d=this.unknownPropertyPaths,e=this.knownPropertyPaths);for(var h=!0,i=0;i<b.anyOf.length;i++){this.trackUnknownProperties&&(this.unknownPropertyPaths={},this.knownPropertyPaths={});var k=b.anyOf[i],l=this.errors.length,m=this.validateAll(a,k,[],["anyOf",i],c);if(null===m&&l===this.errors.length){if(this.errors=this.errors.slice(0,g),this.trackUnknownProperties){for(var n in this.knownPropertyPaths)e[n]=!0,delete d[n];for(var o in this.unknownPropertyPaths)e[o]||(d[o]=!0);h=!1;continue}return null}m&&f.push(m.prefixWith(null,""+i).prefixWith(null,"anyOf"))}return this.trackUnknownProperties&&(this.unknownPropertyPaths=d,this.knownPropertyPaths=e),h?(f=f.concat(this.errors.slice(g)),this.errors=this.errors.slice(0,g),this.createError(j.ANY_OF_MISSING,{},"","/anyOf",f)):void 0},i.prototype.validateOneOf=function(a,b,c){if(void 0===b.oneOf)return null;var d,e,f=null,g=[],h=this.errors.length;this.trackUnknownProperties&&(d=this.unknownPropertyPaths,e=this.knownPropertyPaths);for(var i=0;i<b.oneOf.length;i++){this.trackUnknownProperties&&(this.unknownPropertyPaths={},this.knownPropertyPaths={});var k=b.oneOf[i],l=this.errors.length,m=this.validateAll(a,k,[],["oneOf",i],c);if(null===m&&l===this.errors.length){if(null!==f)return this.errors=this.errors.slice(0,h),this.createError(j.ONE_OF_MULTIPLE,{index1:f,index2:i},"","/oneOf");if(f=i,this.trackUnknownProperties){for(var n in this.knownPropertyPaths)e[n]=!0,delete d[n];for(var o in this.unknownPropertyPaths)e[o]||(d[o]=!0)}}else m&&g.push(m.prefixWith(null,""+i).prefixWith(null,"oneOf"))}return this.trackUnknownProperties&&(this.unknownPropertyPaths=d,this.knownPropertyPaths=e),null===f?(g=g.concat(this.errors.slice(h)),this.errors=this.errors.slice(0,h),this.createError(j.ONE_OF_MISSING,{},"","/oneOf",g)):(this.errors=this.errors.slice(0,h),null)},i.prototype.validateNot=function(a,b,c){if(void 0===b.not)return null;var d,e,f=this.errors.length;this.trackUnknownProperties&&(d=this.unknownPropertyPaths,e=this.knownPropertyPaths,this.unknownPropertyPaths={},this.knownPropertyPaths={});var g=this.validateAll(a,b.not,null,null,c),h=this.errors.slice(f);return this.errors=this.errors.slice(0,f),this.trackUnknownProperties&&(this.unknownPropertyPaths=d,this.knownPropertyPaths=e),null===g&&0===h.length?this.createError(j.NOT_PASSED,{},"","/not"):null};var j={INVALID_TYPE:0,ENUM_MISMATCH:1,ANY_OF_MISSING:10,ONE_OF_MISSING:11,ONE_OF_MULTIPLE:12,NOT_PASSED:13,NUMBER_MULTIPLE_OF:100,NUMBER_MINIMUM:101,NUMBER_MINIMUM_EXCLUSIVE:102,NUMBER_MAXIMUM:103,NUMBER_MAXIMUM_EXCLUSIVE:104,STRING_LENGTH_SHORT:200,STRING_LENGTH_LONG:201,STRING_PATTERN:202,OBJECT_PROPERTIES_MINIMUM:300,OBJECT_PROPERTIES_MAXIMUM:301,OBJECT_REQUIRED:302,OBJECT_ADDITIONAL_PROPERTIES:303,OBJECT_DEPENDENCY_KEY:304,ARRAY_LENGTH_SHORT:400,ARRAY_LENGTH_LONG:401,ARRAY_UNIQUE:402,ARRAY_ADDITIONAL_ITEMS:403,FORMAT_CUSTOM:500,KEYWORD_CUSTOM:501,CIRCULAR_REFERENCE:600,UNKNOWN_PROPERTY:1e3},k={};for(var l in j)k[j[l]]=l;var m={INVALID_TYPE:"invalid type: {type} (expected {expected})",ENUM_MISMATCH:"No enum match for: {value}",ANY_OF_MISSING:'Data does not match any schemas from "anyOf"',ONE_OF_MISSING:'Data does not match any schemas from "oneOf"',ONE_OF_MULTIPLE:'Data is valid against more than one schema from "oneOf": indices {index1} and {index2}',NOT_PASSED:'Data matches schema from "not"',NUMBER_MULTIPLE_OF:"Value {value} is not a multiple of {multipleOf}",NUMBER_MINIMUM:"Value {value} is less than minimum {minimum}",NUMBER_MINIMUM_EXCLUSIVE:"Value {value} is equal to exclusive minimum {minimum}",NUMBER_MAXIMUM:"Value {value} is greater than maximum {maximum}",NUMBER_MAXIMUM_EXCLUSIVE:"Value {value} is equal to exclusive maximum {maximum}",STRING_LENGTH_SHORT:"String is too short ({length} chars), minimum {minimum}",STRING_LENGTH_LONG:"String is too long ({length} chars), maximum {maximum}",STRING_PATTERN:"String does not match pattern: {pattern}",OBJECT_PROPERTIES_MINIMUM:"Too few properties defined ({propertyCount}), minimum {minimum}",OBJECT_PROPERTIES_MAXIMUM:"Too many properties defined ({propertyCount}), maximum {maximum}",OBJECT_REQUIRED:"Missing required property: {key}",OBJECT_ADDITIONAL_PROPERTIES:"Additional properties not allowed",OBJECT_DEPENDENCY_KEY:"Dependency failed - key must exist: {missing} (due to key: {key})",ARRAY_LENGTH_SHORT:"Array is too short ({length}), minimum {minimum}",ARRAY_LENGTH_LONG:"Array is too long ({length}), maximum {maximum}",ARRAY_UNIQUE:"Array items are not unique (indices {match1} and {match2})",ARRAY_ADDITIONAL_ITEMS:"Additional items not allowed",FORMAT_CUSTOM:"Format validation failed ({message})",KEYWORD_CUSTOM:"Keyword failed: {key} ({message})",CIRCULAR_REFERENCE:"Circular $refs: {urls}",UNKNOWN_PROPERTY:"Unknown property (not in schema)"};f.prototype=Object.create(Error.prototype),f.prototype.constructor=f,f.prototype.name="ValidationError",f.prototype.prefixWith=function(a,b){if(null!==a&&(a=a.replace(/~/g,"~0").replace(/\//g,"~1"),this.dataPath="/"+a+this.dataPath),null!==b&&(b=b.replace(/~/g,"~0").replace(/\//g,"~1"),this.schemaPath="/"+b+this.schemaPath),null!==this.subErrors)for(var c=0;c<this.subErrors.length;c++)this.subErrors[c].prefixWith(a,b);return this};var n={},o=h();return o.addLanguage("en-gb",m),o.tv4=o,o});
//# sourceMappingURL=tv4.min.js.map
/* jshint ignore:end */

window.plugin.arcs.list.addJSONdata = function() {
	var arc_list = JSON.parse(localStorage.getItem('arc_list' ));
	array2 = JSON.parse(String(document.getElementById("JSONstring").value));
	//check that import is all good here
	/* jshint ignore:start */
	schema = {"type":"array","items":{"type":"object","properties":{"startPortal":{"type":"object","required":["title","lat","lon","guid"],"properties":{"title":{"type":"string"},"lat":{"type":"number"},"lon":{"type":"number"},"guid":{"type":"string"}}},"endPortal":{"type":"object","required":["title","lat","lon","guid"],"properties":{"title":{"type":"string"},"lat":{"type":"number"},"lon":{"type":"number"},"guid":{"type":"string"}}},"distance":{"type":"number"},"color":{"type":"string"}},"required":["startPortal","endPortal","distance"]}};
	/* jshint ignore:end */
	if (tv4.validate(array2,schema))
	{
		var arc_list = arc_list.concat(array2);
		localStorage.setItem( 'arc_list', JSON.stringify(arc_list) );
		for (var i=0;i<array2.length;i++)
		{
			var link = array2[i];
			var startCoord = new window.plugin.arcs.arc.Coord(link.startPortal.lon, link.startPortal.lat);
			var stopCoord = new window.plugin.arcs.arc.Coord(link.endPortal.lon, link.endPortal.lat);
			window.plugin.arcs.create(startCoord, stopCoord, link);
		}
		window.plugin.arcs.list();
	}
	else
	{
	alert ('Data is corrupt');
	}
};

window.plugin.arcs.changeColor = function(color) {
	if (color==='')
	{
		color = String(document.getElementById("colorString").value);
		console.log(color);
	}
	console.log(color);
	if (!/^#[0-9A-F]{6}$/i.test(color))
	{
		alert('Invalid colour.');
		return;
	}
	arcColor=color;
	document.getElementById("colorString").value = color;
	document.getElementById("colorString").style.color = color;
};

//Need a start end variable for this
var linkEnd = 'start';
var arcColor = '#ff0000';

window.plugin.arcs.draw = function() {
	//console.log('test');
	if (window.selectedPortal === null)
	{
		$('#ArcError1').fadeIn(400).delay(400).fadeOut(400);
		return;
	}
	var el = document.getElementById("arcButton");
	var button = document.getElementById("leftarcbutton");

	//Lets do some more. Store portal lat,long, name address and guid.
	var portal = {};
	//var portal_full = window.portals[window.selectedPortal];

    var guid = window.selectedPortal;
    var p = window.portals[guid];
    var d = p.options.data;
    var label = d.title;
    var lat = p.getLatLng().lat;
    var lng = p.getLatLng().lng;
    var details = portalDetail.get(guid);

	portal.title = label;
	//portal.address = details.descriptiveText.map.ADDRESS;
	portal.lat = lat;
	portal.lon = lng;
	portal.guid = guid;

	//if things were not loaded yet stop
	console.log(portal.title);
	if (!label)
		{
		console.log('Portal data not loaded');
		$('#ArcError1').fadeIn(400).delay(400).fadeOut(400);
		return;
		}

	if (linkEnd == 'start') {
		window.plugin.arcs.startPortal = portal;
		el.title='End arc at this portal';
		el.innerHTML='End arc';
		window.plugin.arcs.startCoord = new window.plugin.arcs.arc.Coord(portal.lon, portal.lat);
		linkEnd = 'stop';
		button.style.background = 'red';
	}
	else{
		endPortal = portal;
		window.plugin.arcs.link = {};
		window.plugin.arcs.link.startPortal = window.plugin.arcs.startPortal;
		window.plugin.arcs.link.endPortal = endPortal;
		window.plugin.arcs.link.distance = window.plugin.arcs.distance(window.plugin.arcs.link);

		//set the color
		window.plugin.arcs.link.color = arcColor;


		el.title='Start an arc from this portal';
		el.innerHTML='Start arc';
		linkEnd = 'start';
		button.style.background = 'white';

        //If it was a 0 distance. DO NOT MAKE
        if (window.plugin.arcs.link.distance === 0)
        {
        	//Nope!
            $('#ArcError2').fadeIn(400).delay(1000).fadeOut(400);
        }
        else
        {
            var stopCoord = new window.plugin.arcs.arc.Coord(endPortal.lon, endPortal.lat);
            window.plugin.arcs.create(window.plugin.arcs.startCoord, stopCoord, window.plugin.arcs.link);
            //add to local storage
            var arc_list = JSON.parse(localStorage.getItem('arc_list' ));
            //console.log(arc_list);
            arc_list.push(window.plugin.arcs.link);
            localStorage.setItem( 'arc_list', JSON.stringify(arc_list) );
            //window.alert("Link Distance: "+window.plugin.arcs.link.distance+"km");
        }
	}
};



//auto draw
window.plugin.arcs.dialogDrawer = function() {
	dialog({
		html:window.plugin.arcs.dialogLoadList,
		dialogClass:'ui-dialog-autodrawer',
		title:'Bookmarks - Arcs Auto Draw',
		id: 'arcs-dialog-window',
		buttons:{
			'DRAW': function() {
				window.plugin.arcs.adraw(0);
			}
		}
	});
	window.plugin.arcs.arcautoDrawOnSelect();
};

window.plugin.arcs.adraw = function(view) {
	var label = [];
	var latlngs = [];
	var guid = [];
	$('#bkmrksAutoDrawer a.bkmrk.selected').each(function(i) {
		label[i] = $(this).text();
		latlngs[i] = $(this).data('latlng');
		guid[i] = $(this).data('guid');
	});


	if(latlngs.length >= 2 && latlngs.length <= 3)
	{
		if(latlngs.length == 3) {
			window.plugin.arcs.draw_line(0,1,label,latlngs,guid);
			window.plugin.arcs.draw_line(0,2,label,latlngs,guid);
			window.plugin.arcs.draw_line(1,2,label,latlngs,guid);
		}
		else if(latlngs.length == 2) {
			window.plugin.arcs.draw_line(0,1,label,latlngs,guid);
		}
		if($('#bkmrkClearSelection').prop('checked'))
		{
			$('#bkmrksAutoDrawer a.bkmrk.selected').removeClass('selected');
		}
	}
};

window.plugin.arcs.draw_line = function(i,j,label,latlngs,guid) {
	//draw one line
	window.plugin.arcs.link = {};
	window.plugin.arcs.link.startPortal = {};
	window.plugin.arcs.link.endPortal = {};
	window.plugin.arcs.link.startPortal.title = label[i];
	window.plugin.arcs.link.startPortal.lat = latlngs[i][0];
	window.plugin.arcs.link.startPortal.lon = latlngs[i][1];
	window.plugin.arcs.link.startPortal.guid = guid[i];
	window.plugin.arcs.link.endPortal.title = label[j];
	window.plugin.arcs.link.endPortal.lat = latlngs[j][0];
	window.plugin.arcs.link.endPortal.lon = latlngs[j][1];
	window.plugin.arcs.link.endPortal.guid = guid[j];
	window.plugin.arcs.link.color = arcColor;
	window.plugin.arcs.link.distance = window.plugin.arcs.distance(window.plugin.arcs.link);

	//add to local storage
	var arc_list = JSON.parse(localStorage.getItem('arc_list' ));
	//console.log(arc_list);
	//console.log(window.plugin.arcs.link);

	var arcExists=false;
	for (i=0;i<arc_list.length;i++)
	{
		if (window.plugin.arcs.link.startPortal.guid==arc_list[i].startPortal.guid && window.plugin.arcs.link.endPortal.guid==arc_list[i].endPortal.guid)
		{ arcExists = true;}
		if (window.plugin.arcs.link.startPortal.guid==arc_list[i].endPortal.guid && window.plugin.arcs.link.endPortal.guid==arc_list[i].startPortal.guid)
		{ arcExists = true;}
	}
	//check if link already exists
	if(!arcExists)
	{
		arc_list.push(window.plugin.arcs.link);
		localStorage.setItem( 'arc_list', JSON.stringify(arc_list) );
		//add to map
		var startCoord = new window.plugin.arcs.arc.Coord(window.plugin.arcs.link.startPortal.lon, window.plugin.arcs.link.startPortal.lat);
		var stopCoord = new window.plugin.arcs.arc.Coord(window.plugin.arcs.link.endPortal.lon, window.plugin.arcs.link.endPortal.lat);
		window.plugin.arcs.create(startCoord, stopCoord, window.plugin.arcs.link);
	}
	window.plugin.arcs.arcautoDrawOnSelect();
};

window.plugin.arcs.arcautoDrawOnSelect = function() {
	var numberSelected = 0;
	var uuu = $('#bkmrksAutoDrawer a.bkmrk.selected').each(function(i) {
		numberSelected++;
	});
    var text = "You must select 2 or 3 portals!";
    var color = "red";

    if(numberSelected == 2) {
      text = 'Draw single Arc';
      color = "";
    } else if(numberSelected == 3) {
      text = 'Draw three Arcs';
      color = "";
    }

    $('#bkmrksAutoDrawer p')
      .html(text)
      .css("color", color);
};

window.plugin.arcs.filterDraw = function() {
	  // Declare variables
	  var input, filter, ul, li, a, i, portalbookmarks, folders;
	  input = document.getElementById('arcFilterDrawInput');
	  filter = input.value.toUpperCase();
		portalbookmarks = $("a.bkmrk");
		$("div.bookmarkFolder>div").show();
	  for (i = 0; i < portalbookmarks.length; i++) {
      if (portalbookmarks[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
        portalbookmarks[i].style.display = "";
				// portalbookmarks[i].hidden = "false";
      } else {
        portalbookmarks[i].style.display = "none";
				// portalbookmarks[i].hidden = "true";
      }
	  }
		$("a.bkmrk.selected").show();
		folders = $("div.bookmarkFolder");
		for (i = 0; i < folders.length; i++) {
      if (folders[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
        folders[i].style.display = "";
				// portalbookmarks[i].hidden = "false";
      } else {
        folders[i].style.display = "none";
				// portalbookmarks[i].hidden = "true";
      }
	  }
	$("div.bookmarkFolder a.bkmrk.selected").show();
};

window.plugin.arcs.dialogLoadList = function() {
	var r = 'The "<a href="https://static.iitc.me/build/release/plugins/bookmarks-by-zaso.user.js" target="_BLANK"><strong>Bookmarks</strong></a>" plugin is required.</span>';

	if(!window.plugin.bookmarks) {
		$('.ui-dialog-autodrawer .ui-dialog-buttonset .ui-button:not(:first)').hide();
	}
	else
	{
		var portalsList = JSON.parse(localStorage[window.plugin.bookmarks.KEY_STORAGE]);
		var element = '';
		var elementTemp = '';
		var elemGenericFolder = '';

		// For each folder
		var list = portalsList.portals;
		for(var idFolders in list) {
			var folders = list[idFolders];

			// Create a label and a anchor for the sortable
			var folderLabel = '<a class="folderLabel" onclick="$(this).siblings(\'div\').toggle();return false;">'+folders.label+'</a>';

			// Create a folder
			elementTemp = '<div class="bookmarkFolder" id="'+idFolders+'">'+folderLabel+'<div>';

			// For each bookmark
			var fold = folders.bkmrk;
			for(var idBkmrk in fold) {
				var bkmrk = fold[idBkmrk];
				var label = bkmrk.label;
				var latlng = bkmrk.latlng;
				var guid = bkmrk.guid;

				// Create the bookmark
				elementTemp += '<a class="bkmrk" id="'+idBkmrk+'" onclick="$(this).toggleClass(\'selected\');return false" data-label="'+label+'" data-latlng="['+latlng+']" data-guid="'+guid+'">'+label+'</a>';
			}
			elementTemp += '</div></div>';

			if(idFolders !== window.plugin.bookmarks.KEY_OTHER_BKMRK) {
				element += elementTemp;
			} else {
				elemGenericFolder += elementTemp;
			}
		}
		element += elemGenericFolder;
		// Append all folders and bookmarks
		r = '<div id="bkmrksAutoDrawer">'+
		'<label style="margin-bottom: 9px; display: block;">'+
		'<input style="vertical-align: middle;" type="checkbox" id="bkmrkClearSelection" checked>'+
		' Clear selection after drawing</label>'+
		'<p style="margin-bottom:9px;color:red;display: block;">You must select 2 or 3 portals!</p>'+
		'<label for="arcFilterDrawInput" style="margin-top: 5px; position:relative; display:inline-block; font-weight:bold;">Filter portals by name:</label><br />'+
		'<input type="text" id="arcFilterDrawInput" onkeyup="window.plugin.arcs.filterDraw()" placeholder="Portalname" style="margin-top:3px; margin-bottom:5px; border: 1px solid #20a8b1;">'+
		'<div onclick="window.plugin.arcs.arcautoDrawOnSelect();return false;">'+element+'</div></div>';
	}
	return r;
};

////////////////////////////////// Cross links ///////////////////////////////////////
window.plugin.arcs.greatCircleArcIntersect = function(ta0,ta1,tb0,tb1) {
  // based on the formula at http://williams.best.vwh.net/avform.htm#Int

  // method:
  // check to ensure no line segment is zero length - if so, cannot cross
  // check to see if either of the lines start/end at the same point. if so, then they cannot cross
  // check to see if the line segments overlap in longitude. if not, no crossing
  // if overlap, clip each line to the overlapping longitudes, then see if latitudes cross

  // anti-meridian handling. this code will not sensibly handle a case where one point is
  // close to -180 degrees and the other +180 degrees. unwrap coordinates in this case, so one point
  // is beyond +-180 degrees. this is already true in IITC
  // FIXME? if the two lines have been 'unwrapped' differently - one positive, one negative - it will fail

	//Dimand: Lets fix the date line issue.
	//always work in the eastern hemisphere. so += 360

	//fuck this object scope

	a0={};
	a1={};
	b0={};
	b1={};
	a0.lng=ta0.lng;
	a0.lat=ta0.lat;
	a1.lng=ta1.lng;
	a1.lat=ta1.lat;
	b0.lng=tb0.lng;
	b0.lat=tb0.lat;
	b1.lng=tb1.lng;
	b1.lat=tb1.lat;
	//debugger;
	// zero length line tests
  if ((a0.lat==a1.lat)&&(a0.lng==a1.lng)) return false;
  if ((b0.lat==b1.lat)&&(b0.lng==b1.lng)) return false;

  // lines have a common point
	if ((a0.lat==b0.lat)&&(a0.lng==b0.lng)) return false;
	if ((a0.lat==b1.lat)&&(a0.lng==b1.lng)) return false;
	if ((a1.lat==b0.lat)&&(a1.lng==b0.lng)) return false;
	if ((a1.lat==b1.lat)&&(a1.lng==b1.lng)) return false;

	// a0.lng<=-90 && a1.lng>=90 dosent suffice... a link from -70 to 179 still crosses
	//if a0.lng-a1.lng >180 or <-180 there is a cross!
	var aCross = false;
	var bCross = false;
	//this is the real link
	if ((a0.lng-a1.lng)<-180 ||(a0.lng-a1.lng)>180)
	{	//we have a dateline cross
		//console.log('DateLine Cross!');
		//move everything in the eastern hemisphere to the extended eastern one
		aCross = true;
		if (a0.lng <0)
		{
			a0.lng += 360;
		}
		if (a1.lng <0)
		{
			a1.lng += 360;
		}
	}
	//this is the arc
	if ((b0.lng-b1.lng)<-180 ||(b0.lng-b1.lng)>180)
	{
		//console.log('DateLine Cross!');
		bCross=true;
		if (b0.lng <0)
		{
			b0.lng += 360;
		}
		if (b1.lng <0)
		{
			b1.lng += 360;
		}
	}
	//now corrected both a and b for date line crosses.
	//now if link is entirely in the west we need to move it to the east.
	if (bCross && aCross)
	{
		//both got moved. all should be good.
		//do nothing
	}
	else if (aCross)
	{
		//now we need to move any links in the west of the main one
		if (Math.max(b0.lng,b1.lng)<Math.min(a0.lng,a1.lng))
		{
			//console.log('arc shift');
			b0.lng += 360;
			b1.lng += 360;
		}
	}
	else if (bCross)
	{
		//now we need to move any links in the west of the main one
		if (Math.max(a0.lng,a1.lng)<Math.min(b0.lng,b1.lng))
		{
			//console.log('link shift');
			a0.lng += 360;
			a1.lng += 360;
			//console.log(a0);
			//console.log(a1);
			//console.log(b0);
			//console.log(b1);
		}
	}

  // check for 'horizontal' overlap in longitude
  if (Math.min(a0.lng,a1.lng) > Math.max(b0.lng,b1.lng)) return false;
  if (Math.max(a0.lng,a1.lng) < Math.min(b0.lng,b1.lng)) return false;

  // ok, our two lines have some horizontal overlap in longitude
  // 1. calculate the overlapping min/max longitude
  // 2. calculate each line latitude at each point
  // 3. if latitudes change place between overlapping range, the lines cross

  // class to hold the pre-calculated maths for a geodesic line
  // TODO: move this outside this function, so it can be pre-calculated once for each line we test
  var GeodesicLine = function(start,end) {
    var d2r = Math.PI/180.0;
    var r2d = 180.0/Math.PI;

    // maths based on http://williams.best.vwh.net/avform.htm#Int

    if (start.lng == end.lng) {
      throw 'Error: cannot calculate latitude for meridians';
    }

    // only the variables needed to calculate a latitude for a given longitude are stored in 'this'
    this.lat1 = start.lat * d2r;
    this.lat2 = end.lat * d2r;
    this.lng1 = start.lng * d2r;
    this.lng2 = end.lng * d2r;

    var dLng = this.lng1-this.lng2;

    var sinLat1 = Math.sin(this.lat1);
    var sinLat2 = Math.sin(this.lat2);
    var cosLat1 = Math.cos(this.lat1);
    var cosLat2 = Math.cos(this.lat2);

    this.sinLat1CosLat2 = sinLat1*cosLat2;
    this.sinLat2CosLat1 = sinLat2*cosLat1;

    this.cosLat1CosLat2SinDLng = cosLat1*cosLat2*Math.sin(dLng);
  };

  GeodesicLine.prototype.isMeridian = function() {
    return this.lng1 == this.lng2;
  };

  GeodesicLine.prototype.latAtLng = function(lng) {
    lng = lng * Math.PI / 180; //to radians

    var lat;
    // if we're testing the start/end point, return that directly rather than calculating
    // 1. this may be fractionally faster, no complex maths
    // 2. there's odd rounding issues that occur on some browsers (noticed on IITC MObile) for very short links - this may help
    if (lng == this.lng1) {
      lat = this.lat1;
    } else if (lng == this.lng2) {
      lat = this.lat2;
    } else {
      lat = Math.atan ( (this.sinLat1CosLat2*Math.sin(lng-this.lng2) - this.sinLat2CosLat1*Math.sin(lng-this.lng1))/this.cosLat1CosLat2SinDLng);
    }
    return lat * 180 / Math.PI; // return value in degrees
  };



  // calculate the longitude of the overlapping region
  var leftLng = Math.max( Math.min(a0.lng,a1.lng), Math.min(b0.lng,b1.lng) );
  var rightLng = Math.min( Math.max(a0.lng,a1.lng), Math.max(b0.lng,b1.lng) );
  //console.log(leftLng);
  //console.log(rightLng);

  // calculate the latitudes for each line at left + right longitudes
  // NOTE: need a special case for meridians - as GeodesicLine.latAtLng method is invalid in that case
  var aLeftLat, aRightLat;
  if (a0.lng == a1.lng) {
    // 'left' and 'right' now become 'top' and 'bottom' (in some order) - which is fine for the below intersection code
    aLeftLat = a0.lat;
    aRightLat = a1.lat;
  } else {
    var aGeo = new GeodesicLine(a0,a1);
    aLeftLat = aGeo.latAtLng(leftLng);
    aRightLat = aGeo.latAtLng(rightLng);
  }

  var bLeftLat, bRightLat;
  if (b0.lng == b1.lng) {
    // 'left' and 'right' now become 'top' and 'bottom' (in some order) - which is fine for the below intersection code
    bLeftLat = b0.lat;
    bRightLat = b1.lat;
  } else {
    var bGeo = new GeodesicLine(b0,b1);
    bLeftLat = bGeo.latAtLng(leftLng);
    bRightLat = bGeo.latAtLng(rightLng);
  }
	//console.log(aLeftLat);
	//console.log(aRightLat);
	//console.log(bLeftLat);
	//console.log(bRightLat);
  // if both a are less or greater than both b, then lines do not cross

  if (aLeftLat < bLeftLat && aRightLat < bRightLat) return false;
  if (aLeftLat > bLeftLat && aRightLat > bRightLat) return false;

  // latitudes cross between left and right - so geodesic lines cross
  //console.log('Xlink!');
  return true;
};



window.plugin.arcs.testPolyLine = function (arc, link) {

    var a = link.getLatLngs();
	var start = {};
	var end = {};
    start.lat = arc.startPortal.lat;
	start.lng = arc.startPortal.lon;
	end.lat = arc.endPortal.lat;
	end.lng = arc.endPortal.lon;

    if (window.plugin.arcs.greatCircleArcIntersect(a[0],a[1],start,end)) return true;

    return false;
};



window.plugin.arcs.checkAllLinks = function() {
	window.plugin.arcs.blockerCounterList = {};
    if (window.plugin.arcs.disabled) return;

    console.debug("Cross-Links: checking all links");
    plugin.arcs.linkLayer.clearLayers();
    plugin.arcs.linkLayerGuids = {};

    $.each(window.links, function(guid, link) {
        plugin.arcs.testLink(link);
    });

    var iLinkCount = 0;
    var iPortalsCount = 0;
    var iEnlPortalsCount = 0;
    var portalCount = {};
    var portalList = {};

    $
        .each(
        window.plugin.arcs.blockerCounterList,
        function(guid, link) {
            if (typeof link.options.guid != 'undefined') {
                details = links[link.options.guid];

                // Portal 1
                if (typeof portalCount[details.options.data.dGuid] == 'undefined') {
                    portalCount[details.options.data.dGuid] = 1;
                } else {
                    portalCount[details.options.data.dGuid]++;
                }

                // Portal 2
                if (typeof portalCount[details.options.data.oGuid] == 'undefined') {
                    portalCount[details.options.data.oGuid] = 1;
                } else {
                    portalCount[details.options.data.oGuid]++;
                }

                iLinkCount++;
            }
        });
    $
        .each(
        window.plugin.arcs.blockerCounterList,
        function(guid, link) {
            if (typeof link.options.guid != 'undefined') {
                details = links[link.options.guid];
                portal1 = portals[details.options.data.dGuid];
                portal2 = portals[details.options.data.oGuid];

                if (portalCount[details.options.data.dGuid] >= portalCount[details.options.data.oGuid]) {
                    // Portal 1
                    if (typeof portal1 != 'undefined') {
                        portalList[details.options.data.dGuid] = portal1.options.data;
                    } else {
                        console.debug("Anchor not loaded: "+ details.options.data.dGuid+ ' (increase zoomlevel)');
                    }
                } else {
                    // Portal 2
                    if (typeof portal2 != 'undefined') {
                        portalList[details.options.data.oGuid] = portal2.options.data;
                    } else {
                        console.debug("Anchor not loaded: "+ details.options.data.oGuid+ ' (increase zoomlevel)');
                    }
                }
            }
        });

    $
        .each(
        portalList,
        function(guid, portal) {
            try {
                if (typeof portal != 'undefined') {
                    anchorHtml = "";

                    if (portal.team == "E") {
                        iEnlPortalsCount++;
                    }

                    if (portal.team == "R") {
                       iPortalsCount++;
                    }

                }

            } catch (e) {
                console.debugger('error in Cross-Links-Counter->showLinkList: '+e);
            }
        });
    var msg = "Arcs Blockers - R: " + iPortalsCount + "&nbsp;&nbsp;&nbsp;E: " + iEnlPortalsCount;
    $('.plugin-arcs-crosslinks-stats').html(msg);


	////// check for xlinks between arcs here. redraw all arcs on this procudure.//////////////////////
	// basical just go through the standard redraw but for each arc check that it doesn't cross another one else we draw them dotted.
	//refresh the layer group
	window.plugin.arcs.drawlayer.clearLayers();
	window.plugin.arcs.link_list = [];

	var arc_list = JSON.parse(localStorage.getItem('arc_list' ));
	//cycle through and print them on load.
	for (var m=0;m<arc_list.length;m++)
	{
		var doesItCross=false;
		var link = arc_list[m];

		var startCoord = new window.plugin.arcs.arc.Coord(link.startPortal.lon, link.startPortal.lat);
		var stopCoord = new window.plugin.arcs.arc.Coord(link.endPortal.lon, link.endPortal.lat);

		var ta0={};
		var ta1={};
		var tb0={};
		var tb1={};

		ta0.lng=link.startPortal.lon;
		ta0.lat=link.startPortal.lat;
		ta1.lng=link.endPortal.lon;
		ta1.lat=link.endPortal.lat;

		for (var n=0;n<arc_list.length;n++)
		{
			var testlink = arc_list[n];
			tb0.lng=testlink.startPortal.lon;
			tb0.lat=testlink.startPortal.lat;
			tb1.lng=testlink.endPortal.lon;
			tb1.lat=testlink.endPortal.lat;

			if (window.plugin.arcs.greatCircleArcIntersect(ta0,ta1,tb0,tb1))
			{
				doesItCross=true;
			}
		}
		//edit this function to have a xlink option
		window.plugin.arcs.create(startCoord, stopCoord, link, doesItCross);
	}


};

window.plugin.arcs.testLink = function (link) {
	if (plugin.arcs.linkLayerGuids[link.options.guid]) return;

	var arc_list = JSON.parse(localStorage.getItem('arc_list' ));
	for (i=0;i<arc_list.length;i++)
	{
		//console.log(link.getLatLngs());
		if (plugin.arcs.testPolyLine(arc_list[i], link,true))
		{
			window.plugin.arcs.blockerCounterList[link.options.guid] = link;
			//console.log(link.getLatLngs());
			plugin.arcs.showLink(link);
			// blocker recorder
			window.plugin.arcs.addBlocker(link.options.guid, link);
		}
	}
};


window.plugin.arcs.showLink = function(link) {

    var poly = L.geodesicPolyline(link.getLatLngs(), {
       color: '#d22',
       opacity: 0.7,
       weight: 5,
       clickable: false,
       dashArray: [8,8],

       guid: link.options.guid
    });

    poly.addTo(plugin.arcs.linkLayer);
    plugin.arcs.linkLayerGuids[link.options.guid]=poly;
};


window.plugin.arcs.createLayer = function() {
    window.plugin.arcs.linkLayer = new L.FeatureGroup();
    window.plugin.arcs.linkLayerGuids={};
    window.addLayerGroup('Arc Cross Links', window.plugin.arcs.linkLayer, true);

    map.on('layeradd', function(obj) {
      if(obj.layer === window.plugin.arcs.linkLayer) {
        delete window.plugin.arcs.disabled;
        window.plugin.arcs.checkAllLinks();
        $('.plugin-arcs-crosslinks-stats').show();
      }
    });
    map.on('layerremove', function(obj) {
      if(obj.layer === window.plugin.arcs.linkLayer) {
        window.plugin.arcs.disabled = true;
        window.plugin.arcs.linkLayer.clearLayers();
        plugin.arcs.linkLayerGuids = {};
        $('.plugin-arcs-crosslinks-stats').hide();
      }
    });

    // ensure 'disabled' flag is initialised
    if (!map.hasLayer(window.plugin.arcs.linkLayer)) {
        window.plugin.arcs.disabled = true;
    }
};


/////////////////////// draw full great circle hack
//don't save these lines. just add one cord pair and write to the whole sphere
window.plugin.arcs.extend = function (lat1,lng1,lat2,lng2) {
	var R = 6367; // km
	var d2r = Math.PI/180.0;
    var r2d = 180.0/Math.PI;

	lat1 = lat1 * d2r;
    lat2 = lat2 * d2r;
    lng1 = lng1 * d2r;
    lng2 = lng2 * d2r;

    var sinLat1 = Math.sin(lat1);
    var sinLat2 = Math.sin(lat2);
    var cosLat1 = Math.cos(lat1);
    var cosLat2 = Math.cos(lat2);
	var sinDiff= Math.sin(lng1-lng2);
	var cosDiff= Math.cos(lng1-lng2);

	var coords = [];

	for ( i = -100000; i <= 100000; i ++)
	{
	lng =(i/100000)*Math.PI;
	lat=Math.atan((sinLat1*cosLat2*Math.sin(lng-lng2)-sinLat2*cosLat1*Math.sin(lng-lng1))/(cosLat1*cosLat2*sinDiff));
	latd=lat*r2d;
	lngd=lng*r2d;
	//console.log(latd+','+lngd);
	coords.push([lngd,latd]);
	}
	//console.log(coords);
	//draws the link on the map
	var myStyle = {
		"color": arcColor,
		"weight": 3,
		"opacity": 0.7
	};

	var geojson_feature ={"type":"LineString","coordinates":coords};
	//add to layer
	var line = new L.geoJson(geojson_feature,{style: myStyle}).addTo(window.plugin.arcs.drawlayer);

	bindString='';
	bindString+='<div>';
	bindString+='<a id="arc_remove">Remove Arc</a></div>';

	line.bindPopup(bindString);
	line.bringToBack();
    line.on('popupopen', function() { document.getElementById("arc_remove").onclick = function () {map.removeLayer(line);map.closePopup();} ;} );
	line.on('contextmenu', function() { map.removeLayer(line); } );
};

window.plugin.arcs.clearBlockerList = function() { localStorage.removeItem('arc_blocker_list'); };
window.plugin.arcs.getBlockerList = function() { return JSON.parse(localStorage.getItem('arc_blocker_list') || '{}'); };
window.plugin.arcs.saveBlockerList = function(blockers) { localStorage.setItem('arc_blocker_list', JSON.stringify(blockers)); };
window.plugin.arcs.addBlocker = function(guid, link) {
    if (window.plugin.arcs.blockerRecording) {
        var blockers = window.plugin.arcs.getBlockerList();
        blockers[guid] = link.getLatLngs();
        window.plugin.arcs.saveBlockerList(blockers);
    }
};
window.plugin.arcs.deleteBlocker = function(guid) {
    var blockers = window.plugin.arcs.getBlockerList();
    delete blockers[guid];
    window.plugin.arcs.saveBlockerList(blockers);
};
window.plugin.arcs.showBlockerList = function() {
    var drawtools = [];
    var blockers = window.plugin.arcs.getBlockerList();
    var i;
    $.each(blockers,function(guid, latLngs) {
        console.log(i);
        drawtools.push({
            "type": "polyline",
            "latLngs": latLngs,
            "color": "#ee1111"
            });
    });
    dialog({
        html: '<div id="blockerdiag">Recorded blockers in draw-tools format.<br><textarea id="arcBlockerTextArea">' + JSON.stringify(drawtools) + '</textarea></div>',
        dialogClass: 'ui-dialog-portal',
        title: 'Recorded blockers',
        id: 'recorded-arc-blockers',
        buttons: {
            'Clear blockers': function() {
                window.plugin.arcs.clearBlockerList();
                $("#arcBlockerTextArea").text('[]');
            },
            'Keep recording': function() {
                window.plugin.arcs.crosslinkRecord();
                $(this).dialog('close');
            }
        }
    });
};

window.plugin.arcs.crosslinkRecord = function() {
    if (window.plugin.arcs.blockerRecording) {
        window.plugin.arcs.blockerRecording = false;
        $('#recButton').text('Arc REC xlinks');
        window.plugin.arcs.showBlockerList();
    }
    else {
        window.plugin.arcs.blockerRecording = true;
        $('#recButton').text('Stop Recording');
        // Force a link check
        window.plugin.arcs.checkAllLinks();
    }
};

////Anchor shift function
//this will move all arcs from one portal to another portal.

var anchorEnd = 'start';


window.plugin.arcs.anchorShift = function() {
		//console.log('test');
	if (window.selectedPortal === null)
	{
		$('#ArcError1').fadeIn(400).delay(400).fadeOut(400);
		return;
	}
	var el = document.getElementById("anchorButton");

	//Lets do some more. Store portal lat,long, name address and guid.
	var portal = {};
	//var portal_full = window.portals[window.selectedPortal];

    var guid = window.selectedPortal;
    var p = window.portals[guid];
    var d = p.options.data;
    var label = d.title;
    var lat = p.getLatLng().lat;
    var lng = p.getLatLng().lng;
    var details = portalDetail.get(guid);

	portal.title = label;
	//portal.address = details.descriptiveText.map.ADDRESS;
	portal.lat = lat;
	portal.lon = lng;
	portal.guid = guid;

	//if things were not loaded yet stop
	console.log(portal.title);
	if (!label)
		{
		console.log('Portal data not loaded');
		$('#ArcError1').fadeIn(400).delay(400).fadeOut(400);
		return;
		}

	if (anchorEnd == 'start') {
		window.plugin.arcs.startAnchorPortalGUID = portal.guid;
		el.innerHTML='Anchor Shift End';
		anchorEnd = 'stop';
	}
	else{
		//endPortal = portal;
		el.innerHTML='Anchor Shift Start';
		anchorEnd = 'start';
		//now we go through the arc list and find any arcs that went to the start anchor portal.
		var arc_list = JSON.parse(localStorage.getItem('arc_list' ));
		for (i=0;i<arc_list.length;i++)
		{
			checkArc=arc_list[i];
			if (checkArc.startPortal.guid===window.plugin.arcs.startAnchorPortalGUID)
			{
				//the start portal matches. Replace this with portal
				window.plugin.arcs.link = {};
				window.plugin.arcs.link.startPortal = portal;
				window.plugin.arcs.link.endPortal = checkArc.endPortal;
				window.plugin.arcs.link.distance = window.plugin.arcs.distance(window.plugin.arcs.link);
				//no color change
				window.plugin.arcs.link.color = checkArc.color;
				//If it was a 0 distance. DO NOT MAKE
				if (window.plugin.arcs.link.distance === 0)
				{
					//Nope! do nothing here
					//continue;
				}
				else
				{
					var stopCoord = new window.plugin.arcs.arc.Coord(window.plugin.arcs.link.endPortal.lon, window.plugin.arcs.link.endPortal.lat);
					var startCoord = new window.plugin.arcs.arc.Coord(window.plugin.arcs.link.startPortal.lon, window.plugin.arcs.link.startPortal.lat);
					window.plugin.arcs.create(startCoord, stopCoord, window.plugin.arcs.link);
					//add to local storage list
					arc_list[i] = window.plugin.arcs.link;
				}

			}
			if (checkArc.endPortal.guid===window.plugin.arcs.startAnchorPortalGUID)
			{
				//the start portal matches. Replace this with portal
				window.plugin.arcs.link = {};
				window.plugin.arcs.link.endPortal = portal;
				window.plugin.arcs.link.startPortal = checkArc.startPortal;
				window.plugin.arcs.link.distance = window.plugin.arcs.distance(window.plugin.arcs.link);
				//no color change
				window.plugin.arcs.link.color = checkArc.color;
				//If it was a 0 distance. DO NOT MAKE
				if (window.plugin.arcs.link.distance === 0)
				{
					//Nope! do nothing here
					//continue;
				}
				else
				{
					var stopCoord = new window.plugin.arcs.arc.Coord(window.plugin.arcs.link.endPortal.lon, window.plugin.arcs.link.endPortal.lat);
					var startCoord = new window.plugin.arcs.arc.Coord(window.plugin.arcs.link.startPortal.lon, window.plugin.arcs.link.startPortal.lat);
					window.plugin.arcs.create(startCoord, stopCoord, window.plugin.arcs.link);
					//add to local storage list
					arc_list[i] = window.plugin.arcs.link;
				}

			}
		}

		//now we have rewitten all portals I will redraw everything.

		//save changes
		localStorage.setItem( 'arc_list', JSON.stringify(arc_list) );

		//refresh the layer group
		window.plugin.arcs.drawlayer.clearLayers();
		window.plugin.arcs.link_list = [];
		//redraw all lines
		for (var m=0;m<arc_list.length;m++)
		{
			var link = arc_list[m];
			var startCoord = new window.plugin.arcs.arc.Coord(link.startPortal.lon, link.startPortal.lat);
			var stopCoord = new window.plugin.arcs.arc.Coord(link.endPortal.lon, link.endPortal.lat);
			window.plugin.arcs.create(startCoord, stopCoord, link);
		}

	}

};



var setup =  window.plugin.arcs.loadExternals;


// PLUGIN END //////////////////////////////////////////////////////////

if(window.iitcLoaded && typeof setup === 'function') {
  setup();
} else {
  if(window.bootPlugins)
    window.bootPlugins.push(setup);
  else
    window.bootPlugins = [setup];
}
} // wrapper end
// inject code into site context
var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ wrapper +')();'));
(document.body || document.head || document.documentElement).appendChild(script);
