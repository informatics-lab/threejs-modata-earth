/**
 * Created by tom on 17/10/2016.
 */
var GlobeUtils = require('../globe-utils');


// data must be in the format :
// {
//      num_lat : 36,
//      num_lng : 72,
//      mdi : missing data indicator
//      max : ,
//      min : ,
//      start_date_time :
//      datas : [ { date_time : UTC , data: [] }, ... ]
// }

// Some of the ideas here are inspired by Callum Prentice's work.
// See http://callumprentice.github.io/apps/global_temperature_change_webgl/index.html
module.exports = function(scene, radius, data) {

    var self = this;
    self.scene = scene;
    self.radius = radius;
    self.data = data;
    self.cdi = 0;

    var faceOffsetDegrees = 0.125;
    var faceWidth = 180 / data.num_lat;
    var faceHeight = 360 / data.num_lng;
    var dataOpacity  = 0.6;


    /**
     * Generates a single Sphere Face Buffer Geometry given the origin vector3
     * @param originLat
     * @param originLon
     */
    function getSphereFaceBufferGeometry(originLat, originLon) {

        var offsetX = (faceWidth / 2) - faceOffsetDegrees;
        var offsetY = (faceHeight / 2) - faceOffsetDegrees;

        var sfBufferGeometry = new THREE.BufferGeometry();

        var pos_tl = GlobeUtils.xyzFromLatLng(originLat - offsetY, originLon + offsetX, self.radius);
        var pos_tr = GlobeUtils.xyzFromLatLng(originLat + offsetY, originLon + offsetX, self.radius);
        var pos_bl = GlobeUtils.xyzFromLatLng(originLat - offsetY, originLon - offsetX, self.radius);
        var pos_br = GlobeUtils.xyzFromLatLng(originLat + offsetY, originLon - offsetX, self.radius);

        // 18 vert positions as {x,y,z} for both triangles in the plane.
        var sfVertPositions = new Float32Array(18);
        
        sfVertPositions[0] = pos_tl.x;
        sfVertPositions[1] = pos_tl.y;
        sfVertPositions[2] = pos_tl.z;
        sfVertPositions[3] = pos_tr.x;
        sfVertPositions[4] = pos_tr.y;
        sfVertPositions[5] = pos_tr.z;
        sfVertPositions[6] = pos_br.x;
        sfVertPositions[7] = pos_br.y;
        sfVertPositions[8] = pos_br.z;

        sfVertPositions[9] = pos_tl.x;
        sfVertPositions[10] = pos_tl.y;
        sfVertPositions[11] = pos_tl.z;
        sfVertPositions[12] = pos_br.x;
        sfVertPositions[13] = pos_br.y;
        sfVertPositions[14] = pos_br.z;
        sfVertPositions[15] = pos_bl.x;
        sfVertPositions[16] = pos_bl.y;
        sfVertPositions[17] = pos_bl.z;

        sfBufferGeometry.addAttribute('position', new THREE.BufferAttribute(sfVertPositions, 3));
        sfBufferGeometry.computeVertexNormals();
        sfBufferGeometry.computeFaceNormals();

        var sfMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
            side: THREE.FrontSide,
            transparent: true,
            opacity: dataOpacity
        });

        var sfMesh = new THREE.Mesh(sfBufferGeometry, sfMaterial);

        return sfMesh;
    };

    /**
     * Generates the entire Sphere Data Mesh
     */
    function getSphereDataMesh() {

        var startX = -180 + (faceWidth/2);
        var startY = -90 + (faceHeight/2);

        var mesh = new THREE.Object3D();

        for(var y = startY; y < 90; y += faceHeight) {
            for (var x = startX; x < 180; x += faceWidth) {
                mesh.add(getSphereFaceBufferGeometry(y,x));
            }
        }

        return mesh;
    };

    /**
     * Sets the mesh to the specified data
     * @param dataSet
     */
    function setMeshToDataSet(dataSet) {

        self.dataMesh.children.forEach(function(sf, i) {

            var datum = dataSet[i];
            sf.material.opacity = dataOpacity;

            //if no data
            if(datum == self.data.mdi) {
                sf.material.opacity = 0;
            } else {
                //set color of sphere face
                if (datum > 0) {
                    sf.material.color.setHSL(0.0, (datum / self.data.max), 0.5);
                } else {
                    sf.material.color.setHSL(240.0 / 360.0, Math.abs(datum / self.data.min), 0.5);
                }
            }

        });

    }

    self.dataMesh = getSphereDataMesh();
    self.scene.add(self.dataMesh);

    setMeshToDataSet(self.data.datas[self.cdi].data);

    self.scene.addEventListener("animate", function(evt){

    });

    return {

        mesh : self.dataMesh,
        radius : self.radius,
        origin : self.scene.origin,

        increaseCDI : function() {
            if(self.cdi < self.data.datas.length) {
                self.cdi++;
                setMeshToDataSet(self.data.datas[self.cdi].data);
            }
        },
        decreaseCDI : function() {
            if(self.cdi > 0) {
                self.cdi--;
                setMeshToDataSet(self.data.datas[self.cdi].data);
            }
        },
        setCDI : function(i) {
            if(i <= self.data.datas.length && i >= 0 && i != self.cdi) {
                self.cdi = i;
                setMeshToDataSet(self.data.datas[self.cdi].data);
            }
        }


    }
};