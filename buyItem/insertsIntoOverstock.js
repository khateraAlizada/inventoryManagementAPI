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
   // let info = JSON.parse(actual_event);
    //console.log("info:" + JSON.stringify(info)); //  info.arg1 and info.arg2
   // let sh = info.shipment;
    let inner = JSON.parse(actual_event)
    console.log("inner: " + inner)
   let sh= inner["shipment"]
    let storeID = inner["storeID"]
//   let values = [];
   
//      shipment.forEach(item) => {
//          let sku = item.sku
//          let quantity = item.quantity
    
//          )}
   
    // shipment.forEach(item) => {
    //     let sku = item.sku
    //     let quantity = item.quantity
    
    //     )}
    
//     const items = [
//     {name: 'alpha', description: 'describes alpha', value: 1},
//     ...
// ];

// db.query(
//     'INSERT INTO my_table (name, description, value) VALUES ?',
//     [items.map(item => [item.name, item.description, item.value])],
//     (error, results) => {...}
// );


    // // get raw value or, if a string, then get from database if exists.
    //  ProcessShipment = (sh) => {
    // //    var sql1 = "select * FROM info.Inventory WHERE (idstore,sku,quantity,aisle, shelf) VALUES=?";
    //   //var sql2 = "INSERT INTO info.Inventory (storeID,sku, quantity, aisle, shelf) VAlUES=?";
    //   //var sql3 = "UPDATE info.Inventory set quantity +=? WHERE (idstore,sku,quantity,aisle, shelf) VALUES=?";
        
    //          return new Promise((resolve, reject) => {
    //           pool.query( sql1, [sh.map(item => [item.storeID,item.sku, item.quantity, item.aisle, item.shelf])], (error, rows) => {
    //               if (error) { return reject(error); }
    //              if (rows) {
    //                  return resolve(pool.query( sql3, [sh.map(item => [item.storeID,item.sku, item.quantity, item.aisle, item.shelf])]));
                      
    //               } else {
    //                  return reject(pool.query(sql2,[sh.map(item => [item.storeID,item.sku, item.quantity, item.aisle, item.shelf])])) ;
    //              }
                  
    //           });
    //       });
    //   };
        
    //   return new Promise((resolve, reject) => {
    //         //  pool.query( sql1, [sh.map(item => [item.storeID,item.sku, item.quantity, item.aisle, item.shelf])], (error, rows) => {
    //               if (error) { return reject(error); }
    //               if (rows) {
    //                   return resolve(true);
    //               } else {
    //                   return reject(false);
    //               }
                  
    //           });
    //       });
    //   };
       
    
    try {
        
        // 1. Query RDS for the first constant value
        // 2. Query RDS for the second constant value
        // ----> These have to be done asynchronously in series, and you wait for earlier 
        // ----> request to complete before beginning the next one
       // const quick_result = await InsertTuple(sku,name,description,price);
       
        // shipment.forEach(item) => {
    //     let sku = item.sku
    //     let quantity = item.quantity
    
    //     )}
    // const quick_result = await InsertTuple(info.sku,info.name,info.description,info.price);
       //var sql1 = "select * FROM info.Inventory WHERE storeID=? and sku=? and aisle=? and shelf=?";
       var sql1 = "select * from info.Inventory where sku=?"
       
       var sql2 = "INSERT INTO info.Inventory (sku, quantity) VALUES (?,?)";
       var sql3 = "UPDATE info.Inventory SET quantity=? Where sku=? and storeID=?";
        var sql4 = "Select quantity from info.Inventory where sku=?";
        var sql5 = "select * from info.Inventory INNER JOIN info.Items ON info.Inventory.sku=info.Items.sku where info.Items.sku=?";
       var sqlMaxQ= "Select maxQ from info.Items where sku=?";
       var sqlQuantiy= "Select quantity from info.Inventory where sku=?";
       var sql7 = "INSERT INTO info.OverStock (storeID, quantity, sku) VALUES (?,?,?)";
        
       
       
    //  var sql3 = "UPDATE info.Inventory set quantity +=? WHERE (idstore,sku,quantity,aisle, shelf) VALUES=?";
   
        let success = true
        console.log("SH1:" + sh)
        for (let i = 0; i < sh.length; i++) {
            let it = sh[i]
              console.log("inner1:" + it.sku, it.quantity);
             
              let result = await query(pool, sql1 , [ it.sku ,it.quantity] ) ;
            //   result.forEach((row) => {
            //       console.log(row.storeID, row.sku, row.aisle, row.shelf);
            
            //a row doesnot exist
             if(result.length === 0) {
                 console.log("res length 0")
                let insertTuple= await query(pool, sql2 , [ it.sku, it.quantity]);
                // resolve because we have result(s) from the query. it may be an empty rowset or contain multiple values
                console.log('result:' + insertTuple.length);
                
                
                
            }
            // when a row exists
            else {
                let currentQuantity = await query(pool, sql4,[it.sku]) // get the quantity for that SKU
                if (currentQuantity.length == 0) {
                    // not surd
                    
                } else {
                    let actualQuantity = parseInt(currentQuantity[0].quantity)
                    console.log('currentQuantity sql4:' + actualQuantity +"," + "storeID" + storeID);
                    let maxQ = await query(pool, sqlMaxQ,[it.sku]);
                    let actualmaxQ = parseInt(maxQ[0].maxQ);
                    console.log("actualmaxQ: " + actualmaxQ);
                      
                    
                    
                    // let actualQuantity = parseInt(currentQuantity[0].quantity)
                    // console.log('currentQuantity sql4:' + actualQuantity +"," + "storeID" + storeID);
                    // let maxQ = await query(pool, sqlMaxQ,[it.sku]);
                    // let actualmaxQ = JSON.stringify(maxQ);
                    // console.log("maxQ: " + actualmaxQ);
                    
                  
                   
                    
                    
                    
                    
                    
                
                   
                    
                    if (( parseInt(it.quantity) + actualQuantity) > actualmaxQ){
                        let os = (parseInt(it.quantity) + actualQuantity) - actualmaxQ ; 
                        console.log("Overstock Quantity to String: " + os.toString());
                        console.log("Overstock Quantity os: " + os);
                        
                        let insertOverstock= await query(pool, sql7,[storeID, os, it.sku]);// get the quantity for that SKU
                    
                         let updateQuantity = await query(pool, sql3, [actualmaxQ, it.sku , storeID]) ; //add to the  prev quantity
                  
                    }else{
                     let updateQuantity = await query(pool, sql3, [parseInt(it.quantity) + actualQuantity, it.sku , storeID]) ; //add to the  prev quantity
                    console.log('updatedQuantity sql3:' + JSON.stringify(updateQuantity)) 
                    let actualUpdatedQuantity = JSON.stringify(updateQuantity);
                    console.log ("it.quantiy + actual q :" + (parseInt(it.quantity) + actualQuantity))
                    
                    }  
                    
                }
                
            }
         }
  
        //const quick_result = await query(pool, sql1 ,[sh.map(item => [item.storeID])],sh.map(item => [item.sku]),sh.map(item => [item.quantity]),sh.map(item => [item.aisle]) , sh.map(item => [item.shelf]));
           
        // CHECK RESULT
          
      
        // If either is NaN then there is an error
       
        if (!success) {
            response.statusCode = 400;
            response.error = "Couldn't find the item in INventory then insert it ";
        } else {
            // otherwise SUCCESS!
            response.statusCode = 200;
            let result = "Added";
            response.result = result.toString();
        }
    } catch (error) {
        console.log("ERROR: " + error);
        response.statusCode = 400;
        response.error = error;
    }
    
    // full response is the final thing to send back
    return response;
}

