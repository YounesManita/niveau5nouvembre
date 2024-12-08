import express,{Request,Response} from "express"
const app =express()
import {createTables} from "./config/dtabase"
import routeruser from "./Route/Route"
 app.use(express.json())

 createTables()
app.use("/user",routeruser)

app.listen(5000,()=>{
    console.log("server is runing at 5000");
    
})

