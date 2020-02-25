////////////////
/////sqlite/////
////////////////

var sqlite3 = require('sqlite3').verbose()
var async = require('async')

var config = require('./config')

var searchPeriod =  20




module.exports = function(platform, target) {
    return new Promise(
        resolve => {

            var selectInfoQuery = `select * from `+platform+`_TITLE_INFO`;
            var selectPriceQuery = `select * from `+platform+`_TITLE_PRICE`;
            var data = {
                labels: null,
                titlelist: [],
                datasets: {},
            };

            var date = [];

            var d = new Date();
            d.setDate(d.getDate() - searchPeriod);
            selectInfoQuery += ` where record_date >= '` + formatDate(d) + `'`;
            selectPriceQuery += ` where record_date >= '` + formatDate(d) + `'`;

            for (var i = searchPeriod; i >= 1; i--){
                d.setDate(d.getDate() + 1);
                var datestring = formatDate(d);
                date.push(datestring);
            }
            data["labels"] = date;

            async.waterfall([
                function(callback) {
                    let db = new sqlite3.Database(config.homepath+'danawa.db', sqlite3.OPEN_READWRITE, (err) => {
                        if (err) {
                            console.error(err.message);
                        } else {
                            console.log('Connected to the mydb database.');
                            callback(null, db);
                        }
                    });
                },
                function(db, callback) {
                    // arg1 now equals 'one' and arg2 now equals 'two'
                    db.all(selectInfoQuery, (err, row) => {
                        row.forEach(function (element) {
                            var titleName = element["title_name"];
                            data["datasets"][titleName] = {
                                name : titleName,
                                values : [],
                            };
                            data["titlelist"].push(titleName);
                            date.forEach(function (d){
                                data["datasets"][titleName]["values"].push(
                                    {
                                        x: d,
                                        y: 100
                                    }
                                )
                            });

                        });
                        callback(null, db, data);
                    });
                },
                function(db, data, callback) {
                    // arg1 now equals 'three'
                    db.all(selectPriceQuery, (err, row) => {
                        row.forEach(function (element) {
                            var titleName = element["title_name"];
                            data["datasets"][titleName]["values"].forEach(function (v){
                                if(v["x"] == element["record_date"]){
                                    v["y"] = element[target];
                                }
                            });
                        });
                        callback(null, db, data);
                    });
                },
                function(db, data, callback) {
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
