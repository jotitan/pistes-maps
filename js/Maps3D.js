/* Lance les taches dans sa queue, mais temporise entre chaque, pour redonner la main au navigateur */
  /* Verifie toutes les secondes le status. Enregistre la derniere date */
  var Ordonnenceur = {
     delay:100, // duree entre deux traitements
     tasks:[],   // liste de fonction. Pas d'appel asynchrone
     status:0,   // 0 : aucune tache en cours, 1 : une tache en cours
     treatNextTask:function(){
        if(this.status != 0 && this.tasks.length == 0){
           return;  // on ne trait pas la tache
        }
        var task = this.tasks.splice(0,1)[0];  // on prend le premier element
        try{
           task();
        }catch(e){}
        finally{
           // On temporise le prochain lancement
           Ordonnenceur.treatDelay();
        }
     },
     /* Lance le traitement en differe */
     treatDelay:function(){
        setTimeout(function(){Ordonnenceur.treatNextTask();},this.delay);
     },
     addTask:function(task){
        this.tasks.push(task);
        this.treatDelay();
     }
  };

  var Maps3D = {
     earth:null,
     init:function(center){
        google.earth.createInstance("maps", function(instance){
           Maps3D.earth = instance;
           Maps3D.earth.getWindow().setVisibility(true);
           Maps3D.earth.getOptions().setScaleLegendVisibility(true);
           Maps3D.centerCamera(center);
        }, function(){});
     },
     /* Centre la camera en fonction des donnees affichees */
     centerCamera:function(center){
        this.earth.getOptions().setFlyToSpeed(this.earth.SPEED_TELEPORT);
        this.placeCamera({latitude:center.lat,longitude:center.lng,altitude:100000});
        this.earth.getOptions().setFlyToSpeed(1);

        // A partir de la nouvelle position, on calcule le champ affiche, on attend 0.1
        setTimeout(function(){
            var bounds = Maps3D.earth.getView().getViewportGlobeBounds();
            // On se base sur la largeur (width)
            var altitude = (100000 * center.width) / (bounds.getEast() - bounds.getWest()) + 2500;
            Maps3D.defineLookup({latitude:center.lat,longitude:center.lng,range:altitude,tilt:50,heading:170});
        },100);
     },
     /* Affiche une ligne */
     showLine : function(placemark){
        if(placemark.geoObject!=null){
           placemark.geoObject.line.setVisibility(true);
           return;
        }
        var pl = this.earth.createPlacemark('');
        var line = this.earth.createLineString('');
        pl.setGeometry(line);

        // On place le premier et dernier point
        var firstPoint = placemark.line[0];
        var lastPoint = placemark.line[placemark.line.length-1];
        
        line.getCoordinates().pushLatLngAlt(firstPoint.lat,firstPoint.lng,firstPoint.alt);
        line.getCoordinates().pushLatLngAlt(lastPoint.lat,lastPoint.lng,lastPoint.alt);

        Ordonnenceur.addTask(function(){
           line.getCoordinates().pop();  // on enleve le dernier
           // On ajoute les suivants
           $(placemark.line).each(function(i){
                 if(i>0){
                    line.getCoordinates().pushLatLngAlt(this.lat,this.lng,this.alt);
                 }
           });
        });
        if(placemark.altitudeMode == 'relativeToGround'){
           line.setAltitudeMode(this.earth.ALTITUDE_RELATIVE_TO_GROUND);
           line.setExtrude(true);
        }

        pl.setStyleSelector(this.earth.createStyle(''));
        var style = pl.getStyleSelector().getLineStyle();
        style.setWidth(parseFloat(placemark.style.width));
        style.getColor().set(placemark.style.color);

        this.earth.getFeatures().appendChild(pl);
        placemark.geoObject = {line:pl};
     },
     /* Affiche une zone. Placemark de type polygon (PlacemarkPolygon) */
     showZone : function(placemark){
        if(placemark.geoObject!=null){
           placemark.geoObject.polygon.setVisibility(true);
           return;
        }
        var pl = this.earth.createPlacemark('');
        var polygon = this.earth.createPolygon('');
        var line = this.earth.createLinearRing('');
        pl.setGeometry(polygon);

        $(placemark.line).each(function(i){
           line.getCoordinates().pushLatLngAlt(this.lat,this.lng,this.alt);
        });
        if(placemark.altitudeMode == 'relativeToGround'){
           polygon.setAltitudeMode(this.earth.ALTITUDE_RELATIVE_TO_GROUND);
           polygon.setExtrude(true);
        }
        polygon.setOuterBoundary(line);

        pl.setStyleSelector(this.earth.createStyle(''));
        var style = pl.getStyleSelector().getLineStyle();
        style.getColor().set(placemark.style.color);

        style = pl.getStyleSelector().getPolyStyle();
        style.getColor().set(placemark.style.poly);

        this.earth.getFeatures().appendChild(pl);
        placemark.geoObject = {polygon:pl};
     },
     /* Cache la ligne */
     hideLine : function(placemark){
        if(placemark.geoObject!=null){
           placemark.geoObject.line.setVisibility(false);
        }
     },
     /* Cache la zone */
     hideZone : function(placemark){
        if(placemark.geoObject!=null){
           placemark.geoObject.polygon.setVisibility(false);
        }
     },
     /* Positionne la camera. Les options sont les caracteristiques :
     longitude, latitude, altitude, roll (axe Y), heading (axe Z), tilt (axe Y)*/
     placeCamera:function(options){
        var look = this.earth.getView().copyAsCamera(this.earth.ALTITUDE_RELATIVE_TO_GROUND);
        for(var property in options){
           var method = "set" + property.charAt(0).toUpperCase() + property.substr(1);
           look[method](options[property]);
        }
        this.earth.getView().setAbstractView(look);
     },
     /* Defini le point de vue. Les options sont les caracteristiques :
     longitude, latitude, range, heading (axe Z), tilt (axe Y)*/
     defineLookup:function(options){
        var look = this.earth.getView().copyAsLookAt(this.earth.ALTITUDE_RELATIVE_TO_GROUND);
        for(var property in options){
           var method = "set" + property.charAt(0).toUpperCase() + property.substr(1);
           look[method](options[property]);
        }
        this.earth.getView().setAbstractView(look);
     },
  }
