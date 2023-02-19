// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;
const mysql = require('mysql');

var config = require('./config.json');

var pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

// https://www.freecodecamp.org/news/javascript-promise-tutorial-how-to-resolve-or-reject-promises-in-js/#:~:text=Here%20is%20an%20example%20of,message%20Something%20is%20not%20right!%20.




///
function query(conx, sql, params) {
    return new Promise((resolve, reject) => {
        conx.query(sql, params, function(err, rows) {
            if (err) {
                // reject because there was an error
                reject(err);
            } else {
                // resolve because we have result(s) from the query. it may be an empty rowset or contain multiple values
                resolve(rows);
            }
        });
    });
}


// Take in as input a payload.

//{  body: '{    "sku" : "aab3",   "name" : "milk", "description": "whole milk", "price": '2.99'}'
// 
//
// }
//
// ===>  { "result" : "12" }
//
exports.lambdaHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    
    // NOTE: This will change in the end befause you have to have a body.
    // const col1 = event.col1;
    // const col2 = event.col2;
    // const col3 = event.col3;
    // const col4 = event.col4;
    // const col5 = event.col5;
    
    //  const sku = event.sku;
    //  const name = event.name;
    //  const description = event.description;
    //  const price = event.price;
   

   // ready to go for CORS. To make this a completed HTTP response, you only need to add a statusCode and a body.
    let response = {
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*", // Allow from anywhere
            "Access-Control-Allow-Methods": "POST" // Allow POST request
        }
    }; // response
    
    let actual_event = event.body;
    let e = JSON.parse(actual_event);
    console.log("info:" + JSON.stringify(e)); //  info.arg1 and info.arg2

    let sku = e["sku"];
    
    let custLat = e["custLat"];
    let custLong = e["custLong"];
     console.log("SKU:"  + sku);
     


// function compare_by_gps(s1, s2) {
    
//     let d1 = compute_dist(s1.long, s1.lat, customer_long, customer_lat)
//     let d2 = compute_dist(s2.long, s2.lat, customer_long, customer_lat)
    
//     return d1 - d2
// }

// sort(function compareFn(a, b) { /* … */ })
// function deg2rad(deg) {
//   return deg * (Math.PI/180)
// }
       
//       getDistanceFromLatLonInKm()

// function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
//   var R = 6371; // Radius of the earth in km
//   var dLat = deg2rad(lat2-lat1);  // deg2rad below
//   var dLon = deg2rad(lon2-lon1); 
//   var a = 
//     Math.sin(dLat/2) * Math.sin(dLat/2) +
//     Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
//     Math.sin(dLon/2) * Math.sin(dLon/2)
//     ; 
//   var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
//   var d = R * c; // Distance in km
//   return d;
// }

    function deg2rad(deg) {
      return deg * (Math.PI/180)
    }

  function compute_dist(custLat, custLong,storeLat, storeLong) {
        var R = 6371; // Radius of the earth in km    
        var dLong = deg2rad(custLong-storeLong);  // deg2rad below
        var dLat = deg2rad(custLat-storeLat); 
        
        
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(deg2rad(custLat)) * Math.cos(deg2rad(storeLat)) * Math.sin(dLong/2) * Math.sin(dLong/2);

        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Distance in km
        return d;
    }


    
    try {
        
     
 
      
       var sqllatLong = "SELECT latitude, longitude, idstore FROM info.Store";
       //var sqllatLong2 = "SELECT latitude, longitude, idstore, sku, quantity FROM info.Store join info.Inventory on info.Inventory.storeID=info.Store.idstore where info.Inventory.sku like ?";
       var sqllatLong2 = "SELECT latitude, longitude, idstore, Items.sku, quantity, Items.name, Items.description FROM ((info.Store join info.Inventory on info.Inventory.storeID=info.Store.idstore) join Items on info.Inventory.sku = info.Items.sku) where info.Items.sku like ? or info.Items.name like ? or info.Items.description like ?";
        
        
       
         let success = true
     
  // use query to get ALL STORE rows
        let rows = await query(pool, sqllatLong2, "%"+[sku]+"%", "%"+[name]+"%", "%"+[description]+"%")
        console.log("all stores location" + rows)
        let values = []
        for (let r in rows) {
            let d = compute_dist(custLat, custLong, rows[r].latitude, rows[r].longitude)
            rows[r].distance = d
            console.log("r:" + JSON.stringify(rows[r]))
            values.push(rows[r])
        }
        console.log("rows.distance " + rows.distance)
        
        
        values.sort((a, b) => a.distance - b.distance);
        
  
       //const quick_result = await generateInventory(storeID);
        // If either is NaN then there is an error
        // if (!storeLat) {
        //     response.statusCode = 400;
        //     response.error = "Couldn't find the store";
        // } else {
        //     // otherwise SUCCESS!
        //     response.statusCode = 200;
        //     let result = "list of stores created";
        //     console.log(storeLat)
        //   //  response.result = result.toString();
        //   response.result=storeLat;
        // }
          //const quick_result = await generateInventory(storeID);
        // If either is NaN then there is an error
        if (!values) {
            response.statusCode = 400;
            response.error = "Couldn't find the store";
        } else {
            // otherwise SUCCESS!
            response.statusCode = 200;
            let result = "list of stores created";
            console.log(values)
          //  response.result = result.toString();
          response.result=values;
        }
   
        


    } catch (error) {
        console.log("ERROR: " + error);
        response.statusCode = 400;
        response.error = error;
    }
    
    
    
    // full response is the final thing to send back
    return response;
}

