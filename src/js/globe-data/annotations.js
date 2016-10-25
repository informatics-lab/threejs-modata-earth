

const GLOBE_RADIUS = 1;
const ORIGIN = new THREE.Vector3(0,0,0);

var GlobeUtils = require('../globe-utils');

module.exports = function(globeData, dataAnnotations) {

    var self = this;
    self.globeData = globeData;
    self.dataAnnotations = dataAnnotations;
    self.activeAnnotations = [];
    var annotationsList = document.createElement("ul");
    annotationsList.id = "annotations";
    document.getElementById("content").appendChild(annotationsList);

    function addPointer() {
        var pointerMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 2
        });

        var pointerGeometry = new THREE.Geometry();
        pointerGeometry.vertices.push(
            GlobeUtils.latLonToVector3(50.71,-3.53,1,0.01),
            GlobeUtils.latLonToVector3(50.71,-3.53,1,0.2)
        );

        var line = new THREE.Line( geometry, material );
        scene.add( line );
    }


    function makeTextSprite( message, parameters ) {
        if ( parameters === undefined ) parameters = {};

        var fontface = parameters.hasOwnProperty("fontface") ?
            parameters["fontface"] : "Emeric";

        var fontsize = parameters.hasOwnProperty("fontsize") ?
            parameters["fontsize"] : 18;

        var borderThickness = parameters.hasOwnProperty("borderThickness") ?
            parameters["borderThickness"] : 4;

        var borderColor = parameters.hasOwnProperty("borderColor") ?
            parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };

        var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
            parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

        // var spriteAlignment = THREE.SpriteAlignment.topLeft;

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;

        // get size data (height depends only on font size)
        var metrics = context.measureText( message );
        var textWidth = metrics.width;

        // background color
        context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
            + backgroundColor.b + "," + backgroundColor.a + ")";
        // border color
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
            + borderColor.b + "," + borderColor.a + ")";

        context.lineWidth = borderThickness;
        //roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
        // 1.4 is extra height factor for text below baseline: g,j,p,q.

        // text color
        context.fillStyle = "rgba(255, 255, 255, 1.0)";

        context.fillText( message, borderThickness, fontsize + borderThickness);

        // canvas contents will be used for a texture
        var texture = new THREE.Texture(canvas)
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial(
            { map: texture, color:0xFFFFFF } );
        var sprite = new THREE.Sprite( spriteMaterial );
        return sprite;
    }

    function getAnnotationRing(origin, size) {
        var ringMaterial = new THREE.LineDashedMaterial({
            color: 0xFFFFFF,
            linewidth: 2
        });

        var ringGeometry = new THREE.CircleGeometry(size, 64);
        ringGeometry.vertices.shift();  //remove central vertex
        ringGeometry.computeLineDistances();

        var ringMesh = new THREE.LineSegments( ringGeometry, ringMaterial );

        ringMesh.position.set(origin.x, origin.y, origin.z);
        ringMesh.lookAt(self.globeData.scene.origin);
        return ringMesh;
    }
    
    function getAnnotationSpot(origin, size) {
        var spotMaterial = new THREE.MeshBasicMaterial({
            color: 0x93cd0b,
            side: THREE.DoubleSide,
            transparent: true,
            opacity : 0.8
        });

        var spotGeometry = new THREE.CircleGeometry(size, 64);

        var spotMesh = new THREE.Mesh( spotGeometry, spotMaterial );

        spotMesh.position.set(origin.x, origin.y, origin.z);
        spotMesh.lookAt(self.globeData.scene.origin);
        return spotMesh;
    }

    function getAnnotationLine(){}

    function addAnnotationText(annotation){
        var annotationDOM = document.createElement("p");
        annotationDOM.innerHTML = annotation.annotation;
        annotationDOM.id = annotation.id;
        annotationsList.appendChild(annotationDOM);
    }

    function removeAnnotationText(annotation){
        var annotationDOM = document.getElementById(annotation.id);
        annotationsList.removeChild(annotationDOM);
    }
    
    function addAnnotation(annotation) {
        if(annotation.location){
            var annotationOrigin = GlobeUtils.xyzFromLatLng(annotation.location.lat,
                                                            annotation.location.lon,
                                                            (self.globeData.radius * 1.01));
            var wrapper = new THREE.Object3D();
            var ringSize = self.globeData.radius / 10;
            var annotationRing = getAnnotationRing(annotationOrigin, ringSize);
            var annotationSpot = getAnnotationSpot(annotationOrigin, ringSize/3);
            // var annotationLine = getAnnotationLine();

            wrapper.add(annotationRing);
            wrapper.add(annotationSpot);
            // wrapper.add(annotationLine);

            self.globeData.dataMesh.add(wrapper);
        }

        addAnnotationText(annotation);

        self.activeAnnotations.push(annotation);
    }

    function removeAnnotation(annotation) {
        // if(annotation.location){

        // }
        removeAnnotationText(annotation);
        self.activeAnnotations = self.activeAnnotations.filter(function(el){return el.id != annotation.id});
    }

    function activateAnnotations(year) {
        var activeIds = self.activeAnnotations.map(function(el){return el.id});
        self.dataAnnotations.forEach(function(annotation) {
            if(annotation.start_year <= year && year < annotation.end_year && activeIds.indexOf(annotation.id) == -1) {
                addAnnotation(annotation);
            }
        });
    }

    function deactivateAnnotations(year) {
        self.activeAnnotations.forEach(function(annotation){
            if(year < annotation.start_year || year >= annotation.end_year) {
                removeAnnotation(annotation);
            }
        })
    }

    // self.globeData.mesh.addEventListener("animate", function(evt){
        //
    // });

    return {

        update: function(dataSet) {
            var dateTime = new Date(dataSet.date_time);
            var yr = dateTime.getFullYear();
            activateAnnotations(yr);
            deactivateAnnotations(yr);
        },

        add : function(lat, lon, msg) {
            addAnnotation(lat, lon, msg);
            self.list.push()
        },

        remove : function() {
            //TODO
        },
    }

};