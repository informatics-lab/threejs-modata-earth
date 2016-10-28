module.exports = function(minco2, maxco2, mintemp, maxtemp) {

    var self = this;

    var maxheight = 100;
    var co2range = maxco2 - minco2;
    var temprange = maxtemp - mintemp;

    function initChart() {

        function getBarChart(id, labelHTML) {
            var barChart = document.createElement('div');
            barChart.id = id;
            barChart.setAttribute("class","barChart");

            var bar = document.createElement('div');
            bar.setAttribute("class", "barChartBar");

            var label = document.createElement('span');
            label.setAttribute("class", "barChartLabel");
            label.innerHTML = labelHTML;

            barChart.appendChild(bar);
            barChart.appendChild(label);

            return barChart;
        }

        var chart = document.createElement('div');
        chart.id = "chart";

        var co2Chart = getBarChart("co2BarChart", "CO<sub>2</sub> (ppm)");
        chart.appendChild(co2Chart);

        var tempChart = getBarChart("tempBarChart", "Temp anomaly (K)");
        chart.appendChild(tempChart);

        var app = document.getElementById('content');
        app.appendChild(chart);
    }
    initChart();

    function updateCO2(val){
        var bar = document.querySelectorAll("#co2BarChart .barChartBar")[0];
        bar.innerHTML = val.toPrecision(3);
        var height = (val-minco2) / co2range * maxheight;
        bar.style.height = height+"px";
        bar.style.backgroundColor = "hsl(0.0, "+((val-minco2) / co2range * 100)+"%, 50%)";
    };


    function updateTemp(val){
        var bar = document.querySelectorAll("#tempBarChart .barChartBar")[0];
        bar.innerHTML = val.toPrecision(2);
        var height = (val-mintemp) / temprange * maxheight;

        if(val > 0 ) {
            bar.style.backgroundColor = "hsl(0.0, "+((val-mintemp) / temprange * 100)+"%, 50%)";
        } else {
            bar.style.backgroundColor = "hsl(240.0, "+((val-mintemp) / temprange * 100)+"%, 50%)";
        }

        bar.style.height = height+"px";
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