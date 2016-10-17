const GLOBE_RADIUS = 1;

//mainly cribbed from http://callumprentice.github.io/apps/global_temperature_change_webgl/index.html
//hadcrut4 variable will be global

module.exports = function (globe) {

    var self = this;

    function xyzFromLatLng(lat, lng, radius) {
        var phi = (90 - lat) * Math.PI / 180;
        var theta = (360 - lng) * Math.PI / 180;

        return {
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.cos(phi),
            z: radius * Math.sin(phi) * Math.sin(theta)
        };
    };

    function create_sphere_verts() {
        var mesh_radius = GLOBE_RADIUS * 1.01;
        var sphere_vert_positions = [];

        for (var lng_idx = 0; lng_idx < hadcrut4.num_lng; ++lng_idx) {

            for (var lat_idx = 0; lat_idx < hadcrut4.num_lat; ++lat_idx) {

                var lat1 = (90.0 - 2.5) - lat_idx * 5;
                var lng1 = lng_idx * 5 - 180.0 + 2.5;

                var degrees_offset = 2.375;
                var pos_tl = xyzFromLatLng(lat1 - degrees_offset, lng1 + degrees_offset, mesh_radius);
                var pos_tr = xyzFromLatLng(lat1 + degrees_offset, lng1 + degrees_offset, mesh_radius);
                var pos_bl = xyzFromLatLng(lat1 - degrees_offset, lng1 - degrees_offset, mesh_radius);
                var pos_br = xyzFromLatLng(lat1 + degrees_offset, lng1 - degrees_offset, mesh_radius);

                sphere_vert_positions.push(pos_tl.x);
                sphere_vert_positions.push(pos_tl.y);
                sphere_vert_positions.push(pos_tl.z);
                sphere_vert_positions.push(pos_tr.x);
                sphere_vert_positions.push(pos_tr.y);
                sphere_vert_positions.push(pos_tr.z);
                sphere_vert_positions.push(pos_br.x);
                sphere_vert_positions.push(pos_br.y);
                sphere_vert_positions.push(pos_br.z);

                sphere_vert_positions.push(pos_tl.x);
                sphere_vert_positions.push(pos_tl.y);
                sphere_vert_positions.push(pos_tl.z);
                sphere_vert_positions.push(pos_br.x);
                sphere_vert_positions.push(pos_br.y);
                sphere_vert_positions.push(pos_br.z);
                sphere_vert_positions.push(pos_bl.x);
                sphere_vert_positions.push(pos_bl.y);
                sphere_vert_positions.push(pos_bl.z);
            }
        }
        return sphere_vert_positions;
    }

    function create_mesh() {

        self.data_mesh_geometry = new THREE.BufferGeometry();

        self.data_mesh_positions = new Float32Array(hadcrut4.num_lat * hadcrut4.num_lng * 3 * 3 * 2);
        self.data_mesh_colors = new Float32Array(hadcrut4.num_lat * hadcrut4.num_lng * 3 * 3 * 2);

        var spherePos = create_sphere_verts();
        for (var lng_idx = 0; lng_idx < hadcrut4.num_lng; ++lng_idx) {

            for (var lat_idx = 0; lat_idx < hadcrut4.num_lat; ++lat_idx) {

                for (var i = 0; i < 18; ++i) {
                    var index = (lng_idx * hadcrut4.num_lat + lat_idx) * 18;

                    self.data_mesh_positions[index + i] = spherePos[index + i];
                    // self.data_mesh_positions[index + i] = 0;
                    self.data_mesh_colors[index + i] = 0;
                }
            }
        }

        update_data(hadcrut4.start_year);

        self.data_mesh_geometry.addAttribute('position', new THREE.BufferAttribute(self.data_mesh_positions, 3));
        self.data_mesh_geometry.addAttribute('color', new THREE.BufferAttribute(self.data_mesh_colors, 3));

        self.data_mesh_material = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.5,
            side: THREE.FrontSide,
            vertexColors: THREE.VertexColors
        });

        var mesh = new THREE.Mesh(self.data_mesh_geometry, self.data_mesh_material);

        globe.add(mesh);
    }

    function update_data(year) {

        var yearly_anomalies_data = hadcrut4.data;
        var color = new THREE.Color();

        for (var lng_idx = 0; lng_idx < hadcrut4.num_lng; ++lng_idx) {

            for (var lat_idx = 0; lat_idx < hadcrut4.num_lat; ++lat_idx) {

                var data_color_position = (year - hadcrut4.start_year) * hadcrut4.num_lng * hadcrut4.num_lat + lat_idx * hadcrut4.num_lng + lng_idx;

                var data_color = yearly_anomalies_data[data_color_position];

                if (data_color > 90.0) {
                    color.setRGB(0.8, 0.8, 0.8);
                } else
                if (data_color > 0) {
                    color.setHSL(0.0, data_color / self.max_anomalies_val, 0.5)
                } else
                if (data_color < 0) {
                    color.setHSL(240.0 / 360.0, data_color / self.min_anomalies_val, 0.5)
                } else {
                    color.setRGB(1.0, 1.0, 1.0);
                }

                var index = (lng_idx * hadcrut4.num_lat + lat_idx) * 18;

                self.data_mesh_colors[index + 0] = color.r;
                self.data_mesh_colors[index + 1] = color.g;
                self.data_mesh_colors[index + 2] = color.b;
                self.data_mesh_colors[index + 3] = color.r;
                self.data_mesh_colors[index + 4] = color.g;
                self.data_mesh_colors[index + 5] = color.b;
                self.data_mesh_colors[index + 6] = color.r;
                self.data_mesh_colors[index + 7] = color.g;
                self.data_mesh_colors[index + 8] = color.b;

                self.data_mesh_colors[index + 9] = color.r;
                self.data_mesh_colors[index + 10] = color.g;
                self.data_mesh_colors[index + 11] = color.b;
                self.data_mesh_colors[index + 12] = color.r;
                self.data_mesh_colors[index + 13] = color.g;
                self.data_mesh_colors[index + 14] = color.b;
                self.data_mesh_colors[index + 15] = color.r;
                self.data_mesh_colors[index + 16] = color.g;
                self.data_mesh_colors[index + 17] = color.b;
            }
        }
    }

    function calculate_min_max_anomalies() {

        var yearly_anomalies_data = hadcrut4.data;
        var raw_positive_total = 0;
        var raw_positive_count = 0;
        var raw_negative_total = 0;
        var raw_negative_count = 0;
        var raw_positive_min = Infinity;
        var raw_positive_max = -Infinity;
        var raw_negative_min = Infinity;
        var raw_negative_max = -Infinity;
        var raw_positive_mean;
        var raw_negative_mean;

        for (var i = 0; i < yearly_anomalies_data.length; ++i) {

            var anomaly = yearly_anomalies_data[i];

            if (anomaly != 99) {

                if (anomaly > 0) {
                    if (anomaly < raw_positive_min) {
                        raw_positive_min = anomaly;
                    }

                    if (anomaly > raw_positive_max) {
                        raw_positive_max = anomaly;
                    }

                    raw_positive_count++
                    raw_positive_total += anomaly;
                }

                if (anomaly < 0) {
                    if (anomaly < raw_negative_min) {
                        raw_negative_min = anomaly;
                    }

                    if (anomaly > raw_negative_max) {
                        raw_negative_max = anomaly;
                    }

                    raw_negative_count++
                    raw_negative_total += -anomaly;
                }
            }
        }

        raw_positive_mean = raw_positive_total / raw_positive_count;
        raw_negative_mean = raw_negative_total / raw_negative_count;

        var sd_positive_total = 0
        var sd_negative_total = 0
        for (var i = 0; i < yearly_anomalies_data.length; ++i) {

            var anomaly = yearly_anomalies_data[i];

            if (anomaly != 99) {
                if (anomaly > 0) {
                    sd_positive_total += (anomaly - raw_positive_mean) * (anomaly - raw_positive_mean)
                } else {
                    sd_negative_total += (-anomaly - raw_negative_mean) * (-anomaly - raw_negative_mean)
                }
            }
        }

        var sd_positive_mean = sd_positive_total / raw_positive_count;
        var sd_positive = Math.sqrt(sd_positive_mean);
        var sd_negative_mean = sd_negative_total / raw_negative_count;
        var sd_negative = Math.sqrt(sd_negative_mean);

        var sd2_positive_max = -Infinity;
        var sd2_negative_max = -Infinity;

        for (var i = 0; i < yearly_anomalies_data.length; ++i) {

            var anomaly = yearly_anomalies_data[i];

            if (anomaly > 0) {
                if (anomaly - 2 * sd_positive < raw_positive_mean) {

                    if (anomaly > sd2_positive_max) {
                        sd2_positive_max = anomaly
                    }
                }
            } else {
                if (-anomaly - 2 * sd_negative < raw_negative_mean) {

                    if (-anomaly > sd2_negative_max) {
                        sd2_negative_max = -anomaly
                    }
                }
            }
        }

        self.min_anomalies_val = -sd2_negative_max;
        self.max_anomalies_val = sd2_positive_max;
    }

    calculate_min_max_anomalies();
    create_mesh();

    return {

        animate: function() {
            self.data_mesh_geometry.attributes.position.needsUpdate = true;
            self.data_mesh_geometry.attributes.color.needsUpdate = true;
            self.data_mesh_material.needsUpdate = true;
        }
    }

};


