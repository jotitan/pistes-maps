var Reader = {
   topFolder:null,
   xml:null,   // Flux xml

   getBaliseValue:function(xml,name){
	  if($(xml).find(' > ' + name).length == 0){return null;}
      return $(xml).find(' > ' + name).text();
   },
   /* Cherche le style a partir de l'url */
   findStyle:function(url){
	var color = {color:'ff000000',width:1};
      var style = this.xml.find('StyleMap' +  url + ' > Pair:has(key:contains("normal")) > styleUrl');
      // A partir de stylemap, on cherche le style
      if(style.length > 0){
         style = this.xml.find('Style' + style.text() + ' > LineStyle');
         if(style.length > 0){
            color = {color:style.find('color').text(),width:style.find('width').text()};
            if(style.parent().find('PolyStyle').length >0){
               color.poly = style.parent().find('PolyStyle > color').text();
            }
         }        
      }
	SpecificColors[convertColor(color.color)] = 1;	// on sauvegarde la liste de toutes les couleurs
      return color;
   },
   parseFolder:function(xml){
       var folder = new Folder(Reader.getBaliseValue(xml,'name'));
       // Recuperation des sous repertoires
       xml.find('> Folder').each(function(){
          folder.folders.push(Reader.parseFolder($(this)));
       });
       // Recuperation des placesmark
       xml.find('> Placemark').each(function(){
          folder.placemarks.push(Reader.parsePlacemark($(this)));
       });

       return folder;
   },
   parsePlacemark:function(xml){
      var placemark = null;
	   // On lit un point ou une ligne
	   if(xml.find('Point').length > 0){
        placemark = new PlacemarkPoint(Reader.getBaliseValue(xml,'name'))
	  	  var point = Reader.parseCoordinates(xml.find('Point'));
        if(point!=null && point.length>0){
         placemark.point = point[0];
        }
	   }
	   if(xml.find('LineString').length > 0){
        var lineString = xml.find('LineString');
        placemark = new PlacemarkLine(Reader.getBaliseValue(xml,'name'))
	  	  placemark.line = Reader.parseCoordinates(lineString);
        placemark.altitudeMode = this.getBaliseValue(lineString,'altitudeMode');
	   }
      if(xml.find('Polygon').length > 0){
         var polygon = xml.find('Polygon');
         placemark = new PlacemarkPolygon(Reader.getBaliseValue(xml,'name'))
         placemark.line = Reader.parseCoordinates(polygon.find(' outerBoundaryIs > LinearRing'));
      }
      if(placemark == null){return null;}
      placemark.description = Reader.getBaliseValue(xml,'description');

      var style = Reader.getBaliseValue(xml,'styleUrl');
      placemark.style = this.findStyle(style);
      return placemark;
   },
   parseCoordinates:function(bloc){
   	  var coordinates = Reader.getBaliseValue(bloc,'coordinates');
   	  // Parse avec espace (separateur de point) avec avec virgules
   	  var points = [];
   	  $(coordinates.split(" ")).each(function(){
           if(this.match(new RegExp(/([\d]+(\.[\d]+)?,){2}([\d]+(\.[\d]+)?)/))){
               var point = this.split(",");
           	  points.push({lng:parseFloat(point[0]),lat:parseFloat(point[1]),alt:parseFloat(point[2])});
           }
   	  });
   	  return points;
   },
   /* Calcul le centre */
   calculateCenter:function(){
      var bounds = this.topFolder.getBounds();
      var lat = (bounds.min.lat + bounds.max.lat)/2;
      var lng = (bounds.min.lng + bounds.max.lng)/2;
      var width = bounds.max.lng - bounds.min.lng;
      var height = bounds.max.lat - bounds.min.lat;
      return {lat:lat,lng:lng,height:height,width:width};
   },
   init:function(file,callback){
      $.ajax({
         url:file,
         dataType:'xml',
         success:function(xml){
            Reader.xml = $(xml).find('Document');
            Reader.topFolder = Reader.parseFolder(Reader.xml.find(' > Folder'));
            callback();
        }
      });
   }
};

var ColorGenerator = {
	canvas:null,
	getColorShape:function(color){
		var context = this.canvas.getContext("2d");
		context.fillStyle = "#" + color;
		context.beginPath();
		context.moveTo(0,16);
		context.lineTo(4,7);
		context.lineTo(8,12);
		context.lineTo(12,3);
		context.lineTo(16,16);	
		context.closePath();
		context.fill();
		return this.canvas.toDataURL();
	},
	init:function(){
		var div = $('<div><canvas width="16px" height="16px"></canvas></div>').hide();
		$('body').append(div);
		this.canvas = $('canvas',div).get(0);
		return this;	
	}
}.init();


var Types = {
   types:{
      PV:{icon:{image:"icones/piste_verte.png",color:"00aa00"},label:"Pistes vertes",type:"PISTE"},
      PB:{icon:{image:"icones/piste_bleue.png",color:"0055FF"},label:"Pistes bleues",type:"PISTE"},
      PR:{icon:{image:"icones/piste_rouge.png",color:"FF0000"},label:"Pistes rouges",type:"PISTE"},
      PN:{icon:{image:"icones/piste_noire.png",color:"000000"},label:"Pistes noires",type:"PISTE"},
      TF:{icon:{image:"icones/teleski.png"},label:"Téléski",type:"REMONTEE"},
   	  TS:{icon:{image:"icones/telesiege.png"},label:"Télésiège",type:"REMONTEE"},
   	  TC:{icon:{image:"icones/telecabine.png"},label:"Télécabine",type:"REMONTEE"},
   	  TR:{icon:{image:"icones/telepherique.png"},label:"Téléphérique",type:"REMONTEE"},
        MA:{icon:{image:"icones/terrain.png"},label:"Montagne"},
   	  folder:{icon:{image:"icones/folder.png"}}
   },
   getTypesIcon:function(){
      var tabTypes = {default:{}};
      for(var type in this.types){
         tabTypes[type] = {icon:{image:this.types[type].icon.image}};
      }
	// On genere les icones pour les couleurs supplementaires
	for(var color in SpecificColors){
		tabTypes["color_" + color] = {icon:{image:ColorGenerator.getColorShape(color)}};
	}
      return tabTypes;
   },
   drawFilters:function(){
    $('#idFiltersPiste,#idFiltersRemontee').on('click',':checkbox',function(event,b){
    	event.target.checked == true ? Tree.checkType($(this).val()) : Tree.uncheckType($(this).val());
    });
   	for(var type in this.types){
   		var t = this.types[type];
   		if(t.label!=null && t.type == "PISTE"){
   			$('#idFiltersPiste').append('<input type="checkbox" id="id_' + type + '" value="' + type + '"/><label for="id_' + type + '"><img src="' + t.icon.image + '" style="width:14px;"/>' + t.label + '</label>');
   		}
   		if(t.label!=null && t.type == "REMONTEE"){
   			$('#idFiltersRemontee').append('<input type="checkbox" id="id_' + type + '" value="' + type + '"/><label for="id_' + type + '"><img src="' + t.icon.image + '" style="width:14px;"/>' + t.label + '</label>');
   		}
   	}
   }
}

var SpecificColors = [];	// Contient un tableau de couleur supplementaires a utiliser

function Folder(nom){
   this.nom = nom;
   this.placemarkType = "FOLDER";
   this.description = null;
   this.folders = [];
   this.placemarks = [];

   /* Renvoie les bornes extremes */
   this.getBounds = function(){
      var min = {lat:Number.POSITIVE_INFINITY,lng:Number.POSITIVE_INFINITY};
      var max = {lat:0,lng:0};

      // On calcule sur les placemarks
      $(this.placemarks).each(function(){
         var p = this.getPoint();
         min.lat = Math.min(min.lat,p.lat);
         max.lat = Math.max(max.lat,p.lat);
         min.lng = Math.min(min.lng,p.lng);
         max.lng = Math.max(max.lng,p.lng);
      });
      // On calcule sur les sous repertoires
      $(this.folders).each(function(){
         var bounds = this.getBounds();
         min.lat = Math.min(min.lat,bounds.min.lat);
         max.lat = Math.max(max.lat,bounds.max.lat);
         min.lng = Math.min(min.lng,bounds.min.lng);
         max.lng = Math.max(max.lng,bounds.max.lng);
      });

      return {min:min,max:max};
   }

   this.toString = function(){
      var str = "\nFOLDER : " + this.nom;
      $(this.folders).each(function(){
         str+="\nSUB: " + this.toString();
      });
      $(this.placemarks).each(function(){
         str+="PL: " + this.toString();
      });
      return str;
   }
}

function Placemark(nom,placemarkType){
   this.nom = nom;
   this.style = null;
   this.placemarkType = placemarkType;
   this.type = null;

   this.toString = function(){
      var str = this.nom;
      return str;
   }

   this.defineType = function(){
      var type = new RegExp(/^([a-z]+) ([:-] )?/i).exec(this.nom);
    	if(type!=null && type.length >1){
    		this.type = type[1];
    		this.nom = this.nom.replace(/^[a-z]+ ([:-] )?/i,"");
    	}
   }
   this.defineType();
}

function PlacemarkLine(nom){
   Placemark.call(this,nom,'LINE');
   this.line = null; // Tableau de coordonnees
   this.altitudeMode = null;
   /* Renvoie le premier point */
   this.getPoint = function(){
      if(this.line!=null && this.line.length > 0){
         return this.line[0];
      }
      return null;
   }
}

function PlacemarkPolygon(nom){
   PlacemarkLine.call(this,nom);
   this.placemarkType = 'POLYGON';

   this.getStyleName = function(){
	if(this.style!=null && this.style.color!=null){
		return "color_" + convertColor(this.style.color)
	}
	return "";
  }
}

function PlacemarkPoint(nom){
   Placemark.call(this,nom,'POINT');
   this.point = null;

   this.getPoint = function(){
      return this.point;
   }
}

var colorReg = new RegExp(/([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/);

/* Converti une couleur BGR en RGB */
function convertColor(color){
   return color.replace(colorReg,'$4$3$2')
}

function getOpacityColor(color){
	if(color == null || color == '') {return 100;}
   return ((100 * parseInt(color.replace(colorReg,'$1'),16))/255)/100;
	
}
