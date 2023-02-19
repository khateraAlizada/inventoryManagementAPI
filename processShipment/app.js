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
   let sh= inner["shipment"]
   
    let storeID = inner["storeID"]
      var managerUserName = inner["managerUserName"];
    var managerPassword = inner["managerPassword"]; 
//   let values = [];
   
    try {
        
         var sqlAut ="select managerUserName, managerPassword from info.Store where idstore=?";
      
        
       var sql1 = "select quantity from info.Inventory where sku=? and storeID=?";
       
       var sql_insert_inventory = "INSERT INTO info.Inventory (storeID, sku, quantity) VALUES (?,?,?)";
       var sql_update_inventory = "UPDATE info.Inventory SET quantity=? Where sku=? and storeID=?";
        var sql_inventory_quantity = "Select quantity from info.Inventory where sku=? and storeID=?";
        var sql5 = "select * from info.Inventory INNER JOIN info.Items ON info.Inventory.sku=info.Items.sku where info.Items.sku=?";
       var sqlMaxQ= "Select maxQ from info.Items where sku=?";
    
       var sql_insert_overStock = "INSERT INTO info.OverStock (storeID, quantity, sku) VALUES (?,?,?)";
        

        let success = true
        console.log("SH stringified:" + JSON.stringify(sh)); //  info.arg1 and info.arg2
       // sh= JSON.stringify(sh)
       
       let quick_resultAut = await query(pool, sqlAut , [storeID] ) 
              if(quick_resultAut.length === 0) {
              //
               console.log('quick_resultAut:' + "There is no manager in this store")
            
             }else{
                 if ((quick_resultAut[0].managerUserName == managerUserName) && (quick_resultAut[0].managerPassword == managerPassword)){
         

        //console.log("SH:" + sh)
        for (let i = 0; i < sh.length; i++) {
            let it = sh[i]
              console.log("inner_payload [ " + i +"]:" + i, it.sku, it.quantity);
             
              let result = await query(pool, sql1 , [it.sku, storeID] ) ;
              console.log('inventory rows ='  + JSON.stringify(result));
             
            //a row doesnot exist
            
             if(result.length === 0) { 
                 console.log("result length  is :"+result.length);
                 let inventoryQ = await query(pool, sql_inventory_quantity, [it.sku, storeID]);
                   if(inventoryQ.length > 0) {
                   let inventoryQ2 = parseInt(inventoryQ[0].inventoryQ);
                    console.log("inventoryQuantity" + inventoryQ2 );
                   }
                 let maxQ = await query(pool, sqlMaxQ ,[it.sku]);
                 console.log("macQ is : "  +maxQ);
                    let actualmaxQ = parseInt(maxQ[0].maxQ);
                    console.log("actualmaxQ: " + actualmaxQ);
                    console.log("it.quantity"+it.quantity)
                     if ((parseInt(it.quantity) > actualmaxQ)){
                        let os = (parseInt(it.quantity)  - actualmaxQ) ; 
                        console.log("Overstock Quantity to String: " + os.toString());
                        console.log("Overstock Quantity os: " + os);
                        let insertOverstock= await query(pool, sql_insert_overStock,[storeID, os, it.sku]);// (insert into overstock table )get the quantity for that SKU
                    
                        let insertTuple= await query(pool, sql_insert_inventory , [storeID, it.sku, actualmaxQ]); //insert into invertory
                        // resolve because we have result(s) from the query. it may be an empty rowset or contain multiple values
                        console.log('result:' + insertTuple.length);
                      }
                      else{
                        
                         let insertTuple= await query(pool, sql_insert_inventory , [storeID , it.sku, it.quantity ]); // insert into inventory
                        // resolve because we have result(s) from the query. it may be an empty rowset or contain multiple values
                        console.log('result:' + insertTuple.length);
                  }
             
             } 
             
        
         
             
            if(result.length > 0) {
                 console.log("result length is greater than zero!");
                 let maxQ = await query(pool, sqlMaxQ,[it.sku]);
                 let actualmaxQ = parseInt(maxQ[0].maxQ); // what is this 
                    console.log("actualmaxQ: " + actualmaxQ);
                  if (parseInt(it.quantity) > actualmaxQ ){
                        let os = (parseInt(it.quantity)  - actualmaxQ) ; 
                        console.log("Overstock Quantity to String: " + os.toString());
                        console.log("Overstock Quantity os: " + os);
                        let insertOverstock= await query(pool, sql_insert_overStock,[storeID, os, it.sku]);// get the quantity for that SKU
                    
                        let UpdateTuple= await query(pool, sql_update_inventory , [actualmaxQ,it.sku,storeID]);
                        
                        // resolve because we have result(s) from the query. it may be an empty rowset or contain multiple values
                        console.log('result:' + UpdateTuple.length);
                         } 
                  else{
                      console.log("macQ is : "  +JSON.stringify(maxQ));
                      let actualmaxQ = parseInt(maxQ[0].maxQ);
                      console.log("actualmaxQ after parse int " + actualmaxQ);
                       let db_inventory_amount = await query(pool,sql_inventory_quantity, [it.sku, storeID]);
                       console.log("db_inventory_amount == " + JSON.stringify(db_inventory_amount));
                      let db_inventory_amount2 = parseInt(db_inventory_amount[0].quantity);
                       console.log('after pars Int ==' +(db_inventory_amount2 ));
                       let  capacity = (actualmaxQ) - (db_inventory_amount2);
                       console.log('remained capacity is : == ' + capacity)
                       let new_value = parseInt(it.quantity) + db_inventory_amount2;
                       console.log('new_value :' + new_value);
                       
                       
                       if ((parseInt(new_value) > actualmaxQ)){
                        let os = (parseInt(new_value)  - actualmaxQ) ; 
                        console.log("Overstock Quantity to String: " + os.toString());
                        console.log("Overstock Quantity os: " + os);
                        let insertOverstock= await query(pool, sql_insert_overStock,[storeID, os, it.sku]);
                        let Update_inventory_Tuple= await query(pool,sql_update_inventory , [actualmaxQ, it.sku, storeID]);// (insert into overstock table )get the quantity for that SKU
                         console.log('result:' + Update_inventory_Tuple.length);
                       }
                       else{
                       
                         let Update_inventory_Tuple= await query(pool,sql_update_inventory , [new_value, it.sku, storeID]); 
                  }
                        // resolve because we have result(s) from the query. it may be an empty rowset or contain multiple values
                        
                        }
            } 
            
            // else{
            //         let maxQ = await query(pool, sqlMaxQ,[it.sku]);
            //         let actualmaxQ = parseInt(maxQ[0].maxQ);
            //          let updateQuantity = await query(pool, sql_update_inventory, [parseInt(it.quantity) + actualQuantity, it.sku , storeID]) ; //add to the  prev quantity
            //         console.log('updatedQuantity sql_update_inventory:' + JSON.stringify(updateQuantity)) 
            //         let actualUpdatedQuantity = JSON.stringify(updateQuantity);
            //         console.log ("it.quantiy + actual q :" + (parseInt(it.quantity) + actualQuantity));
                    
            //      }  
                    
         
        }
             
           
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

