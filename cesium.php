<!DOCTYPE html>
<html>

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

    <title>Blob</title>

   <script src="js/jquery-1.9.0.min.js" language="Javascript">;</script>
   <script src="js/jquery.jstree.js" language="Javascript">;</script>
   <script src="js/Reader.js" language="Javascript">;</script>
   <script src="js/Tree.js" language="Javascript">;</script>
   <script src="js/Maps3DCesium.js" language="Javascript">;</script>
   <script src="js/cesium/Cesium_14.js" language="Javascript">;</script>
  

  </head>
  <body id='body'>

   <script language="Javascript">
      var file = 'kml/La Clusaz.kml';
     /*var scene = null;
      $(function(){
		var canvas = $('#map3d > canvas').get(0);
      //alert(canvas)
      scene = new Cesium.Scene(canvas);
      scene.skyAtmosphere = new Cesium.SkyAtmosphere();

        var primitives = scene.getPrimitives();

		// Bing Maps
		var bing = new Cesium.BingMapsImageryProvider({
		    url : 'http://dev.virtualearth.net',
		    mapStyle : Cesium.BingMapsStyle.AERIAL,
		    // Some versions of Safari support WebGL, but don't correctly implement
		    // cross-origin image loading, so we need to load Bing imagery using a proxy.
		    proxy : Cesium.FeatureDetection.supportsCrossOriginImagery() ? undefined : new Cesium.DefaultProxy('/proxy/')
		});

		var terrainProvider = new Cesium.CesiumTerrainProvider({
		    url : 'http://cesium.agi.com/smallterrain'
		});


		var ellipsoid = Cesium.Ellipsoid.WGS84;
		var centralBody = new Cesium.CentralBody(ellipsoid);
		centralBody.getImageryLayers().addImageryProvider(bing);
      centralBody.terrainProvider = terrainProvider;


		primitives.setCentralBody(centralBody);


        // On desactive le comportement par defaut
        //scene.getScreenSpaceCameraController().enableRotate = false;
        //scene.getScreenSpaceCameraController().enableTranslate = false;
        scene.getScreenSpaceCameraController().enableZoom = false;
        scene.getScreenSpaceCameraController().enableTilt = false;
        scene.getScreenSpaceCameraController().enableLook = false;

        var startMousePosition;
        var mousePosition;
        var flags = {
            looking : false,
            moveForward : false,
            moveBackward : false,
            moveUp : false,
            moveDown : false,
            moveLeft : false,
            moveRight : false
        };

      function getAngleBetweenVecteurs(vec1,vec2){
         var prodScalaire = vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z;
        var norme = Math.sqrt((vec1.x*vec1.x + vec1.y*vec1.y + vec1.z*vec1.z) * (vec2.x*vec2.x + vec2.y*vec2.y + vec2.z*vec2.z));
         
        var angle = Math.acos(Math.min(Math.max(-1,prodScalaire / norme),1));
        var angleDeg = angle*360/(2*Math.PI);
        return angleDeg;
      }

      scene.getAngle = getAngleBetweenVecteurs;

      function animate() {
        var camera = scene.getCamera();
        var controller = camera.controller;

        if (flags.looking) {
            var width = canvas.clientWidth;
            var height = canvas.clientHeight;

            // Coordinate (0.0, 0.0) will be where the mouse was clicked.
            var x = (mousePosition.x - startMousePosition.x) / width;
            var y = -(mousePosition.y - startMousePosition.y) / height;

            var lookFactor = 0.05;
            controller.lookRight(x * lookFactor);
            controller.lookUp(y * lookFactor);
        }

        // Change movement speed based on the distance of the camera to the surface of the ellipsoid.
        var cameraHeight = ellipsoid.cartesianToCartographic(camera.position).height;
        var moveRate = cameraHeight / 100.0; // Hauteur en km
        var rotateRate = (moveRate * (Math.PI/80))/100000;
        var rotateFix = Math.PI/100;
        // Pour le rotate, c'est la camera qui bouge (position)
        // Pour le look et twist, c'est la ou regarde la camera qui bouge (direction)

         // Avant le déplacement, on verifie l'angle forme. Si < 90°, on bloque le mouvement
         var pos = scene.getCamera().position;
         var dir = scene.getCamera().direction;
         var vecteur = {x:dir.x-pos.x,y:dir.y-pos.y,z:dir.z-pos.z}
         
         var angleDeg = getAngleBetweenVecteurs(scene.getCamera().position,scene.getCamera().direction);
         var isUp = getAngleBetweenVecteurs(scene.getCamera().position,scene.getCamera().up) <= 90;
         // On cherche la direction, N ou S, pour savoir si le lookup est vers le haut
         // L'angle dépend de l'altitude, plus on est bas, plus l'angle peut etre ouvert
         // En dessous de 10000, on permet d'aller à 100°, on dessus, on repasse à 120. On retablie l'angle ?
         var limiteAngle = (cameraHeight < 1000)?90:(cameraHeight < 10000)?100:(cameraHeight < 100000)?110:120;
         if((angleDeg - 1.8 <=limiteAngle && (flags.lookUp || flags.slideUp) && isUp)
            || (angleDeg - 1.8 <=limiteAngle && (flags.lookDown || flags.slideDown) && !isUp)){
            return;
         }

        if (flags.moveForward) {
            controller.moveForward(moveRate*5);
        }
        if (flags.moveBackward) {
            controller.moveBackward(moveRate*5);
        }
        if (flags.moveUp) {
            controller.moveUp(moveRate);
        }
        if (flags.moveDown) {
            controller.moveDown(moveRate);
        }
        if (flags.moveLeft) {
            controller.moveLeft(moveRate);
        }
        if (flags.moveRight) {
            controller.moveRight(moveRate);
        }
        if (flags.rotateLeft){
            controller.rotateLeft(rotateRate);
        }
        if (flags.rotateRight){
            controller.rotateRight(rotateRate);
        }
        if (flags.rotateUp){
            controller.rotateUp(rotateRate);
        }
        if (flags.rotateDown){
            controller.rotateDown(rotateRate);
        }
        if (flags.lookUp){
            controller.lookUp(rotateFix);
        }
        if (flags.lookDown){
            controller.lookDown(rotateFix);
        }
        if (flags.lookLeft){
            controller.lookLeft(rotateFix);
        }
        if (flags.lookRight){
            controller.lookRight(rotateFix);
        }
        if (flags.twistLeft){
            controller.twistLeft(rotateFix);
        }
        if (flags.twistRight){
            controller.twistRight(rotateFix);
        }
        if(flags.slideUp){
            controller.lookUp(rotateFix);
            // Plus l'angle s'approche de la limite (100°), plus on diminue l'altitude (produit en croix : 180)
            // Abaisser la hauteur quand on s'approche de la verticale. Mettre des bornes a 90°
            controller.moveForward(20000);
        }
        if(flags.slideDown){
            controller.lookDown(rotateFix);
            // Abaisser la hauteur quand on s'approche de la verticale. Mettre des bornes a 90°
            controller.moveBackward(20000);
        }
    }

   /* On reproduit le comportement de GE
    function getFlagForKeyCode(keyCode,shift,ctrl) {
        switch (keyCode) {
        case 37:
            if(shift){
               return {action:'twistLeft',second:'rotateLeft'};
            }
            return {action:'rotateLeft',second:'twistLeft'};
        case 39:
            if(shift){
               return {action:'twistRight',second:'rotateRight'};
            }
            return {action:'rotateRight',second:'twistRight'};
        case 38:
            if(shift && !ctrl){
               return {action:'slideDown',second:'rotateDown',third:'lookUp'};
            }
            if(ctrl &&!shift){
               return {action:'lookUp',second:'rotateDown',third:'slideDown'};
            }
            return {action:'rotateDown',second:'lookUp',third:'slideDown'};
        case 40:
            if(shift && !ctrl){
               return {action:'slideUp',second:'rotateUp',third:'lookDown'};
            }
            if(ctrl &&!shift){
               return {action:'lookDown',second:'rotateUp',third:'slideUp'};
            }
            return {action:'rotateUp',second:'lookDown',third:'slideUp'};
        case 33:
            return {action:'moveForward'};
        case 34:
            return {action:'moveBackward'};
        case 'Z'.charCodeAt(0):
            return {action:'moveUp'};
        case 'S'.charCodeAt(0):
            return {action:'moveDown'};
        case 'D'.charCodeAt(0):
            return {action:'moveRight'};
        case 'Q'.charCodeAt(0):
            return {action:'moveLeft'};
        default:
            return undefined;
        }
    }

    document.addEventListener('keydown', function(e) {
        var flagsName = getFlagForKeyCode(e.keyCode,e.shiftKey,e.ctrlKey);
        if (typeof flagsName !== 'undefined') {
            flags[flagsName.action] = true;
        }
    }, false);

    document.addEventListener('keyup', function(e) {
        var flagsName = getFlagForKeyCode(e.keyCode,e.shiftKey,e.ctrlKey);
        if (typeof flagsName !== 'undefined') {
            flags[flagsName.action] = false;
            if(flagsName.second!=null){
               flags[flagsName.second] = false;
            }
        }
    }, false);

		var transitioner = new Cesium.SceneTransitioner(scene, ellipsoid);
		 function tick() {
			scene.initializeFrame();
			scene.render();
         animate();
			Cesium.requestAnimationFrame(tick);
		}
		tick();

		var onResize = function() {
		    var width = canvas.clientWidth;
		    var height = canvas.clientHeight;
		    if (canvas.width === width && canvas.height === height) {
		        return;
		    }
		    canvas.width = width;
		    canvas.height = height;
		    scene.getCamera().frustum.aspectRatio = width / height;
		};

		onResize();
      });
      */
      /*
      var ellipsoid = Cesium.Ellipsoid.WGS84;
        var poly = new Cesium.Polygon();
        poly.material.uniforms.color ={red:0.0,green:1.0,blue:0.0,alpha:0.3};
        poly.setPositions([
        ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(0,0,0)),
        ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(30,40,0)),
        ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(130,140,0))
        ]);
        scene.getPrimitives().add(poly)
        */
		var maps = Maps3DCesium;			
        Reader.init(file,function(){
		  Tree.init(Reader,maps,'tree');
		  maps.init(Reader.calculateCenter());
	   });   
	   Types.drawFilters();

   </script>

<div  style="float:left">
	<div id="info" style="height:25px;"></div>
	<div id="tree" ></div>
</div>

<div style="float:left;width:800px;height:600px">
	<div style="width:100%;height:100%" id="map3d">
		<canvas style="width:100%;height:100%"></canvas>
	</div>
	<div id="idFiltersPiste"></div>
	<div id="idFiltersRemontee"></div>
</div>


  </body>
</html>
