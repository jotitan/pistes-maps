var Maps2D = {
	map:null,
	iconMarker:new google.maps.MarkerImage("http://maps.google.com/mapfiles/ms/micons/snowflake_simple.png", null, null, null, new google.maps.Size(16, 16)),
   
   getAltitude:function(lat,lng,callback){
   	new google.maps.ElevationService().getElevationForLocations({locations:[new google.maps.LatLng(lat,lng)]},function(results,status){
   		console.log(results);
   	});

   },
	showPoint:function(pointPlacemark){
      if(pointPlacemark.geoObject!=null){
         pointPlacemark.geoObject.marker.setVisible(true);
         return;
      }
      var marker = new google.maps.Marker({position:new google.maps.LatLng(pointPlacemark.point.lat,pointPlacemark.point.lng),map:this.map,title:pointPlacemark.nom,icon:this.iconMarker});
      google.maps.event.addListener(marker,'mouseover',function(){
			Maps2D.showInfo(pointPlacemark);
		});
		google.maps.event.addListener(marker,'mouseout',function(){
			$('#info').empty();
		});
		pointPlacemark.geoObject = {marker:marker};
	},
	showLine:function(placemark){
      if(placemark.geoObject!=null){
         placemark.geoObject.line.setVisible(true);
         placemark.geoObject.marker.setVisible(true);
         return;
      }
      var coords = [];
		$(placemark.line).each(function(){
			coords.push(new google.maps.LatLng(this.lat,this.lng));
		});
		var p = new google.maps.Polyline({path:coords,strokeColor: "#" + convertColor(placemark.style.color),strokeOpacity: 1.0,strokeWeight: placemark.style.width,map:this.map});
		google.maps.event.addListener(p,'mouseover',function(){
			Maps2D.showInfo(placemark);
		});
		google.maps.event.addListener(p,'mouseout',function(){
			$('#info').empty();
		});
		var marker = new google.maps.Marker({position:new google.maps.LatLng(placemark.line[0].lat,placemark.line[0].lng),map:this.map,title:"Départ " + placemark.nom,icon:this.iconMarker});
        placemark.geoObject = {line:p,marker:marker};
	},
	showInfo:function(placemark){
		$('#info').empty().fadeIn(100).append('<span style="color:#' + placemark.style.color + '">' + placemark.nom + '</span>');
	},
   hideLine:function(placemark){
      if(placemark.geoObject!=null){
         placemark.geoObject.line.setVisible(false);
         placemark.geoObject.marker.setVisible(false);
         return;
      }
   },
   hidePoint:function(pointPlacemark){
      if(pointPlacemark.geoObject!=null){
         pointPlacemark.geoObject.marker.setVisible(false);
         return;
      }
   },
   showZone:function(placemark){
	 if(placemark.geoObject!=null){
         placemark.geoObject.polygon.setVisible(true);
         return;
      }
		var coords = [];
		$(placemark.line).each(function(){
			coords.push(new google.maps.LatLng(this.lat,this.lng));
		});
		var polygon = new google.maps.Polygon({
		paths: coords,
		strokeColor: "#" + convertColor(placemark.style.color),
		strokeOpacity: getOpacityColor(placemark.style.color),
		strokeWeight: 2,
		fillColor: "#" + convertColor(placemark.style.poly),
		fillOpacity: getOpacityColor(placemark.style.poly),
		map:this.map
	  });
	
	placemark.geoObject = {polygon:polygon};
   },
   hideZone:function(placemark){
   	 if(placemark.geoObject!=null){
         placemark.geoObject.polygon.setVisible(false);
      }
   },
	init:function(center){
		this.map = new google.maps.Map($('#maps').get(0),{
          center: new google.maps.LatLng(center.lat, center.lng),
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        });
	}

}
