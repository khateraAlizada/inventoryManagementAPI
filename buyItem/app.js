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
    let e= JSON.parse(actual_event)
    console.log("e: " + JSON.stringify(e))
   
   
    let storeID = e["storeID"]
    var sku = e["sku"];
    var quantity = e["quantity"];
    
//   let values = [];
   
    try {
        
        var sqlbuyItem = "update info.Inventory set quantity=? where sku=? and storeID=?";
        
       var sql1 = "select quantity from info.Inventory where sku=? and storeID=?";
       
    //   var sql_insert_inventory = "INSERT INTO info.Inventory (storeID, sku, quantity) VALUES (?,?,?)";
    //   var sql_update_inventory = "UPDATE info.Inventory SET quantity=? Where sku=? and storeID=?";
    //     var sql_inventory_quantity = "Select quantity from info.Inventory where sku=? and storeID=?";
    //     var sql5 = "select * from info.Inventory INNER JOIN info.Items ON info.Inventory.sku=info.Items.sku where info.Items.sku=?";
    //   var sqlMaxQ= "Select maxQ from info.Items where sku=?";
    
    //   var sql_insert_overStock = "INSERT INTO info.OverStock (storeID, quantity, sku) VALUES (?,?,?)";
        

        let success = true
        let inventoryRemaining
    //     console.log("SH stringified:" + JSON.stringify(sh)); //  info.arg1 and info.arg2
    //   // sh= JSON.stringify(sh)
        let inventoryQuantity = await query(pool,sql1,[sku, storeID])
        console.log("inventoryQuantity before parseInt: " + JSON.stringify( inventoryQuantity))
        if(inventoryQuantity.length ===0){
            console.log("inventoryQuantity" + "The item is sold out")
        }else {
           
          
               let inventoryQuantity2 = parseInt(inventoryQuantity[0].quantity)
                console.log("inventoryQuantity after parseInt: " + inventoryQuantity2)
                
                 if(e.quantity <= inventoryQuantity2){
                  let  newQ =  (inventoryQuantity2) - parseInt(e.quantity) 
                  console.log("buyQ: " + newQ)
                  let  buy = await query(pool, sqlbuyItem,[newQ,sku,storeID] )
                   inventoryRemaining = buy
                   console.log("inventoryRemaining 1" + JSON.stringify(inventoryRemaining))
                  
                  // if quantity to be bought is greater than inventory quantity implement else
                } 
                if(e.quantity > inventoryQuantity2){ 
                    console.log("inventoryQuantity2: " + inventoryQuantity2)
                    let newInventoryQ = 0;
                   let boughtItem = inventoryQuantity2
                   console.log("boughtItem: " + boughtItem);
                    
                    
                  //  console.log("buyQ2: " + buyQ2);
                    let buy2 = await query(pool,sqlbuyItem, [newInventoryQ, sku,storeID])
                    console.log("buy2" + JSON.stringify(buy2))
                    inventoryRemaining = buy2
                    console.log("inventoryRemaining 2" + JSON.stringify(inventoryRemaining))
                    
                
                
                   // console.log("buyItem before parseInt" + buyItem[0].quantity )
              //let  buyItem2 = parseInt(buyItem[0].quantity)
               // let updateInventoryQ = inventoryQuantity2 - buyItem2
                
              //  console.log("updateInventoryQ: "  + updateInventoryQ)
         //  let remainingInventoryQ = await query(pool, sqlbuyItem[updateInventoryQ, sku,storeID])
                    
                }
                
                // let purchaseQ = await query(pool, sqlbuyItem,[sku, storeID])
           
            
           
        // CHECK RESULT
          
      
        // If either is NaN then there is an error
       
        if (!success) {
            response.statusCode = 400;
            response.error = "Couldn't buy item ";
        } else {
            // otherwise SUCCESS!
            response.statusCode = 200;
            let result = "";
            response.result = result.toString();
        }
    }             

        
    } catch (error) {
        console.log("ERROR: " + error);
        response.statusCode = 400;
        response.error = error;
    }
    
    // full response is the final thing to send back
    return response;
}

