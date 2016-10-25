const DATA_PLAY_SPEED = 1000/2;

module.exports = function (data, updateDataFnc) {

    var self = this;
    self.cdi = 0;
    self.playing = false;

    var playPause = document.getElementById('controlPlayPause');
    playPause.addEventListener('click', function(evt){
        console.log("play/pause");
        if(self.playing) {
            pause();
        } else {
            play();
        }
    });

    var controls = document.getElementById('controlSlider');
    controls.value = self.cdi;
    controls.min = 0;
    controls.max = data.datas.length - 1;

    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    var controlTextContainer = document.createElement('div');
    var majorControlText = document.createElement('span');
    majorControlText.id = "majorControlText";
    majorControlText.innerHTML = "Year";

    var minorControlText = document.createElement('span');
    minorControlText.id = "minorControlText";
    minorControlText.innerHTML = "Month";

    controlTextContainer.appendChild(majorControlText);
    controlTextContainer.appendChild(minorControlText);

    controls.addEventListener('input', function(evt) {
        setControls(controls.value);
    });

    window.addEventListener('resize', setControlTextPos, false);

    //TODO fix this
    function setControlTextPos() {
        var windowHeight = window.innerHeight;
        var controlCss = window.getComputedStyle(controls);
        var controlLength = Number(controlCss.width.substring(0, controlCss.width.length - 2)) - 5;
        var controlCentrePos = Number(controlCss.top.substring(0, controlCss.top.length - 2));
        var controlTop = controlCentrePos - (controlLength/2);
        var controlLeft = Number(controlCss.left.substring(0, controlCss.left.length - 2));
        var controlStep = controlLength / controls.max;
        // var newTopPos = (controls.value * controlStep) + controlTop - (controls.value* (2/controls.max));
        var newTopPos = (controls.value * controlStep * 0.9) + controlTop;
        var newLeftPos = 10 + (Math.abs(controlLength/controlLeft)/windowHeight) * 800;
        controlTextContainer.setAttribute("style", "position:absolute; top:"+newTopPos+"vh; left:"+newLeftPos+"vh;");
    }

    function setControlTextContent(dt) {
        var dateTime = new Date(dt);
        var yr = dateTime.getFullYear();
        var mnth = monthNames[dateTime.getMonth()];
        majorControlText.innerHTML = yr;
        minorControlText.innerHTML = mnth;
    }

    function setControls(i) {
        if(i <= data.datas.length-1 && i >= 0 && i != self.cdi) {
            self.cdi = i;
            controls.value = i;
            var datum = data.datas[i];
            updateDataFnc(datum);
            setControlTextPos();
            setControlTextContent(datum.date_time);
        }
    }

    function play() {
        self.loop = setInterval(function() {
            if(self.cdi < data.datas.length-1) {
                setControls(Number(self.cdi)+1);
            } else {
                setControls(0);
            }
        }, DATA_PLAY_SPEED);
        self.playing = true;
    };

    function pause() {
        clearInterval(self.loop);
        self.playing = false;
    }

    //init
    setControlTextPos();
    setControlTextContent(data.datas[self.cdi].date_time);

    document.getElementById('controls').appendChild(controlTextContainer);

    return {
        
        getControlIndex : function () {
            return self.cdi;
        },

        setControls: function (i) {
            setControls(i);
        }

    };
}