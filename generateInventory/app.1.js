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

    var storeID = e.storeID;

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
        
        
       // generate inventory for one store by manager iteration 1
       
       // Generate Inventory(shelf + overstock) for one store by corporate";
       
     //  var sql1 = "select storeID, sku, sum(quantity) from (SELECT storeID, sku, quantity  FROM info.Inventory where storeID  UNION SELECT storeID, sku, quantity  FROM info.OverStock where storeID ) X group BY sku";
      
       
       var sql1 = "SELECT * FROM info.Inventory where storeID =? ";
       
         let success = true
        // for (let i = 0; i < e.length; i++) {
        //     let it = e[i]
          //    console.log(storeID, sku, aisle, shelf, quantity)
             
         let quick_result = await query(pool, sql1 , [storeID] ) 
            //   result.forEach((row) => {
            //       console.log(row.storeID, row.sku, row.aisle, row.shelf);
             if(quick_result.length === 0) {
              //
               console.log('result:' + "There is no Item in this store")
            
             }
  
       //const quick_result = await generateInventory(storeID);
        // If either is NaN then there is an error
        if (!quick_result) {
            response.statusCode = 400;
            response.error = "Couldn't insert";
        } else {
            // otherwise SUCCESS!
            response.statusCode = 200;
            let result = "Added";
            console.log(quick_result)
          //  response.result = result.toString();
          response.result=quick_result;
        }
    } catch (error) {
        console.log("ERROR: " + error);
        response.statusCode = 400;
        response.error = error;
    }
    
    // full response is the final thing to send back
    return response;
}

