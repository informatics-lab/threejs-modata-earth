const MET_OFFICE = "Met Office";
const INFORMATICS_LAB = "Informatics Lab";
const APP_NAME = "Global Temperature";
const APP_DIV_ID = "content";
const GLOBE_RADIUS = 1;


var OrbitControls = require('three-orbit-controls')(THREE);
var dat = require('dat-gui');
window.paceOptions = {
    ajax: false, // disabled
    document: false, // disabled
    eventLag: false, // disabled
    elements: {
        selectors: ['#content.ready']
    }
};
var browser = require('detect-browser');
var pace = require('pace-progress');
var rp = require('request-promise');


var Globe = require('./globe');
var GlobeData = require('./globe-data');
var GlobeUtils = require('./globe-utils');


// Initialises only if compatible.
var ismobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i);
var comptable = false;
if(browser.version) {
    var major_version = parseInt(browser.version.split('.')[0]);

    if (browser.name == 'firefox') {
        comptable = major_version >= 49
    } else if (browser.name == 'chrome') {
        comptable = major_version >= 53
    } else if (browser.name == 'safari') {
        comptable = major_version >= 9
    }
}

if (comptable && !ismobile) {
    init();
} else {
    document.getElementById('incompatible').style.display = 'block';
    document.getElementById('loading').style.display = 'none';
    document.getElementById("goWithNotCompatible").addEventListener("click", proceedAnyway);
    document.getElementById("goWithNotCompatible").addEventListener("touchstart", proceedAnyway);
}

function proceedAnyway() {
    document.getElementById('incompatible').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
    init();
}

var scene, camera, renderer, controls;

var hadcrut4_1year_mean;
var hadcrut4_annotations;
var app_loaded = false;
var autoAnimate = false;
var autoPlay = false;

// initialises scene
function init() {

    function pageLoading() {
        pace.start();
        pace.on('done', function () {
            if (!app_loaded) {
                var loadingDOM = document.getElementById("loading");
                loadingDOM.parentNode.removeChild(loadingDOM);
                console.log("page loading done");
                document.getElementById(APP_DIV_ID).style.opacity = 1;
                var us = GlobeUtils.latLonToVector3(38.9, -77, 1, 5);
                var aus = GlobeUtils.latLonToVector3(-25.2, 133.7, 1, 4);
                var uk = GlobeUtils.latLonToVector3(20.0, -3.4, 1, 2); // below the uk

                var initTween = Promise.resolve();
                if (window.location.hash.search('skipIntro') == -1) {
                    initTween = GlobeUtils.tweenCameraToVector3(camera, us, 3000, 2000)
                        .then(function () {
                            return GlobeUtils.tweenCameraToVector3(camera, aus, 3000, 0);
                        })
                        .then(function () {
                            return GlobeUtils.tweenCameraToVector3(camera, uk, 3000, 0);
                        });
                }
                initTween.then(function () {

                    //lockdown controls
                    controls.minDistance = GLOBE_RADIUS * 2;
                    controls.maxDistance = GLOBE_RADIUS * 3;
                    controls.enableDamping = true;
                    controls.dampingFactor = 0.15;
                    controls.rotateSpeed = 0.3;
                    controls.autoRotate = autoAnimate;
                    controls.autoRotateSpeed = 0.6;

                    var dataC = {
                        dataSpeed: 10,
                        incDataIndex: function () {
                            data.increaseCDI();
                        },
                        decDataIndex: function () {
                            data.decreaseCDI();
                        }
                    };

                    //add advanced controls - press 'h' in gui to show/hide
                    var gui = new dat.GUI();
                    dat.GUI.toggleHide();

                    var guiControlsFolder = gui.addFolder('controls');
                    guiControlsFolder.add(dataC, 'incDataIndex');
                    guiControlsFolder.add(dataC, 'decDataIndex');
                    var speed = guiControlsFolder.add(dataC, 'dataSpeed', 1, 20).listen();
                    guiControlsFolder.add(controls, 'rotateSpeed',0,1).listen();
                    var autoAnimateSwitch = guiControlsFolder.add(controls, 'autoRotate').listen();
                    guiControlsFolder.add(controls, 'autoRotateSpeed',0,1).listen();
                    guiControlsFolder.add(controls, 'enableDamping').listen();
                    guiControlsFolder.add(controls, 'dampingFactor',0,1).listen();


                    var guiCamFolder = gui.addFolder('camera');
                    guiCamFolder.add(camera.position, 'x', -5, 5).listen();
                    guiCamFolder.add(camera.position, 'y', -5, 5).listen();
                    guiCamFolder.add(camera.position, 'z', -5, 5).listen();
                    

                    var data = new GlobeData.rawDataSphereMesh(scene, camera, GLOBE_RADIUS * 1.02, hadcrut4_1year_mean, hadcrut4_annotations, speed, autoAnimateSwitch);
                    if(autoPlay) {
                        data.play();
                    }
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
        uri: document.location.origin + "/data/hadcrut4_1year_mean_20170117.json",
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

            function addInfoClick() {

                var infoShowing = false;
                var infoClick = document.createElement("span");
                infoClick.id = "infoClick";
                infoClick.innerHTML = "i";

                infoClick.addEventListener('click', function () {
                    var info = document.getElementById("info");
                    if (!infoShowing) {
                        infoClick.innerHTML = "x";
                        info.style.display = "block";
                        setTimeout(function () {
                            info.style.opacity = 0.85;
                            infoShowing = true;
                        }, 5);

                    } else {
                        infoClick.innerHTML = "i";
                        info.style.opacity = 0;
                        setTimeout(function () {
                            info.style.display = "none";
                            infoShowing = false;
                        }, 500);
                    }
                });

                var app = document.getElementById(APP_DIV_ID);
                app.appendChild(infoClick);
            }

            addInfoClick();

            var globe = new Globe(scene, GLOBE_RADIUS);

            console.log("data loaded");
            document.getElementById(APP_DIV_ID).setAttribute("class", "ready");

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

    var dgVisible = false;
    window.onkeyup = function(e) {
        var key = e.keyCode ? e.keyCode : e.which;
        if (key == 72) {
            var dg = document.getElementsByClassName("ac")[0];
            if(!dgVisible) {
                dg.style.display = "block";
                dgVisible = true;
            } else {
                dg.style.display = "none";
                dgVisible = false;
            }
        }
    }
}

// animation loop
function animate(time) {
    scene.dispatchEvent({type: "animate", message: time});
    GlobeUtils.animate(time);
    controls.update();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

