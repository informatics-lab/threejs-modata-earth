/**
 * Created by tom on 13/10/2016.
 */

const GLOBE_RADIUS = 1;
const ORIGIN = new THREE.Vector3(0,0,0);

var GlobeUtils = require('../globe-utils');

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

function getAnnotationRing(lat, lon) {
    var ringOrigin = GlobeUtils.latLonToVector3(lat,lon,GLOBE_RADIUS,0.01);

    var ringMaterial = new THREE.LineDashedMaterial({
        color: 0x93cd0b,
        linewidth: 2,
        transparent: true,
        opacity: 0.6
    });

    var ringGeometry = new THREE.CircleGeometry(GLOBE_RADIUS / 10, 64);
    ringGeometry.vertices.shift();  //remove central vertex
    ringGeometry.computeLineDistances();

    var ringMesh = new THREE.LineSegments( ringGeometry, ringMaterial );

    ringMesh.position.set(ringOrigin.x, ringOrigin.y, ringOrigin.z);
    ringMesh.lookAt(ORIGIN);
    ringMesh.name = "ring";
    return ringMesh;
}

module.exports = function(globe) {

    var self = this;
    self.globe = globe;
    self.list = [];

    return {

        list : self.list,

        add : function(lat, lon, msg) {
            var annotation = new THREE.Object3D();
            var annotationRing = getAnnotationRing(lat, lon);
            annotation.add(annotationRing);

            self.globe.add(annotation);
            self.list.push(annotation);
        },

        remove : function() {
            //TODO
        },

        animate : function() {
            self.list.forEach(function(annotation) {
                var marker = annotation.getObjectByName("ring");
                marker.rotateZ(0.01);
            });
        }
    }

};