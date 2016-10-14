/**
 * Created by tom on 13/10/2016.
 */
const GLOBE_RADIUS = 1;
const ORIGIN = new THREE.Vector3(0,0,0);

var TWEEN = require('tween.js');

module.exports = {

    /**
     * Converts a Lat/Lon to a Vector3 above a sphere's surface
     * @param lat - latitude
     * @param lon - longitude
     * @param radius - radius of sphere
     * @param height - distance above surface of sphere to place vector
     * @returns {*|Vector3}
     */
    latLonToVector3 : function(lat, lon, radius, height) {
        var phi = (lat)*Math.PI/180;
        var theta = (lon-180)*Math.PI/180;
    
        var x = -(radius+height) * Math.cos(phi) * Math.cos(theta);
        var y = (radius+height) * Math.sin(phi);
        var z = (radius+height) * Math.cos(phi) * Math.sin(theta);
    
        return new THREE.Vector3(x,y,z);
    },

    /**
     * Calculate the distance between 2 Vector3's
     * @param v1 - Vector3
     * @param v2 - Vector3
     * @returns {number}
     */
    distanceBetween : function( v1, v2 ) {
        var dx = v1.x - v2.x;
        var dy = v1.y - v2.y;
        var dz = v1.z - v2.z;

        return Math.sqrt( dx * dx + dy * dy + dz * dz );
    },

    tweenCameraToLatLon : function (camera, lat, lon) {
        var distToOrigin = this.distanceBetween(camera.position, ORIGIN);
        var t = new TWEEN.Tween(camera.position)
            .to(this.latLonToVector3(lat, lon, GLOBE_RADIUS, distToOrigin - GLOBE_RADIUS), 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function() {
                camera.lookAt(ORIGIN);
            })
            .onComplete(function() {
                camera.lookAt(ORIGIN);
            })
            .start();
    },

    animate : function(time) {
        TWEEN.update(time);
    }
    
};