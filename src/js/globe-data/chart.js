module.exports = function() {

    var self = this;

    function updateCO2(val){
        var bar = document.getElementById("co2");
        bar.innerHTML = val;
        var height = (val-285.0)*100;
        bar.style.height = height+"px";
        bar.style.top = (100 - height)+"px";
    };

    function updateTemp(val){
        document.getElementById("temp").innerHTML = val;
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