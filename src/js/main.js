const MET_OFFICE = "Met Office";
const INFORMATICS_LAB = "Informatics Lab";
const APP_NAME = "HadCRUT4";
const APP_DIV_ID = "content";
const GLOBE_RADIUS = 1;


var OrbitControls = require('three-orbit-controls')(THREE);
var dat = require('dat-gui');
var pace = require('pace-progress');
var rp = require('request-promise');
// var THREE = require("three");

var Globe = require('./globe');
var GlobeData = require('./globe-data');
var GlobeUtils = require('./globe-utils');

var scene, camera, renderer, controls;

var hadcrut4_1year_mean;
var hadcrut4_annotations;
var app_loaded = false;

init();

// initialises scene
function init() {

    function pageLoading() {
        pace.restart();
        pace.on('done', function () {
            if(!app_loaded) {
                console.log("loading done!");
                document.getElementById(APP_DIV_ID).style.opacity = 1;
                var us = GlobeUtils.latLonToVector3(38.9, -77, 1, 5);
                var aus = GlobeUtils.latLonToVector3(-25.2, 133.7, 1, 4);
                var uk = GlobeUtils.latLonToVector3(55.3, -3.4, 1, 2);
                GlobeUtils.tweenCameraToVector3(camera, us, 3000, 2000)
                    .then(function () {
                        return GlobeUtils.tweenCameraToVector3(camera, aus, 3000, 0);
                    })
                    .then(function () {
                        return GlobeUtils.tweenCameraToVector3(camera, uk, 3000, 0);
                    })
                    .then(function () {
                        console.log("called!!!");
                        controls.minDistance = GLOBE_RADIUS * 2;
                        controls.maxDistance = GLOBE_RADIUS * 3;

                        var data = new GlobeData.rawDataSphereMesh(scene, GLOBE_RADIUS * 1.02, hadcrut4_1year_mean, hadcrut4_annotations);

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
                        return;
                    });
                app_loaded = true;
            }
        });
    }

    pageLoading();

    var width = window.innerWidth;
    var height = window.innerHeight;

    //create threejs redenderer and attach it to dom
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000);
    document.getElementById('content').appendChild(renderer.domElement);


    //create our scene
    scene = new THREE.Scene();
    scene.origin = new THREE.Vector3(0, 0, 0);


    //create our camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
    camera.position.z = GLOBE_RADIUS * 20;


    // add lights
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // soft white light
    scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xbbbbbb, 0.8);
    scene.add(directionalLight);
    directionalLight.position.copy(camera.position);


    //init controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;


    //sync camera and directional light so we can see what we're doing!!
    controls.addEventListener('change', function (evt) {
        directionalLight.position.copy(camera.position);
    });


    //setup data to load in
    var hadcrut4_1year_mean_opts = {
        uri: document.location.origin + "/data/hadcrut4_1year_mean.json",
        json: true
    };
    var hadcrut4_annotations_opts = {
        uri: document.location.origin + "/data/hadcrut4_annotations.json",
        json: true
    };


    //load all data then we are ready to go!
    Promise.all([rp(hadcrut4_1year_mean_opts), rp(hadcrut4_annotations_opts)])
        .then(function (arr) {

            hadcrut4_1year_mean = arr[0];
            hadcrut4_annotations = arr[1];

            /**
             * Adds the title div to the app.
             */
            function addAppTitle() {

                function addMOLogo(domElement) {
                    var moLogo = document.createElement('img');
                    moLogo.id = "moLogo";
                    moLogo.src = "img/met-office-logo.svg";
                    moLogo.alt = MET_OFFICE;
                    domElement.appendChild(moLogo)
                }

                function addInfoLabLogo(domElement) {
                    var infoLabLogo = document.createElement('h2');
                    infoLabLogo.id = "infoLabLogo";
                    infoLabLogo.innerHTML = INFORMATICS_LAB;
                    domElement.appendChild(infoLabLogo);
                }

                function addAppName(domElement) {
                    var appName = document.createElement('h1');
                    appName.id = "appName";
                    appName.innerHTML = APP_NAME;
                    domElement.appendChild(appName);
                }

                var app = document.getElementById(APP_DIV_ID);

                var titleDiv = document.createElement("div");
                titleDiv.id = "appTitle";

                addMOLogo(titleDiv);
                addInfoLabLogo(titleDiv);
                addAppName(titleDiv);

                app.appendChild(titleDiv);

            }

            addAppTitle();

            var globe = new Globe(scene, GLOBE_RADIUS);

            //begin animating stuff!
            animate();
        });

    //resize threejs canvas if window size is changed during interaction.
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize, false);
}

// animation loop
function animate(time) {
    scene.dispatchEvent({type: "animate", message: time});
    GlobeUtils.animate(time);
    controls.update();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

