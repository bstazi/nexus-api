const express = require("express")
const axios = require("axios")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

// =========================
// DISCORD CONFIG
// =========================

const CLIENT_ID = "1479505514013659289"
const CLIENT_SECRET = "X1Zbqu1pTqO9Ep5dTq9qekzd90X4djaT"
const REDIRECT_URI = "https://nexus-api-lx74.onrender.com/auth/discord/callback"

// =========================
// HOME
// =========================

app.get("/", (req,res)=>{
    res.json({
        api:"NexusComunication",
        status:"online"
    })
})

// =========================
// LOGIN
// =========================

app.get("/auth/discord",(req,res)=>{

    const url =
    `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20email`

    res.redirect(url)

})

// =========================
// CALLBACK
// =========================

app.get("/auth/discord/callback", async (req,res)=>{

    const code = req.query.code

    if(!code){
        return res.send("No code provided")
    }

    try{

        const tokenResponse = await axios.post(
            "https://discord.com/api/oauth2/token",
            new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: "authorization_code",
                code: code,
                redirect_uri: REDIRECT_URI
            }),
            {
                headers:{
                    "Content-Type":"application/x-www-form-urlencoded"
                }
            }
        )

        const accessToken = tokenResponse.data.access_token

        const userResponse = await axios.get(
            "https://discord.com/api/users/@me",
            {
                headers:{
                    Authorization:`Bearer ${accessToken}`
                }
            }
        )

        const user = userResponse.data

        res.json({
            login:true,
            user:user
        })

    }catch(err){

    console.error("DISCORD TOKEN ERROR:")
    console.error(err.response?.data || err)

    res.json({
        error:true,
        discord_error: err.response?.data || err.message
    })

}

// =========================
// SERVER
// =========================

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log("Server running on port "+PORT)
})