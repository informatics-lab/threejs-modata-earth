/**
 * Created by tom on 18/10/2016.
 */


module.exports = function(globeMesh, radius) {
    glowGeometry = new THREE.SphereGeometry(radius, 32, 32);
    glowMaterial = new THREE.ShaderMaterial({
            uniforms: {  },
            vertexShader:   document.getElementById( 'glowVertexShader'   ).textContent,
            fragmentShader: document.getElementById( 'glowFragmentShader' ).textContent,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
    });

    glowMesh = new THREE.Mesh( glowGeometry, glowMaterial );
    globeMesh.add(glowMesh);
}