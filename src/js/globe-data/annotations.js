var GlobeUtils = require('../globe-utils');

module.exports = function(globeDataMesh, camera, radius, dataAnnotations, autoAnimate) {

    var self = this;
    self.globeDataMesh = globeDataMesh;
    self.camera = camera;
    self.autoAnimate = autoAnimate;

    self.radius = radius;
    self.dataAnnotations = dataAnnotations;
    self.activeAnnotations = [];

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
        ringMesh.lookAt(self.globeDataMesh.parent.origin);
        ringMesh.name = "ring";

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
        spotMesh.lookAt(self.globeDataMesh.parent.origin);
        return spotMesh;
    }

    function addAnnotationText(annotation){
        var annotationDOM = document.createElement("li");
        var annotationText = "<h3>"+annotation.title+"</h3>";
        if(annotation.annotation) {
            annotationText = annotationText + "<p>" + annotation.annotation + "</p>";
        }

        annotationDOM.innerHTML = "<div class='annotationWrapper'>" + annotationText + "</div>";

        annotationDOM.id = annotation.id;
        annotationsList.appendChild(annotationDOM);
        setTimeout(function() {
            annotationDOM.style.opacity = 1;
        }, 5);
        return annotationDOM;
    }

    function removeAnnotationText(annotation){
        var annotationDOM = document.getElementById(annotation.id);
        var rec = annotationDOM.getBoundingClientRect();
        annotationDOM.style.height = String(rec.height) + 'px';
        setTimeout(function(){
            annotationDOM.style.opacity = 0;
            annotationDOM.style.height = '0px';
        }, 5);
        setTimeout(function(){
            annotationsList.removeChild(annotationDOM)
        }, 1010);
    }
    
    function addAnnotation(annotation) {
        var annotationDOM = addAnnotationText(annotation);
        if(annotation.location){
            var annotationOrigin = GlobeUtils.xyzFromLatLng(annotation.location.lat,
                                                            annotation.location.lon,
                                                            self.radius);
            var wrapper = new THREE.Object3D();
            var ringSize = self.radius / 10;
            var annotationRing = getAnnotationRing(annotationOrigin, ringSize);
            var annotationSpot = getAnnotationSpot(annotationOrigin, ringSize/3);

            wrapper.add(annotationRing);
            wrapper.add(annotationSpot);
            wrapper.name = annotation.id;

            annotation.wrapper = wrapper;
            self.globeDataMesh.add(wrapper);

            if(autoAnimate.object.animate) {
                if(!GlobeUtils.tweening) {
                    GlobeUtils.tweenCameraToLatLon(self.camera, annotation.location.lat, annotation.location.lon);
                }
            }
        }

        self.activeAnnotations.push(annotation);
    }

    function removeAnnotation(annotation) {
        if(annotation.location){
            var thisObj = self.globeDataMesh.getObjectByName(annotation.id);
            self.globeDataMesh.remove(thisObj);
        }
        removeAnnotationText(annotation);
        self.activeAnnotations = self.activeAnnotations.filter(function(el){return el.id != annotation.id});
    }

    function activateAnnotations(year) {
        var activeIds = self.activeAnnotations.map(
            function (el){
                return el.id
            });
        self.dataAnnotations.forEach(function (annotation) {
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

    self.globeDataMesh.addEventListener('animate', function(){
       self.activeAnnotations.forEach(function(annotation){
          if (annotation.wrapper) {
              var ring = annotation.wrapper.getObjectByName('ring');
              ring.rotateZ(0.03);
          }
       });
    });

    return {
        update: function(dataSet) {
            var dateTime = new Date(dataSet.date_time);
            var yr = dateTime.getFullYear();
            activateAnnotations(yr);
            deactivateAnnotations(yr);
        }
    }

};