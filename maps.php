<!DOCTYPE html>
<html>

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCf0e7TC34X6EzkpsvtKyuqebjiosrzwak&sensor=false">;</script>

<script src="js/jquery-1.9.0.min.js" language="Javascript">;</script>
<script src="js/jquery.jstree.js" language="Javascript">;</script>
<script src="js/Maps2D.js" language="Javascript">;</script>
<script src="js/Reader.js" language="Javascript">;</script>
<script src="js/Tree.js" language="Javascript">;</script>
</head>

<body>
<!-- Ajouter polygone des domaines, par repertoire -->

<script language="Javascript">

var file = 'kml/La Clusaz.kml';

/* Gere la carte, permet l'affiche de point, trajets... */


$(function(){
   Reader.init(file,function(){
      Tree.init(Reader,Maps2D,'tree');
   });
   Maps2D.init({lat:45.9,lng:6.423});
	Types.drawFilters();
});


</script>

<div  style="float:left">
	<div id="info" style="height:25px;"></div>
	<div id="tree" ></div>
</div>

<div style="float:left;width:800px;height:600px">
	<div style="width:100%;height:100%" id="maps"></div>
	<div id="idFiltersPiste"></div>
	<div id="idFiltersRemontee"></div>
</div>


</body>

</html>
