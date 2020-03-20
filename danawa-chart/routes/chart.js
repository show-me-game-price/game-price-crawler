var express = require('express');
var router = express.Router();
var fs = require('fs')
var await = require('await')

var danawa = require('../sql')
var danawa_d3 = require('../sql_d3')
/* GET chart. */
router.get('/', function(req, res, next) {
    // res.send('respond with a resource');
    // res.writeHead(200,{"Content-Type":"text/html"}); // 웹페이지 출력
    fs.createReadStream("./views/chart.html").pipe(res); // 같은 디렉토리에 있는 index.html를 response 함
});

router.get('/price/raw', async function(req, res, next) {
    const result = await danawa.price();
    res.send(result);
    // res.writeHead(200,{"Content-Type":"text/html"}); // 웹페이지 출력
    // fs.createReadStream("./views/chart.html").pipe(res); // 같은 디렉토리에 있는 index.html를 response 함

    // danawa().then(result => res.send(result));
});
router.get('/rank/raw', async function(req, res, next) {
    const result = await danawa.rank();
    res.send(result);
    // res.writeHead(200,{"Content-Type":"text/html"}); // 웹페이지 출력
    // fs.createReadStream("./views/chart.html").pipe(res); // 같은 디렉토리에 있는 index.html를 response 함

    // danawa().then(result => res.send(result));
});

router.get('/d3/PS4/rank/raw', async function(req, res, next) {
    const result = await danawa_d3("PS4","rank");
    res.send(result);
});

router.get('/d3/PS4/price/raw', async function(req, res, next) {
    const result = await danawa_d3("PS4", "price");
    res.send(result);
});

router.get('/d3/PS4/rank', function(req, res, next) {
    // res.send('respond with a resource');
    // res.writeHead(200,{"Content-Type":"text/html"}); // 웹페이지 출력
    fs.createReadStream("./views/ps4rank.html").pipe(res); // 같은 디렉토리에 있는 index.html를 response 함
});
router.get('/d3/PS4/price', function(req, res, next) {
    // res.send('respond with a resource');
    // res.writeHead(200,{"Content-Type":"text/html"}); // 웹페이지 출력
    fs.createReadStream("./views/ps4price.html").pipe(res); // 같은 디렉토리에 있는 index.html를 response 함
});



router.get('/d3/switch/rank/raw', async function(req, res, next) {
    const result = await danawa_d3("switch","rank");
    res.send(result);
});

router.get('/d3/switch/price/raw', async function(req, res, next) {
    const result = await danawa_d3("switch", "price");
    res.send(result);
});

router.get('/d3/switch/rank', function(req, res, next) {
    // res.send('respond with a resource');
    // res.writeHead(200,{"Content-Type":"text/html"}); // 웹페이지 출력
    fs.createReadStream("./views/switchrank.html").pipe(res); // 같은 디렉토리에 있는 index.html를 response 함
});
router.get('/d3/switch/price', function(req, res, next) {
    // res.send('respond with a resource');
    // res.writeHead(200,{"Content-Type":"text/html"}); // 웹페이지 출력
    fs.createReadStream("./views/switchprice.html").pipe(res); // 같은 디렉토리에 있는 index.html를 response 함
});
module.exports = router;
