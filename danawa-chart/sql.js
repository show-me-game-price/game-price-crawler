////////////////
/////sqlite/////
////////////////

var sqlite3 = require('sqlite3').verbose()

module.exports = function() {


    // async.waterfall([
    //     function(callback) {
    //         callback(null, 'one', 'two');
    //     },
    //     function(arg1, arg2, callback) {
    //         // arg1 now equals 'one' and arg2 now equals 'two'
    //         callback(null, 'three');
    //     },
    //     function(arg1, callback) {
    //         // arg1 now equals 'three'
    //         callback(null, 'done');
    //     }
    // ], function (err, result) {
    //     // result now equals 'done'
    // });
    //

    let db = new sqlite3.Database('/Users/jeewoongseong/learning/title-crawler/danawa.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Connected to the mydb database.');
        }
    });

    const selectInfoQuery = `
        select * from PS4_TITLE_INFO
    `;
    const selectPriceQuery = `
        select * from PS4_TITLE_PRICE
    `;
    var titlelist = [];
    var titleprice = [];
    db.all(selectInfoQuery, (err, row) => {
        row.forEach(function (element) {
            console.log(element);
            titleName = element["title_name"];
            titlelist[element["title_id"] - 1] = titleName;

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
            titleprice[element["title_id"] - 1] = json;
        });
    });
    // db.serialize(() => {
    //     db.each(selectQuery);
    // });
    var data = {};
    db.all(selectPriceQuery, (err, row) => {
        row.forEach(function (element) {
            console.log(element);
            titleprice[element["title_id"] - 1]["data"].push(
                {
                    x: element["record_date"],
                    y: element["price"]
                }
            );
        });
        data = {
            labels: titlelist,
            datasets: titleprice
        }
    });

    db.close((err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Close the database connection.');
        }
    });
    ////////////////
    /////sqlite/////
    ////////////////

    return data;
}