/**
 * Created by tom on 14/10/2016.
 */

module.exports = function(scene, radius) {

    var self = this;
    self.scene = scene;

    var video = document.createElement('video');
    video.src = "/data/monsoon.mp4";
    video.loop = true;
    video.load();

    var dataTexture = new THREE.Texture(video);
    dataTexture.minFilter = THREE.NearestFilter;
    dataTexture.magFilter = THREE.NearestFilter;
    dataTexture.wrapS = THREE.ClampToEdgeWrapping;

    var dataGeometry = new THREE.SphereGeometry(radius, 64, 64);
    var dataMaterial = new THREE.ShaderMaterial({
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

    // var dataMaterial = new THREE.MeshPhongMaterial({
    //     map:dataTexture,
    //     transparent: true,
    //     opacity: 0.6,
    //     side: THREE.bothSides
    //
    // });



    var dataMesh = new THREE.Mesh(dataGeometry, dataMaterial);

    self.scene.add(dataMesh );

    scene.addEventListener("animate", function(){
        dataTexture.needsUpdate = true;
    });
    
    return {
        play : function() {
            video.play();
        },

        stop : function() {
            video.stop();
        }
    };
};