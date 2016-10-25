

const GLOBE_RADIUS = 1;
const ORIGIN = new THREE.Vector3(0,0,0);

var GlobeUtils = require('../globe-utils');

module.exports = function(globeData, dataAnnotations, camera) {
    var self = this;
    self.globeData = globeData;
    self.dataAnnotations = dataAnnotations;
    self.activeAnnotations = [];
    self.camera = camera;
    var annotationsList = document.createElement("ul");
    annotationsList.id = "annotations";
    document.getElementById("content").appendChild(annotationsList);


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

    function getAnnotationLine(origin, annotationDOM){
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(origin.x, origin.y, origin.z));

        var annotationDOMpos = annotationDOM.getBoundingClientRect();


        var vector = new THREE.Vector3( (annotationDOMpos.left/window.innerWidth)*2-1, -(annotationDOMpos.bottom/window.innerHeight)*2+1, -1).unproject( self.camera );
        geometry.vertices.push(vector);

        var material = new THREE.LineBasicMaterial({
            color: 0xffffff
        });

        var line = new THREE.Line(geometry, material);

        return line;
    }

    function addAnnotationText(annotation){
        var annotationDOM = document.createElement("p");
        annotationDOM.innerHTML = annotation.annotation;
        annotationDOM.id = annotation.id;
        annotationsList.appendChild(annotationDOM);
        return annotationDOM;
    }

    function removeAnnotationText(annotation){
        var annotationDOM = document.getElementById(annotation.id);
        annotationsList.removeChild(annotationDOM);
    }
    
    function addAnnotation(annotation) {
        var annotationDOM = addAnnotationText(annotation);
        if(annotation.location){
            var annotationOrigin = GlobeUtils.xyzFromLatLng(annotation.location.lat,
                                                            annotation.location.lon,
                                                            (self.globeData.radius * 1.01));
            var wrapper = new THREE.Object3D();
            var ringSize = self.globeData.radius / 10;
            var annotationRing = getAnnotationRing(annotationOrigin, ringSize);
            var annotationSpot = getAnnotationSpot(annotationOrigin, ringSize/3);
            var annotationLine = getAnnotationLine(annotationOrigin, annotationDOM);

            wrapper.add(annotationRing);
            wrapper.add(annotationSpot);
            wrapper.add(annotationLine);
            wrapper.name = annotation.id;

            self.globeData.dataMesh.add(wrapper);
        }

        self.activeAnnotations.push(annotation);
    }

    function removeAnnotation(annotation) {
        if(annotation.location){
            var thisObj = self.globeData.dataMesh.getObjectByName(annotation.id);
            self.globeData.dataMesh.remove(thisObj);
        }
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