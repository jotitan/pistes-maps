/* Interface decrivant les methodes a implementer */
var Maps = {
	/* Initialisation de l'objet */
   	init:function(center){
   		alert("Not implemented");
    },
     /* Centre la camera en fonction des donnees affichees */
     centerCamera:function(center){
   		alert("Not implemented");
     },
     /* Affiche une ligne (un trajet) */
     showLine : function(placemark){
		alert("Not implemented");
     },
     /* Affiche une zone (un polygon) */
     showZone : function(placemark){
		alert("Not implemented");
     },
     /* Cache la ligne */
     hideLine : function(placemark){
        alert("Not implemented");
     },
     /* Masque une zone */
     hideZone : function(placemark){
        alert("Not implemented");
     },
     /* Positionne la camera (3D). Les options sont les caracteristiques :
     longitude, latitude, altitude, roll (axe Y), heading (axe Z), tilt (axe Y)*/
     placeCamera:function(options){
        alert("Not implemented");
     },
     /* Defini le point de vue (3D). Les options sont les caracteristiques :
     longitude, latitude, range, heading (axe Z), tilt (axe Y)*/
     defineLookup:function(options){
        alert("Not implemented");
     }
};
