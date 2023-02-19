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
    let inner = JSON.parse(actual_event)
    console.log("inner: " + inner)
 
    var storeID = inner.storeID;
    var managerUserName = inner.managerUserName;
    var managerPassword = inner.managerPassword; 
    
//   let values = [];
// check the overStock quantiy
//create a variable for overStock Quantity
// Check inventory Quantity
// create a variable for inventory quantity
// check maxQ in item 
// AmountNeeded to fill inventory = InventoryQ - maxQ 
// OverStock - AmountedNeeded
// put everything from overStock to Inventory 
   
    try {
          var sql_insert_overStock = "INSERT INTO info.OverStock (storeID, quantity, sku) VALUES (?,?,?)";
         var sqlAut ="select managerUserName, managerPassword from info.Store where idstore=?";
      
        var sqlOverStock= "SELECT sum(quantity) as q , sku FROM info.OverStock where storeID=? and sku=? group by sku";
        var sql_update_inventory = "UPDATE info.Inventory SET quantity=? Where sku=? and storeID=?";
        
       
    
       var sql_insert_inventory = "INSERT INTO info.Inventory (storeID, sku, quantity) VALUES (?,?,?)";
       var sqlMaxQ= "Select maxQ from info.Items where sku=?";
       
       var sqlInventory = "select quantity, sku, storeID from info.Inventory where sku=? and storeID=?";
      
        var sql_inventory_quantity = "Select quantity from info.Inventory where sku=? and storeID=?";
        
        
      //  var sql5 = "select * from info.Inventory INNER JOIN info.Items ON info.Inventory.sku=info.Items.sku where info.Items.sku=?";
       
       var sql_update_overStock = "update info.OverStock set quantity=? where sku=? and storeID=?";
    
       var sql_inventory_items = "select Items.sku , Items.maxQ, Inventory.quantity as InventoryQ from info.Items join info.Inventory on Items.sku=Inventory.sku where storeID =? and Items.maxQ>Inventory.quantity";
        var sql_overStock = "Select * from info.OverStock where sku = ?";
        var sqlAllOverStock= "SELECT sum(quantity) as q , sku FROM info.OverStock where storeID=?  group by sku";
        let success = true
       
       
       let quick_resultAut = await query(pool, sqlAut , [storeID] ) 
              if(quick_resultAut.length === 0) {
              //
               console.log('quick_resultAut:' + "There is no manager in this store")
            
             }else{
                 if ((quick_resultAut[0].managerUserName == managerUserName) && (quick_resultAut[0].managerPassword == managerPassword)){
                     
                     let inventoryItems = await query(pool, sql_inventory_items, [storeID])
                   
                         for (let i =0 ; i< inventoryItems.length; i++) {
                                 console.log("Items needed to be fillshelved only InventoryItems sku" + inventoryItems[i].sku);
        
                                let maxQ = await query(pool, sqlMaxQ,[inventoryItems[i].sku]);
                                let actualmaxQ = parseInt(maxQ[0].maxQ); // what is this 
                                 console.log("actualmaxQ: " + actualmaxQ);
                              
                                let db_inventory_amount = await query(pool,sql_inventory_quantity, [inventoryItems[i].sku, storeID]);
                                console.log("db_inventory_amount == " + JSON.stringify(db_inventory_amount));
                                 let db_inventory_amount2 = parseInt(db_inventory_amount[0].quantity);
                                 let overStockQ = await query(pool,sqlOverStock, [storeID, [inventoryItems[i].sku]]); 
                                 let overStockQ2 = JSON.stringify(overStockQ[0].q)
                                 console.log('overStockQ2:   ' +overStockQ2);
                                 let  capacity = parseInt(actualmaxQ) - (db_inventory_amount2);
                                 console.log('remained capacity is : == ' + capacity);
                                 let new_value = parseInt(overStockQ2) + (db_inventory_amount2);
                                 console.log('new_value is  :' + new_value);
                                 let emptyOverStock = 0;
                       
                       
                                if ((parseInt(new_value) > actualmaxQ)){
                                                let os = (parseInt(new_value)  - actualmaxQ) ; 
                                                console.log("Overstock Quantity to String: " + os.toString());
                                               console.log("Overstock Quantity os: " + os);
                                              // let insertOverstock= await query(pool, sql_insert_overStock,[storeID, os,inventoryItems[i].sku]);
                                               let Update_inventory_Tuple= await query(pool,sql_update_inventory , [actualmaxQ, inventoryItems[i].sku, storeID]);
                                                let Update_Overstock_Tuple = await query(pool,sql_update_overStock , [ emptyOverStock, inventoryItems[i].sku, storeID]);
                                               let insertOverstock= await query(pool, sql_insert_overStock,[storeID, os,inventoryItems[i].sku]);
                                               console.log('result:' + Update_inventory_Tuple.length);
                                              }
                    
                        // resolve because we have result(s) from the query. it may be an empty rowset or contain multiple values
                                          else{
                                              
                       
                                           let Update_inventory_Tuple= await query(pool,sql_update_inventory , [new_value, inventoryItems[i].sku, storeID]); 
                                            let Update_Overstock_Tuple = await query(pool,sql_update_overStock , [ emptyOverStock, inventoryItems[i].sku, storeID]);
                                           
                                            
                                         }
                                         
                      //  });
                 
                  }
         
                  }
                        }
                 
                
            
    
         
              let overStockRows = await query(pool, sqlAllOverStock, [storeID ]) ;
              console.log('OverStock storeID, sku, SumQuantity ='  + JSON.stringify(overStockRows));
             
           
           
      
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

