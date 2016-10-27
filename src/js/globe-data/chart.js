module.exports = function() {

    var self = this;

    function updateCO2(val){
        var bar = document.getElementById("co2");
        bar.innerHTML = val;
        bar.style.height = (val-285.0)*100;
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