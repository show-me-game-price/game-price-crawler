////////////////
/////sqlite/////
////////////////

var sqlite3 = require('sqlite3').verbose()
var async = require('async')

var config = require('./config')

const selectInfoQuery = `
        select * from PS4_TITLE_INFO
    `;
const selectPriceQuery = `
        select * from PS4_TITLE_PRICE
    `;

module.exports.price = function() {
    return new Promise(
        resolve => {
            var titleList = [];
            var titlePrice = [];
            var data = {};

            var date = [];

            var d = new Date();
            d.setDate(d.getDate() - 14);
            for (var i = 14; i >= 1; i--){
                d.setDate(d.getDate() + 1);
                var datestring = formatDate(d);
                date.push(datestring);
            }
            async.waterfall([
                function(callback) {
                    let db = new sqlite3.Database(config.homepath+'danawa.db', sqlite3.OPEN_READWRITE, (err) => {
                        if (err) {
                            console.error(err.message);
                        } else {
                            console.log('Connected to the mydb database.');
                        }
                    });
                    callback(null, db);
                },
                function(db, callback) {
                    // arg1 now equals 'one' and arg2 now equals 'two'
                    db.all(selectInfoQuery, (err, row) => {
                        row.forEach(function (element) {
                            // console.log(element);
                            titleName = element["title_name"];
                            titleList[element["title_id"] - 1] = titleName;

                            var r = Math.random() * (255 - 1) + 1;
                            var g = Math.random() * (255 - 1) + 1;
                            var b = Math.random() * (255 - 1) + 1;
                            var json = {
                                label: titleName,
                                data: [],
                                backgroundColor: ['rgba(' + r + ', ' + g + ', ' + b + ', 1)'],
                                fill: false,
                                borderColor: ['rgba(' + r + ', ' + g + ', ' + b + ', 1)'],
                                borderWidth: 1

                            };
                            titlePrice[element["title_id"] - 1] = json;
                        });
                        callback(null, db);
                    });
                },
                function(db, callback) {
                    // arg1 now equals 'three'
                    db.all(selectPriceQuery, (err, row) => {
                        row.forEach(function (element) {
                            // console.log(element);
                            titlePrice[element["title_id"] - 1]["data"].push(
                                {
                                    x: element["record_date"],
                                    y: element["price"]
                                }
                            );
                        });
                        data = {
                            labels: date,
                            datasets: titlePrice
                        }
                        callback(null, db);
                    });
                },
                function(db, callback) {
                    db.close((err) => {
                        if (err) {
                            console.error(err.message);
                        } else {
                            console.log('Close the database connection.');
                            callback(null, data);
                        }
                    });
                }
            ], function (err, result) {
                // result now equals 'done'
                // return result;

                    resolve(result);

        });
    });

    ////////////////
    /////sqlite/////
    ////////////////

    // return data;
}
module.exports.rank = function() {
    return new Promise(
        resolve => {
            var titleList = [];
            var titleRank = [];
            var data = {};

            var date = [];

            var d = new Date();
            d.setDate(d.getDate() - 14);
            for (var i = 14; i >= 1; i--){
                d.setDate(d.getDate() + 1);
                var datestring = formatDate(d);
                date.push(datestring);
            }
            async.waterfall([
                function(callback) {
                    let db = new sqlite3.Database(config.homepath+'danawa.db', sqlite3.OPEN_READWRITE, (err) => {
                        if (err) {
                            console.error(err.message);
                        } else {
                            console.log('Connected to the mydb database.');
                        }
                    });
                    callback(null, db);
                },
                function(db, callback) {
                    // arg1 now equals 'one' and arg2 now equals 'two'
                    db.all(selectInfoQuery, (err, row) => {
                        row.forEach(function (element) {
                            // console.log(element);
                            titleName = element["title_name"];
                            titleList[element["title_id"] - 1] = titleName;

                            var r = Math.random() * (255 - 1) + 1;
                            var g = Math.random() * (255 - 1) + 1;
                            var b = Math.random() * (255 - 1) + 1;
                            var json = {
                                label: titleName,
                                data: [],
                                backgroundColor: ['rgba(' + r + ', ' + g + ', ' + b + ', 1)'],
                                fill: false,
                                borderColor: ['rgba(' + r + ', ' + g + ', ' + b + ', 1)'],
                                borderWidth: 1

                            };
                            titleRank[element["title_id"] - 1] = json;
                        });
                        callback(null, db);
                    });
                },
                function(db, callback) {
                    // arg1 now equals 'three'
                    db.all(selectPriceQuery, (err, row) => {
                        row.forEach(function (element) {
                            // console.log(element);
                            titleRank[element["title_id"] - 1]["data"].push(
                                {
                                    x: element["record_date"],
                                    y: element["rank"]
                                }
                            );
                        });
                        callback(null, db);
                    });
                },
                function(db, callback) {
                    titleRank.forEach(function (el){
                        date.forEach(function (d){
                            var flag = false;
                            for (i = 0; i<el["data"].length;i++){
                                if(el["data"][i].x == d)
                                    flag = true;
                            }
                            if (flag == false){
                                el["data"].push(
                                    {
                                        x: d,
                                        y: 100
                                    }
                                )
                            }
                        });
                    });

                    data = {
                        labels: date,
                        datasets: titleRank
                    }
                    callback(null, db);
                },
                function(db, callback) {
                    db.close((err) => {
                        if (err) {
                            console.error(err.message);
                        } else {
                            console.log('Close the database connection.');
                            callback(null, data);
                        }
                    });
                }
            ], function (err, result) {
                // result now equals 'done'
                // return result;

                resolve(result);

            });
        });

    ////////////////
    /////sqlite/////
    ////////////////

    // return data;
}
function formatDate(date) {
    var d = new Date(date), month = '' + (d.getMonth() + 1), day = '' + d.getDate(), year = d.getFullYear();
    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
}
