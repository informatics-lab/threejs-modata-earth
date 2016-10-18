/**
 * Created by tom on 17/10/2016.
 */
const GLOBE_RADIUS = 1;
const MESH_RADIUS_RATIO = 1.01;

module.exports = function(scene, datapointsX, datapointsY) {

    var self = this;

    function xyzFromLatLng(lat, lng, radius) {
        var phi = (90 - lat) * Math.PI / 180;
        var theta = (360 - lng) * Math.PI / 180;

        return {
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.cos(phi),
            z: radius * Math.sin(phi) * Math.sin(theta)
        };
    };

    /**
     * Generates a Plane Buffer Geometry given the origin vector3
     * @param origin
     */
    function generateSphereFaceBufferGeometry(originLat, originLng) {

        var faceOffsetDegrees = 0.125;

        var sfWidth = 180 / datapointsY;
        var sfHeight = 360 / datapointsX;

        var offsetX = (sfWidth / 2) - faceOffsetDegrees;
        var offsetY = (sfHeight / 2) - faceOffsetDegrees;

        var sfBufferGeometry = new THREE.BufferGeometry();
        var sfVertPositions = new Float32Array(18);
        var sfVertColors = new Float32Array(18);

    }

    function createMeshes() {
        var mesh_radius = GLOBE_RADIUS * 1.01;
        var sphere_vert_positions = [];

        for (var lng_idx = 0; lng_idx < hadcrut4.num_lng; ++lng_idx) {

            for (var lat_idx = 0; lat_idx < hadcrut4.num_lat; ++lat_idx) {

                var lat1 = (90.0 - 2.5) - lat_idx * 5;
                var lng1 = lng_idx * 5 - 180.0 + 2.5;

                var degrees_offset = 2.375;
                var pos_tl = xyzFromLatLng(lat1 - degrees_offset, lng1 + degrees_offset, mesh_radius);
                var pos_tr = xyzFromLatLng(lat1 + degrees_offset, lng1 + degrees_offset, mesh_radius);
                var pos_bl = xyzFromLatLng(lat1 - degrees_offset, lng1 - degrees_offset, mesh_radius);
                var pos_br = xyzFromLatLng(lat1 + degrees_offset, lng1 - degrees_offset, mesh_radius);

                sphere_vert_positions.push(pos_tl.x);
                sphere_vert_positions.push(pos_tl.y);
                sphere_vert_positions.push(pos_tl.z);
                sphere_vert_positions.push(pos_tr.x);
                sphere_vert_positions.push(pos_tr.y);
                sphere_vert_positions.push(pos_tr.z);
                sphere_vert_positions.push(pos_br.x);
                sphere_vert_positions.push(pos_br.y);
                sphere_vert_positions.push(pos_br.z);

                sphere_vert_positions.push(pos_tl.x);
                sphere_vert_positions.push(pos_tl.y);
                sphere_vert_positions.push(pos_tl.z);
                sphere_vert_positions.push(pos_br.x);
                sphere_vert_positions.push(pos_br.y);
                sphere_vert_positions.push(pos_br.z);
                sphere_vert_positions.push(pos_bl.x);
                sphere_vert_positions.push(pos_bl.y);
                sphere_vert_positions.push(pos_bl.z);
            }
        }
        return sphere_vert_positions;
    }


    return {
        animate : function() {

        }
    }
};