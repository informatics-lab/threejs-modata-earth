
const GLOBE_RADIUS = 1;
const ORIGIN = new THREE.Vector3(0,0,0);

var OrbitControls = require('three-orbit-controls')(THREE);
var dat = require('dat-gui');

var GlobeData = require('./globe-data');
var GlobeUtils = require('./globe-utils');
var GlobeAnnotations = require('./globe-annotations');
var GlobeControls = require('./globe-controls');

// var THREE = require("three");

var scene, camera, renderer, controls;
var globeGeometry, globeMaterial, globeMesh;
var glowGeometry, glowMaterial, glowMesh;

var gui;
var data;
var annotations;

init();

// initialises scene
function init() {
    window.addEventListener('resize', onWindowResize, false);

    var width = window.innerWidth;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, width / window.innerHeight, 0.01, 1000 );
    camera.position.z = GLOBE_RADIUS * 3;

    var ambientLight = new THREE.AmbientLight( 0xffffff, 0.2); // soft white light
    scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight( 0xbbbbbb, 0.8);
    scene.add( directionalLight );
    directionalLight.position.copy(camera.position);

    controls = new OrbitControls( camera );
    controls.enablePan = false;
    // controls.autoRotate = true;
    controls.minDistance = GLOBE_RADIUS * 2;
    controls.maxDistance = GLOBE_RADIUS * 3;
    controls.minPolarAngle = (Math.PI / 10) * 2.5; // radians
    controls.maxPolarAngle = (Math.PI / 10) * 6.5;
    
    controls.addEventListener('change', function(evt) {
        directionalLight.position.copy(camera.position);
    });

    var textureLoader = new THREE.TextureLoader();

    var map = textureLoader.load('/img/earthSatTexture.jpg', function(texture) {
        return texture;
    });
    var bump = textureLoader.load('/img/bump.jpg', function(texture) {
        return texture;
    });
    var specular = textureLoader.load('/img/specular.png', function(texture) {
        return texture;
    });

    globeGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 32, 32 );
    globeMaterial = new THREE.MeshPhongMaterial({
        map: map,
        bumpMap: bump,
        bumpScale: 0.015,
        specularMap: specular,
        specular: new THREE.Color('grey'),
        shininess: 10
    });

    globeMesh = new THREE.Mesh( globeGeometry, globeMaterial );

    glowGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 32, 32);
    glowMaterial = new THREE.ShaderMaterial({
            uniforms: {  },
            vertexShader:   document.getElementById( 'glowVertexShader'   ).textContent,
            fragmentShader: document.getElementById( 'glowFragmentShader' ).textContent,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
    });

    glowMesh = new THREE.Mesh( glowGeometry, glowMaterial );
    var glowScale = GLOBE_RADIUS * 1.2;
    glowMesh.scale.set(glowScale, glowScale, glowScale);
    globeMesh.add( glowMesh );

    scene.add( globeMesh );

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize( width, window.innerHeight );
    renderer.setClearColor( 0x000000 );

    document.getElementById('content').appendChild( renderer.domElement );

    data = new GlobeData.hadcrut4(globeMesh);
    // data.play();

    annotations = new GlobeAnnotations(globeMesh);
    annotations.add(50.71, -3.53, "A message");

    // press 'h' to show/hide gui

    gui = new dat.GUI();

    var obj = {
        test : function() {
            console.log("clicked");
            GlobeUtils.tweenCameraToLatLon(camera, 30, -3)
        }
    };
    gui.add(obj,'test');

    var guiCamFolder = gui.addFolder('camera');
    guiCamFolder.add(camera.position, 'x');
    guiCamFolder.add(camera.position, 'y');
    guiCamFolder.add(camera.position, 'z');

    //
    // gui.add(GlobeControls, 'message');
    animate();
}

// animates the scene
function animate(time) {

    controls.update();

    GlobeUtils.distanceBetween(camera.position, ORIGIN);
    annotations.animate();
    GlobeUtils.animate(time);

    data.animate();

    requestAnimationFrame( animate );
    renderer.render( scene, camera );

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function makeTextSprite( message, parameters ) {
    if ( parameters === undefined ) parameters = {};

    var fontface = parameters.hasOwnProperty("fontface") ?
        parameters["fontface"] : "Arial";

    var fontsize = parameters.hasOwnProperty("fontsize") ?
        parameters["fontsize"] : 18;

    var borderThickness = parameters.hasOwnProperty("borderThickness") ?
        parameters["borderThickness"] : 4;

    var borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };

    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

    //var spriteAlignment = parameters.hasOwnProperty("alignment") ?
    //	parameters["alignment"] : THREE.SpriteAlignment.topLeft;

    var spriteAlignment = THREE.SpriteAlignment.topLeft;


    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

    // get size data (height depends only on font size)
    var metrics = context.measureText( message );
    var textWidth = metrics.width;

    // background color
    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
        + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
        + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.

    // text color
    context.fillStyle = "rgba(0, 0, 0, 1.0)";

    context.fillText( message, borderThickness, fontsize + borderThickness);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial(
        { map: texture, useScreenCoordinates: false, alignment: spriteAlignment } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(100,50,1.0);
    return sprite;
}