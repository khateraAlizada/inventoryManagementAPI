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
    let it = JSON.parse(actual_event);
    console.log("it:" + JSON.stringify(it)); //  info.arg1 and info.arg2
    let storeID = it["storeID"];
    console.log ("storeID:" + storeID)
    
  
     
    



    // get raw value or, if a string, then get from database if exists.
    // let deleteStore = (storeID) => {
       
    //   return new Promise((resolve, reject) => {
    //           pool.query("DELETE FROM info.Store WHERE idstore=?", [storeID], (error, rows) => {
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
        var sqlFindStoreMain = "select idstore from info.Store where idstore=?"; 
        var sqlDeleteStore = "delete from info.Store where idstore=?";
       
        
        var sqlDeleteInventoryStore = "delete from info.Inventory where storeID=?";
        var sqlFindStore = "select storeID from info.Inventory where storeID=?"; 
         
        var sqlFindStoreOverStock = "select storeID from info.OverStock where storeID=?"; 
        var sqlDeleteOverStock = "delete from info.OverStock where storeID=?";
       
       
        let FindStore = await query(pool, sqlFindStore, [storeID]);
        let FindStoreOverStock = await query(pool, sqlFindStoreOverStock, [storeID]);
        let FindStoreMain = await query(pool, sqlFindStoreMain, [storeID]);
        
        console.log("findStore length" + JSON.stringify(FindStore));
        console.log("findStore Overstock length" + JSON.stringify(FindStoreOverStock));
        console.log("findStore in Store table length" + JSON.stringify(FindStoreMain));
        
        let dStore;
      
       if (FindStore.length != 0){
           
           let dStoreInventory = await query(pool, sqlDeleteInventoryStore, [storeID]);
            
            console.log("rows deleted in dStoreInventory" + dStoreInventory.length);
           
       }
       if (FindStoreOverStock.length != 0){
           
           let dStoreOverStock = await query(pool, sqlDeleteOverStock, [storeID]);
            
            console.log("rows deleted in OverStock" + dStoreOverStock.length);
           
       }
           if (FindStoreMain.length != 0){
           
           dStore = await query(pool, sqlDeleteStore, [it.storeID]);
            
            console.log("rows deleted in Store" + JSON.stringify(dStore));
           
       } else {
           console.log("no store found ");
       }
       
       // const quick_result = await query(pool, sqlDeleteInventoryStore, [storeID]);
         const quick_result = dStore
        
        // If either is NaN then there is an error
        if (!quick_result) {
            response.statusCode = 400;
            response.error = "Couldn't delete";
        } else {
            // otherwise SUCCESS!
            response.statusCode = 200;
            //let result = "Deleted";
            let result = quick_result;
            response.result = quick_result;
        }
    } catch (error) {
        console.log("ERROR: " + error);
        response.statusCode = 400;
        response.error = error;
    }
    
    // full response is the final thing to send back
    return response;
}

