/**
 * Created by tom on 14/10/2016.
 */
const GLOBE_RADIUS = 1;

module.exports = function(globe) {

    var self = this;
    self.globe = globe;
    self.video = document.createElement('video');
    self.video.src = "/img/monsoon.ogg";
    self.video.loop = true;
    self.video.load();

    self.dataTexture = new THREE.Texture(self.video);
    self.dataTexture.minFilter = THREE.LinearFilter;
    self.dataTexture.magFilter = THREE.LinearFilter;

    self.dataGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    self.dataMaterial = new THREE.ShaderMaterial({
        uniforms: {
            'textureClouds': { type: 't', value: self.dataTexture },
            'height': { type: 'f', value: 0.0 },
            'edgeFade': { type: 'f', value: 0.0 }
        },
        vertexShader:   document.getElementById( 'cloudVertexShader'   ).textContent,
        fragmentShader: document.getElementById( 'cloudFragmentShader' ).textContent,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true
    });

    self.dataMesh = new THREE.Mesh( self.dataGeometry, self.dataMaterial );
    var dataScale = GLOBE_RADIUS * 1.002;
    self.dataMesh.scale.set(dataScale, dataScale, dataScale);
    self.globe.add( self.dataMesh );
    
    return {

        play : function() {
            self.video.play();
        },

        stop : function() {
            self.video.stop();
        },

        animate : function() {
            self.dataTexture.needsUpdate = true;
        }

    };
};