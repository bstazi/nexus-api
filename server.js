const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req,res)=>{
    res.json({
        name:"NexusComunication API",
        status:"online"
    })
})

app.get("/news",(req,res)=>{
    res.json([
        {title:"Launcher online", text:"Benvenuto su NexusComunication"},
        {title:"Discord integrato", text:"Login con Discord disponibile"}
    ])
})

app.listen(3000,()=>{
    console.log("Nexus API running on port 3000")
})