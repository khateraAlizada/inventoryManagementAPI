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
    
 
    
    
    try {
        
        
       
       var sql1 = "SELECT * FROM info.OverStock";
       var sql2 = "SELECT storeID, sku, sum(quantity) as quantity  FROM info.OverStock where storeID=? group by sku ";
       
         let success = true
        
             
         let quick_result = await query(pool, sql2,[storeID]);
       
            
         
  
       //const quick_result = await generateInventory(storeID);
        // If either is NaN then there is an error
        if (!quick_result) {
            response.statusCode = 400;
            response.error = "Couldn't insert";
        } else {
            // otherwise SUCCESS!
            response.statusCode = 200;
            let result = "Overstock report created";
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

