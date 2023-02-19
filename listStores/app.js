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

    let storeID = e["storeID"];
    let custLat = e["custLat"];
    let custLong = e["custLong"];
     console.log("storeID: " + storeID)
     


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

//      function deg2rad(deg) {
//         return deg * (Math.PI/180)
//      }
//       var computeDistance= getDistanceFromLatLonInKm(custLat, castLong,storeLat, storeLong)
//       console.log(computeDistance);
    
  
    //

    // get raw value or, if a string, then get from database if exists.
    // let generateInventory= (storeID) => {
       
    //   return new Promise((resolve, reject) => {
    //           pool.query("SELECT * FROM info.Inventory where storeID =? ", [storeID], (error, rows) => {
    //               if (error) { return reject(error); }
    //               if (rows) {
    //                   return resolve(true);
    //               } else {
    //                   return reject(false);
    //               }
    //           });
    //       });
    //   }
    
    
    try {
        
        // 1. Query RDS for the first constant value
        // 2. Query RDS for the second constant value
        // ----> These have to be done asynchronously in series, and you wait for earlier 
        // ----> request to complete before beginning the next one
       // const quick_result = await InsertTuple(sku,name,description,price);
       
      // formula: =acos(sin(lat1)*sin(lat2)+cos(lat1)*cos(lat2)*cos(lon2-lon1))*6371 (6371 is Earth radius in km.
       
       
//       function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
//         var R = 6371; // Radius of the earth in km
//         var dLat = deg2rad(lat2-lat1);  // deg2rad below
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

 
       var sqlStoreLong = "SELECT longitude FROM info.Store where idstore=?";
       var sqlStoreLat = "SELECT latitude FROM info.Store where idstore=?";
       var sqllatLong = "SELECT latitude, longitude, idstore FROM info.Store";
       var sqlcustLat = "SELECT  latitude  FROM info.CustomerLocation where custId=?";
       var sqlcustLong = "SELECT  longitude  FROM info.CustomerLocation where custId=?";
       
       
       
         let success = true
        // for (let i = 0; i < e.length; i++) {
        //     let it = e[i]
          //    console.log(storeID, sku, aisle, shelf, quantity)
             
        //  let storeLatLong = await query(pool, sqllatLong ) 
        //  storeLatLong = JSON.stringify(storeLatLong)
        //       // result.forEach((row) => {
        //     //       console.log(row.storeID, row.sku, row.aisle, row.shelf);
        //     console.log("all stores' lat and long: " + storeLatLong +" " )
        //      if(storeLat.length === 0) {
              
        //         console.log('result:' + "There is no store.")
            
        //      }
             
         
         
  
  
  // use query to get ALL STORE rows
        let rows = await query(pool, sqllatLong)
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

