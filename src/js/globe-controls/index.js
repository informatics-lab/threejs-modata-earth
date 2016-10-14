/**
 * Created by tom on 14/10/2016.
 */
module.exports = function (camera) {

    var self = this;
    self.camera = camera;

    return {
        camera: self.camera,
        message: "hello world"
    }
};