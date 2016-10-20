module.exports = function(scene, radius) {

    var self = this;
    self.scene = scene;
    self.radius = radius;

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

    var globeGeometry = new THREE.SphereGeometry(self.radius, 32, 32);
    var globeMaterial = new THREE.MeshPhongMaterial({
        map: map,
        bumpMap: bump,
        bumpScale: 0.015,
        specularMap: specular,
        specular: new THREE.Color('grey'),
        shininess: 10
    });

    var globeMesh = new THREE.Mesh( globeGeometry, globeMaterial );

    self.scene.add(globeMesh);

};