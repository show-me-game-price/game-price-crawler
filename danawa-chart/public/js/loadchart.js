// 우선 컨텍스트를 가져옵니다.
var priceCtx = document.getElementById("priceChart").getContext('2d');
var rankCtx = document.getElementById("rankChart").getContext('2d');
/*
- Chart를 생성하면서,
- ctx를 첫번째 argument로 넘겨주고,
- 두번째 argument로 그림을 그릴때 필요한 요소들을 모두 넘겨줍니다.
*/

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    var result = JSON.parse(xmlHttp.responseText);
    return result;
}

var options = function(url, reverse){
    var labels = [30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    // for(var i = 30; i>= 1; i--){
    //     labels.push(i)
    // }
    // console.log(labels);
    return {
        type: 'line',
            data: httpGet(url),
        options: {
            maintainAspectRatio: false, // default value. false일 경우 포함된 div의 크기에 맞춰서 그려짐.
                scales: {
                yAxes: [{
                    ticks: {
                        reverse: reverse
                    }
                }]
            }
        }
    }
}
// var myChart = new Chart(ctx, options);

exports = {
    price : new Chart(priceCtx, options('/chart/price/raw', false)),
    rank : new Chart(rankCtx, options('/chart/rank/raw', true))
}


