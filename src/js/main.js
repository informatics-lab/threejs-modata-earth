const GLOBE_RADIUS = 1;

var OrbitControls = require('three-orbit-controls')(THREE);
var dat = require('dat-gui');
var pace = require('pace-progress');
var rp = require('request-promise');


var Globe = require('./globe');
var GlobeData = require('./globe-data');

// var THREE = require("three");

var scene, camera, renderer, controls;

pace.start({
    ajax: false, // disabled
    document: false, // disabled
    eventLag: false, // disabled
    elements: {
        selectors: ['.ready']
    }
});
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

    controls.addEventListener('change', function (evt) {
        directionalLight.position.copy(camera.position);
    });

    var globe = new Globe(scene, GLOBE_RADIUS);

    var hadcrut4_1year_mean_opts = {
        uri: document.location.origin + "/data/hadcrut4_1year_mean.json",
        json: true
    };
    var hadcrut4_annotations_opts = {
        uri: document.location.origin + "/data/hadcrut4_annotations.json",
        json: true
    };

    Promise.all([rp(hadcrut4_1year_mean_opts), rp(hadcrut4_annotations_opts)])
        .then(function (arr) {
            var data = new GlobeData.rawDataSphereMesh(scene, GLOBE_RADIUS * 1.02, arr[0], arr[1]);

            var gui = new dat.GUI();
            dat.GUI.toggleHide();

            var obj = {
                incDataIndex: function () {
                    data.increaseCDI();
                },
                decDataIndex: function () {
                    data.decreaseCDI();
                }

            };
            var guiDataFolder = gui.addFolder('data');
            guiDataFolder.add(obj, 'incDataIndex');
            guiDataFolder.add(obj, 'decDataIndex');

            var guiCamFolder = gui.addFolder('camera');
            guiCamFolder.add(camera.position, 'x', -5, 5).listen();
            guiCamFolder.add(camera.position, 'y', -5, 5).listen();
            guiCamFolder.add(camera.position, 'z', -5, 5).listen();

            animate();
        });
}

// animates the scene
function animate(time) {
    scene.dispatchEvent({type: "animate", message: time});
    controls.update();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function addAppTitle() {
    var content = document.getElementById("content");

    var titleDiv = document.createElement("div");
    titleDiv.id = "appTitle";

    addMOLogo(titleDiv);

    content.appendChild(titleDiv);

    function addMOLogo(domElement) {
        var moLogo = document.createElement('img');
        moLogo.src = "img/met-office-logo.svg";
        moLogo.alt = "Met Office";
        domElement.appendChild(moLogo)
    }

    function addInfoLabLogo(domElement) {
        var moLogo = document.createElement('img');
        moLogo.src = "img/met-office-logo.svg";
        moLogo.alt = "Met Office";
        domElement.appendChild(moLogo)
    }

    function addAppName(domElement) {
        var moLogo = document.createElement('img');
        moLogo.src = "img/met-office-logo.svg";
        moLogo.alt = "Met Office";
        domElement.appendChild(moLogo)
    }

}

