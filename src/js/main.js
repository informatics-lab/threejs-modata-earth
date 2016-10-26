
const GLOBE_RADIUS = 1;

var OrbitControls = require('three-orbit-controls')(THREE);
var dat = require('dat-gui');

var Globe = require('./globe');
var GlobeData = require('./globe-data');
var GlobeUtils = require('./globe-utils');

// var THREE = require("three");

var scene, camera, renderer, controls;

init();

// initialises scene
function init() {

    window.addEventListener('resize', onWindowResize, false);

    var width = window.innerWidth;

    scene = new THREE.Scene();
    scene.origin = new THREE.Vector3(0,0,0);

    camera = new THREE.PerspectiveCamera( 45, width / window.innerHeight, 0.01, 1000 );
    camera.position.z = GLOBE_RADIUS * 3;

    var ambientLight = new THREE.AmbientLight( 0xffffff, 0.2); // soft white light
    scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( 0xbbbbbb, 0.8);
    scene.add( directionalLight );
    directionalLight.position.copy(camera.position);

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize( width, window.innerHeight );
    renderer.setClearColor( 0x000000 );

    document.getElementById('content').appendChild( renderer.domElement );

    controls = new OrbitControls( camera, renderer.domElement );
    controls.enablePan = false;
    // controls.autoRotate = true;
    controls.minDistance = GLOBE_RADIUS * 2;
    controls.maxDistance = GLOBE_RADIUS * 3;
    // controls.minPolarAngle = (Math.PI / 10) * 2.5; // radians
    // controls.maxPolarAngle = (Math.PI / 10) * 6.5;
    
    controls.addEventListener('change', function(evt) {
        directionalLight.position.copy(camera.position);
    });

    var globe = new Globe(scene, GLOBE_RADIUS);
    var data = new GlobeData.rawDataSphereMesh(scene, GLOBE_RADIUS*1.02, hadcrut4, hadcrut4_annotations);


    // press 'h' to show/hide gui

    var gui = new dat.GUI();


    var obj = {
        incDataIndex : function() {
            data.increaseCDI();
        },
        decDataIndex : function() {
            data.decreaseCDI();
        }

    };
    var guiDataFolder = gui.addFolder('data');
    guiDataFolder.add(obj,'incDataIndex');
    guiDataFolder.add(obj,'decDataIndex');

    var guiCamFolder = gui.addFolder('camera');
    guiCamFolder.add(camera.position, 'x', -5, 5).listen();
    guiCamFolder.add(camera.position, 'y', -5, 5).listen();
    guiCamFolder.add(camera.position, 'z', -5, 5).listen();

    animate();
}

// animates the scene
function animate(time) {

    scene.dispatchEvent({type:"animate", message: time});
    controls.update();
    requestAnimationFrame( animate );
    renderer.render( scene, camera );

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}