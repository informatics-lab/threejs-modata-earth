
const GLOBE_RADIUS = 1;
const ORIGIN = new THREE.Vector3(0,0,0);

var OrbitControls = require('three-orbit-controls')(THREE);
// var THREE = require("three");

var scene, camera, renderer, controls;
var globeGeometry, globeMaterial, globeMesh;
var glowGeometry, glowMaterial, glowMesh;
var dataTexture, dataGeometry, dataMaterial, dataMesh;

init();

function init() {

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
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
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
        bumpScale: 0.01,
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

    // create the video element
    var video = document.createElement('video');
    video.src = "/img/monsoon.ogg";
    video.loop = true;
    video.load();
    video.play();

    dataTexture = new THREE.Texture(video);
    dataTexture.minFilter = THREE.LinearFilter;
    dataTexture.magFilter = THREE.LinearFilter;

    dataGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 32, 32);
    dataMaterial = new THREE.ShaderMaterial({
        uniforms: {
            'textureClouds': { type: 't', value: dataTexture },
            'height': { type: 'f', value: 0.0 },
            'edgeFade': { type: 'f', value: 0.0 }
        },
        vertexShader:   document.getElementById( 'cloudVertexShader'   ).textContent,
        fragmentShader: document.getElementById( 'cloudFragmentShader' ).textContent,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true
    });

    dataMesh = new THREE.Mesh( dataGeometry, dataMaterial );
    var dataScale = GLOBE_RADIUS * 1.001;
    dataMesh.scale.set(dataScale, dataScale, dataScale);
    //globeMesh.add( dataMesh );

    scene.add( globeMesh );

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize( width, window.innerHeight );
    renderer.setClearColor( 0x111111 );

    document.getElementById('content').appendChild( renderer.domElement );

    annotate();
    animate();
}

function animate() {

    dataTexture.needsUpdate = true;
    // controls.update();
    requestAnimationFrame( animate );

    renderer.render( scene, camera );

}


function annotate() {

    var location = {
        lat: 50.71,
        lon: -3.53
    };
    var annotationTitle = "Tom's Special Annotation";
    var annotationSubText = "This is the special info";

    var ring = getRing(location.lat, location.lon);
    scene.add(ring);
}

function addPointer() {
    var pointerMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 2
    });

    var pointerGeometry = new THREE.Geometry();
    pointerGeometry.vertices.push(
        latLonToVector3(50.71,-3.53,1,0.01),
        latLonToVector3(50.71,-3.53,1,0.2)
    );

    var line = new THREE.Line( geometry, material );
    scene.add( line );
}

function getRing(lat, lon) {
    var ringOrigin = latLonToVector3(lat,lon,GLOBE_RADIUS,0.01);

    var opacity = 2 + 1 - distanceToVector(camera.position, ringOrigin);
    console.log(opacity);
    var ringMaterial = new THREE.LineDashedMaterial({
        linewidth: 3,
        transparent: true,
        opacity:0.1
    });

    var ringGeometry = new THREE.CircleGeometry(GLOBE_RADIUS / 10, 64);
    ringGeometry.vertices.shift();  //remove central vertex
    ringGeometry.computeLineDistances();

    var ringMesh = new THREE.LineSegments( ringGeometry, ringMaterial );

    ringMesh.position.set(ringOrigin.x, ringOrigin.y, ringOrigin.z);
    ringMesh.lookAt(ORIGIN);

    ringMesh.addEventListener('update', function() {
        console.log("update");
    });

    return ringMesh;
}


/**
 * Converts a Lat/Lon to a Vector3 above a sphere's surface
 * @param lat - latitude
 * @param lon - longitude
 * @param radius - radius of sphere
 * @param height - distance above surface of sphere to place vector
 * @returns {*|Vector3}
 */
function latLonToVector3(lat, lon, radius, height) {
    var phi = (lat)*Math.PI/180;
    var theta = (lon-180)*Math.PI/180;

    var x = -(radius+height) * Math.cos(phi) * Math.cos(theta);
    var y = (radius+height) * Math.sin(phi);
    var z = (radius+height) * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x,y,z);
}

/**
 * Calculate the distance between 2 Vector3's
 * @param v1 - Vector3
 * @param v2 - Vector3
 * @returns {number}
 */
function distanceToVector( v1, v2 ) {
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;

    return Math.sqrt( dx * dx + dy * dy + dz * dz );
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
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial(
        { map: texture, useScreenCoordinates: false, alignment: spriteAlignment } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(100,50,1.0);
    return sprite;
}