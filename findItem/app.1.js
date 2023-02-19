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

    var SKU = e.sku;

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
    
    //     let findItem = (sku) => {
       
    //   return new Promise((resolve, reject) => {
    //           pool.query("select * from info.Inventory INNER JOIN info.Items ON info.Inventory.sku=info.Items.sku where info.Items.sku=?", [sku], (error, rows) => {
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
        
       
      // Find item in a store by customer, list store in the order of distance proximity";
   
       
       var sql1 = "select * from info.Inventory INNER JOIN info.Items ON info.Inventory.sku=info.Items.sku where info.Items.sku=?";
       
         let success = true
        // for (let i = 0; i < e.length; i++) {
        //     let it = e[i]
        //       console.log(storeID, sku, aisle, shelf, quantity)
             
        
         let quick_result = await (pool, sql1, [SKU]) 
        // quick_result = JSON.stringify(quick_result)
         console.log("find item in a store " + quick_result )
             if(quick_result.length === 0) {
              
                console.log( "No store has the item.")
            
             }
             
             
              // result.forEach((row) => {
              //     console.log(row.storeID, row.quantity, row.sku);
          //   if(result.length === 0) {
              //
             //   console.log('result:' + "There is no Item in this store")
           //  }
               
         
  
      // const quick_result = await findItem(e.sku);
        // If either is NaN then there is an error
        if (!quick_result) {
            response.statusCode = 400;
            response.error = "Couldn't find";
        } else {
            // otherwise SUCCESS!
            response.statusCode = 200;
            let result = "find item report lists all stores that has the item.";
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

