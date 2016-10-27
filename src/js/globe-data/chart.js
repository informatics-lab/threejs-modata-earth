module.exports = function(minco2, maxco2, mintemp, maxtemp) {

    var self = this;

    var maxheight = 100;

    var co2range = maxco2 - minco2;
    function updateCO2(val){
        var bar = document.querySelectorAll("#co2 .bar")[0];
        bar.innerHTML = val.toPrecision(3);
        var height = (val-minco2) / co2range * maxheight;
        bar.style.height = height+"px";
        bar.style.top = (maxheight - height)+"px";
        bar.style.backgroundColor = "rgba(255, 255, 255, "+height/100+")";
    };

    var temprange = maxtemp - mintemp;
    function updateTemp(val){
        var bar = document.querySelectorAll("#temp .bar")[0];
        bar.innerHTML = val.toPrecision(2);
        var height = (val-mintemp) / temprange * maxheight;
        bar.style.height = height+"px";
        bar.style.top = (maxheight - height)+"px";
        bar.style.opacity = height/100;
    };

    return {
        setCO2 : function(val) {
            updateCO2(val);
        },
        setTemp : function(val) {
            updateTemp(val)
        }
    }
};