<!DOCTYPE html>
<html>

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

    <title>Blob</title>

    <script src="http://www.google.com/jsapi?key=AIzaSyCf0e7TC34X6EzkpsvtKyuqebjiosrzwak"></script>
   <script src="js/jquery-1.9.0.min.js" language="Javascript">;</script>
   <script src="js/jquery.jstree.js" language="Javascript">;</script>
   <script src="js/Reader.js" language="Javascript">;</script>
   <script src="js/Tree.js" language="Javascript">;</script>
   <script src="js/Maps3D.js" language="Javascript">;</script>   
    <script>
		google.load("earth", "1");
    </script>
  </head>
  <body id='body'>

   <script language="Javascript">
      var file = 'kml/La Clusaz.kml';
     
      $(function(){
         Reader.init(file,function(){
            Tree.init(Reader,Maps3D,'tree');
            Maps3D.init(Reader.calculateCenter());
         });
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
