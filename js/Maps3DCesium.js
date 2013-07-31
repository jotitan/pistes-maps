var Maps3DCesium = {
    scene: null,
    ellipsoid: null,
    canvas: null,
    flags: null,
    earthRayon: 6371, // en km
    viewAngle: Math.PI / 3,
    init: function (center) {
        this.canvas = $('#map3d > canvas').get(0);
        this.scene = new Cesium.Scene(this.canvas);
        this.scene.skyAtmosphere = new Cesium.SkyAtmosphere();

        var bing = new Cesium.BingMapsImageryProvider({
            url: 'http://dev.virtualearth.net',
            mapStyle: Cesium.BingMapsStyle.AERIAL,
            proxy: Cesium.FeatureDetection.supportsCrossOriginImagery() ? undefined : new Cesium.DefaultProxy('/proxy/')
        });
        var terrainProvider = new Cesium.CesiumTerrainProvider({
            url: 'http://cesium.agi.com/smallterrain'
        });
        this.ellipsoid = Cesium.Ellipsoid.WGS84;
        var centralBody = new Cesium.CentralBody(this.ellipsoid);
        centralBody.getImageryLayers().addImageryProvider(bing);
        //centralBody.terrainProvider = terrainProvider;

        this.scene.getPrimitives().setCentralBody(centralBody);

        // On desactive le comportement par defaut
        //scene.getScreenSpaceCameraController().enableRotate = false;
        //scene.getScreenSpaceCameraController().enableTranslate = false;
        this.scene.getScreenSpaceCameraController().enableZoom = false;
        this.scene.getScreenSpaceCameraController().enableTilt = false;
        this.scene.getScreenSpaceCameraController().enableLook = false;

        var startMousePosition;
        var mousePosition;
        this.flags = {
            looking: false,
            moveForward: false,
            moveBackward: false,
            moveUp: false,
            moveDown: false,
            moveLeft: false,
            moveRight: false
        };
        document.addEventListener('keydown', function (e) {
            var flagsName = Maps3DCesium._getFlagForKeyCode(e.keyCode, e.shiftKey, e.ctrlKey);
            if (typeof flagsName !== 'undefined') {
                Maps3DCesium.flags[flagsName.action] = true;
            }
        }, false);

        document.addEventListener('keyup', function (e) {
            var flagsName = Maps3DCesium._getFlagForKeyCode(e.keyCode, e.shiftKey, e.ctrlKey);
            if (typeof flagsName !== 'undefined') {
                Maps3DCesium.flags[flagsName.action] = false;
                if (flagsName.second != null) {
                    Maps3DCesium.flags[flagsName.second] = false;
                }
            }
        }, false);

        var transitioner = new Cesium.SceneTransitioner(this.scene, this.ellipsoid);

        function tick() {
            Maps3DCesium.scene.initializeFrame();
            Maps3DCesium.scene.render();
            Maps3DCesium._animate();
            Cesium.requestAnimationFrame(tick);
        }
        tick();

        var onResize = function () {
            var canvas = Maps3DCesium.canvas;
            var width = canvas.clientWidth;
            var height = canvas.clientHeight;
            if (canvas.width === width && canvas.height === height) {
                return;
            }
            canvas.width = width;
            canvas.height = height;
            Maps3DCesium.scene.getCamera().frustum.aspectRatio = width / height;
        };

        onResize();
        this.centerCamera(center);

    },
    /* Place la camera */
    centerCamera: function (center) {
        // On doit recuperer l'altitude
        var altitude = this._getAltitudeToView(center); // en km
        this.flyToPoint({
            lat: center.lat,
            lng: center.lng,
            altitude: altitude * 1000
        });
    },
    /* Renvoie l'altitude d'observation pour que la longueur (representee par une difference de latitude) a la surface de la terre soit correctement visualisee */
    _getAltitudeToView: function (center) {
        var lengthOnMap = this._getLengthOfAngle(this._degreeToRad(center.lat), this._degreeToRad(center.width));
        return (lengthOnMap / 2) * Math.tan(this.viewAngle / 2) * 2;
    },
    _degreeToRad: function (alpha) {
        return (alpha * Math.PI / 180);
    },
    /** Renvoie la longueur d'une distance d'arc pour une longitude donnee */
    /* La latitude lnb et l'angle sont en radians */
    _getLengthOfAngle: function (lng, angle) {
        var rayonLongitude = this.earthRayon * Math.cos(lng);
        return angle * rayonLongitude;
    },
    _getAngleBetweenVecteurs: function (vec1, vec2) {
        var prodScalaire = vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z;
        var norme = Math.sqrt((vec1.x * vec1.x + vec1.y * vec1.y + vec1.z * vec1.z) * (vec2.x * vec2.x + vec2.y * vec2.y + vec2.z * vec2.z));

        var angle = Math.acos(Math.min(Math.max(-1, prodScalaire / norme), 1));
        var angleDeg = angle * 360 / (2 * Math.PI);
        return angleDeg;
    },
    flyToPoint: function (point) {
        var sc = Cesium.CameraFlightPath.createAnimationCartographic(
            this.scene.getFrameState(), {
            destination: Cesium.Cartographic.fromDegrees(point.lng, point.lat, point.altitude)
        });
        this.scene.getAnimations().add(sc)
    },
    _animate: function () {
        var camera = this.scene.getCamera();
        var controller = camera.controller;

        if (this.flags.looking) {
            var width = this.canvas.clientWidth;
            var height = this.canvas.clientHeight;

            // Coordinate (0.0, 0.0) will be where the mouse was clicked.
            var x = (mousePosition.x - startMousePosition.x) / width;
            var y = -(mousePosition.y - startMousePosition.y) / height;

            var lookFactor = 0.05;
            controller.lookRight(x * lookFactor);
            controller.lookUp(y * lookFactor);
        }

        // Change movement speed based on the distance of the camera to the surface of the ellipsoid.
        var cameraHeight = this.ellipsoid.cartesianToCartographic(camera.position).height;
        var moveRate = cameraHeight / 100.0; // Hauteur en km
        var rotateRate = (moveRate * (Math.PI / 80)) / 100000;
        var rotateFix = Math.PI / 100;
        // Pour le rotate, c'est la camera qui bouge (position)
        // Pour le look et twist, c'est la ou regarde la camera qui bouge (direction)

        // Avant le déplacement, on verifie l'angle forme. Si < 90°, on bloque le mouvement
        var pos = this.scene.getCamera().position;
        var dir = this.scene.getCamera().direction;
        var vecteur = {
            x: dir.x - pos.x,
            y: dir.y - pos.y,
            z: dir.z - pos.z
        }

        var angleDeg = this._getAngleBetweenVecteurs(this.scene.getCamera().position, this.scene.getCamera().direction);
        var isUp = this._getAngleBetweenVecteurs(this.scene.getCamera().position, this.scene.getCamera().up) <= 90;
        // On cherche la direction, N ou S, pour savoir si le lookup est vers le haut
        // L'angle dépend de l'altitude, plus on est bas, plus l'angle peut etre ouvert
        // En dessous de 10000, on permet d'aller à 100°, on dessus, on repasse à 120. On retablie l'angle ?
        var limiteAngle = (cameraHeight < 1000) ? 90 : (cameraHeight < 10000) ? 100 : (cameraHeight < 100000) ? 110 : 120;
        if ((angleDeg - 1.8 <= limiteAngle && (this.flags.lookUp || this.flags.slideUp) && isUp) || (angleDeg - 1.8 <= limiteAngle && (this.flags.lookDown || this.flags.slideDown) && !isUp)) {
            return;
        }

        if (this.flags.moveForward) {
            controller.moveForward(moveRate * 5);
        }
        if (this.flags.moveBackward) {
            controller.moveBackward(moveRate * 5);
        }
        if (this.flags.moveUp) {
            controller.moveUp(moveRate);
        }
        if (this.flags.moveDown) {
            controller.moveDown(moveRate);
        }
        if (this.flags.moveLeft) {
            controller.moveLeft(moveRate);
        }
        if (this.flags.moveRight) {
            controller.moveRight(moveRate);
        }
        if (this.flags.rotateLeft) {
            controller.rotateLeft(rotateRate);
        }
        if (this.flags.rotateRight) {
            controller.rotateRight(rotateRate);
        }
        if (this.flags.rotateUp) {
            controller.rotateUp(rotateRate);
        }
        if (this.flags.rotateDown) {
            controller.rotateDown(rotateRate);
        }
        if (this.flags.lookUp) {
            controller.lookUp(rotateFix);
        }
        if (this.flags.lookDown) {
            controller.lookDown(rotateFix);
        }
        if (this.flags.lookLeft) {
            controller.lookLeft(rotateFix);
        }
        if (this.flags.lookRight) {
            controller.lookRight(rotateFix);
        }
        if (this.flags.twistLeft) {
            controller.twistLeft(rotateFix);
        }
        if (this.flags.twistRight) {
            controller.twistRight(rotateFix);
        }
        if (this.flags.slideUp) {
            controller.lookUp(rotateFix);
            // Plus l'angle s'approche de la limite (100°), plus on diminue l'altitude (produit en croix : 180)
            // Abaisser la hauteur quand on s'approche de la verticale. Mettre des bornes a 90°
            controller.moveForward(20000);
        }
        if (this.flags.slideDown) {
            controller.lookDown(rotateFix);
            // Abaisser la hauteur quand on s'approche de la verticale. Mettre des bornes a 90°
            controller.moveBackward(20000);
        }
    },

    /* On reproduit le comportement de GE */
    _getFlagForKeyCode: function (keyCode, shift, ctrl) {
        switch (keyCode) {
            case 37:
                if (shift) {
                    return {
                        action: 'twistLeft',
                        second: 'rotateLeft'
                    };
                }
                return {
                    action: 'rotateLeft',
                    second: 'twistLeft'
                };
            case 39:
                if (shift) {
                    return {
                        action: 'twistRight',
                        second: 'rotateRight'
                    };
                }
                return {
                    action: 'rotateRight',
                    second: 'twistRight'
                };
            case 38:
                if (shift && !ctrl) {
                    return {
                        action: 'slideDown',
                        second: 'rotateDown',
                        third: 'lookUp'
                    };
                }
                if (ctrl && !shift) {
                    return {
                        action: 'lookUp',
                        second: 'rotateDown',
                        third: 'slideDown'
                    };
                }
                return {
                    action: 'rotateDown',
                    second: 'lookUp',
                    third: 'slideDown'
                };
            case 40:
                if (shift && !ctrl) {
                    return {
                        action: 'slideUp',
                        second: 'rotateUp',
                        third: 'lookDown'
                    };
                }
                if (ctrl && !shift) {
                    return {
                        action: 'lookDown',
                        second: 'rotateUp',
                        third: 'slideUp'
                    };
                }
                return {
                    action: 'rotateUp',
                    second: 'lookDown',
                    third: 'slideUp'
                };
            case 33:
                return {
                    action: 'moveForward'
                };
            case 34:
                return {
                    action: 'moveBackward'
                };
            case 'Z'.charCodeAt(0):
                return {
                    action: 'moveUp'
                };
            case 'S'.charCodeAt(0):
                return {
                    action: 'moveDown'
                };
            case 'D'.charCodeAt(0):
                return {
                    action: 'moveRight'
                };
            case 'Q'.charCodeAt(0):
                return {
                    action: 'moveLeft'
                };
            default:
                return undefined;
        }
    },
    /* Affiche une ligne. Utilise les polyline. A voir les polyline collection */
    showLine: function (placemark) {
        if (placemark.geoObject != null) {
            this.polylines.add(placemark.geoObject.line);
            return;
        }
		if(this.polylines == null){
	        this.polylines = new Cesium.PolylineCollection(undefined);
	        this.scene.getPrimitives().add(this.polylines);
	    }
	    var polyline = this.polylines.add();
	    var positions = [];
        $(placemark.line).each(function (i) {
            positions.push(Maps3DCesium.ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(this.lng, this.lat, this.alt)));
        });
        polyline.setPositions(positions);
        polyline.width = 3;
        polyline.outlineWidth = 10.0;
        polyline.setColor(this._formatColor(placemark.style.color));
        placemark.geoObject = {line:polyline};
    },
    _formatColor:function(color){
		if(color == null || color == ''){
			return {red:1,green:1,blue:1};
		}
		return {
			red:parseInt(color.substring(0,2),16)/255,
			green:parseInt(color.substring(2,4),16)/255,
			blue:parseInt(color.substring(4,6),16)/255
		};   		
    },
    hideLine:function(placemark){
		if(placemark!=null && placemark.geoObject!=null){
			this.polylines.remove(placemark.geoObject.line);
		}
                
    },
    /* Affiche une zone */
    showZone: function (placemark) {
        if (placemark.geoObject != null) {
            this.scene.getPrimitives().add(placemark.geoObject.polygon);
            return;
        }
        console.log(this._formatColor(placemark.style.color));
        var polygon = this._createPolygon(placemark.line,this._formatColor(placemark.style.color));
        this.scene.getPrimitives().add(polygon);
        placemark.geoObject = {
            polygon: polygon
        };
    },
    /* Cache la zone */
    hideZone: function (placemark) {
        if (placemark.geoObject != null) {
            this.scene.getPrimitives().remove(placemark.geoObject.polygon);
        }
    },
    _createPolygon: function (coordinates, color) {
        var poly = new Cesium.Polygon();
        poly.material.uniforms.color = {
            red: color.red,
            green: color.green,
            blue: color.blue,
            alpha: 0.3
        };
        var positions = [];
        $(coordinates).each(function (i) {
            positions.push(Maps3DCesium.ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(this.lng, this.lat, this.alt)));
        });
        poly.setPositions(positions);
        return poly;
    }
}
