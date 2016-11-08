

module.exports = function (data, updateDataFnc, speed) {

    var self = this;
    self.data = data;
    self.updateDataFnc = updateDataFnc;
    self.cdi = 0;
    self.playing = false;
    self.speed = speed;

    self.speed.onChange(function(val){

        self.speed = val;

        if(self.playing) {
            clearInterval(self.loop);
            self.loop = setInterval(function () {
                if (self.cdi < self.data.datas.length - 1) {
                    setControls(Number(self.cdi) + 1);
                } else {
                    setControls(0);
                }
            }, 1000/self.speed);
        }
    });

    function initControls() {

        function addDataSlider(domElement) {

            function addSlider(domElement) {


                var slider = document.createElement('input');
                slider.id = "slider";
                slider.type = "range";
                slider.value = self.cdi;
                slider.min = 0;
                slider.max = self.data.datas.length - 1;

                //nasty hack for safari (doesn't support css4) :(
                var isSafari = /constructor/i.test(window.HTMLElement);
                if (isSafari) {
                    slider.setAttribute("style", "width: 60vh;left: -30vh;top: 30vh;");
                }

                slider.addEventListener('input', function (evt) {
                    setControls(slider.value);
                });

                domElement.appendChild(slider);
                self.slider = slider;
            }

            function addSliderText(domElement) {
                var sliderText = document.createElement('div');
                sliderText.id = "sliderText";

                var majorText = document.createElement('span');
                majorText.id = "majorSliderText";
                majorText.innerHTML = "Year";
                self.majorText = majorText;

                sliderText.appendChild(majorText);

                domElement.appendChild(sliderText);
                self.sliderText = sliderText;
            }

            var dataSlider = document.createElement('div');
            dataSlider.id = "dataSlider";

            addSlider(dataSlider);
            addSliderText(dataSlider);

            domElement.appendChild(dataSlider);
        }

        function addPlayPauseButton(domElement) {
            var playPauseButton = document.createElement('button');
            playPauseButton.id = "playPauseButton";
            playPauseButton.setAttribute("class", "pause");

            playPauseButton.addEventListener('click', function (evt) {
                if (self.playing) {
                    pause();
                } else {
                    play();
                }
            });

            domElement.appendChild(playPauseButton);
            self.playPauseButton = playPauseButton;
        }

        var controlsDiv = document.createElement('div');
        controlsDiv.id = "controls";

        addDataSlider(controlsDiv);
        addPlayPauseButton(controlsDiv);

        var app = document.getElementById('content');
        app.appendChild(controlsDiv);
    }

    window.addEventListener('resize', setControlTextPos, false);

    function setControlTextPos() {
        var windowHeight = window.innerHeight;
        var controlCss = window.getComputedStyle(self.slider);
        var controlLength = Number(controlCss.width.substring(0, controlCss.width.length - 2));
        var controlCentrePos = Number(controlCss.top.substring(0, controlCss.top.length - 2));
        var controlTop = (controlCentrePos - (controlLength / 2)) / windowHeight - 0.01;
        var newTopPos = ((((controlLength - 18) / windowHeight) * (self.slider.value / self.slider.max)) + controlTop) * 100; // magic number adjusts travel speed
        self.sliderText.setAttribute("style", "top:" + newTopPos + "vh;");
    }

    function setControlTextContent(dt) {
        var dateTime = new Date(dt);
        var yr = dateTime.getFullYear();
        self.majorText.innerHTML = yr;
    }

    function setControls(i) {
        if (i <= self.data.datas.length - 1 && i >= 0 && i != self.cdi) {
            self.cdi = i;
            self.slider.value = i;
            var datum = self.data.datas[i];
            self.updateDataFnc(datum);
            setControlTextPos();
            setControlTextContent(datum.date_time);
        }
    }

    function play() {
        self.loop = setInterval(function () {
            if (self.cdi < self.data.datas.length - 1) {
                setControls(Number(self.cdi) + 1);
            } else {
                setControls(0);
            }
        }, 1000/self.speed);
        self.playing = true;
        self.playPauseButton.setAttribute("class", "play");
    };

    function pause() {
        clearInterval(self.loop);
        self.playing = false;
        self.playPauseButton.setAttribute("class", "pause");
    }

    //init
    initControls();
    setControlTextPos();
    setControlTextContent(self.data.datas[self.cdi].date_time);

    return {

        getControlIndex: function () {
            return self.cdi;
        },

        setControls: function (i) {
            setControls(i);
        }

    };
};