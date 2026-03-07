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
const REDIRECT_URI = "https://nexus-api-production-8078.up.railway.app/auth/discord/callback"

// =========================
// WHITELIST
// =========================

const whitelist = [
    "332617746389008395" // il tuo ID discord
]

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
// LOGIN DISCORD
// =========================

app.get("/auth/discord",(req,res)=>{

    const discordURL =
    `https://discord.com/api/oauth2/authorize`+
    `?client_id=${CLIENT_ID}`+
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`+
    `&response_type=code`+
    `&scope=identify%20email`

    res.redirect(discordURL)

})

// =========================
// CALLBACK DISCORD
// =========================

app.get("/auth/discord/callback", async (req,res)=>{

    const code = req.query.code

    if(!code){
        return res.send("No code provided")
    }

    try{

        const params = new URLSearchParams()

        params.append("client_id", CLIENT_ID)
        params.append("client_secret", CLIENT_SECRET)
        params.append("grant_type", "authorization_code")
        params.append("code", code)
        params.append("redirect_uri", REDIRECT_URI)
        params.append("scope", "identify email")

        const tokenResponse = await axios.post(
            "https://discord.com/api/v10/oauth2/token",
            params,
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

        // =========================
        // WHITELIST CHECK
        // =========================

        if(!whitelist.includes(user.id)){

            return res.send(`
            <html>
            <body style="background:#0b1424;color:white;font-family:sans-serif;text-align:center;margin-top:100px;">
            <h2>Accesso negato</h2>
            <p>Utente non autorizzato</p>
            </body>
            </html>
            `)

        }

        // =========================
        // SUCCESS LOGIN
        // =========================

        res.send(`
        <html>
        <body style="background:#0b1424;color:white;font-family:sans-serif;text-align:center;margin-top:100px;">

        <h2>Login completato</h2>
        <p>Puoi tornare al launcher.</p>

        <script>
        window.opener.postMessage(
        {
            login:true,
            user:${JSON.stringify(user)}
        },
        "*"
        )

        window.close()
        </script>

        </body>
        </html>
        `)

    }catch(err){

        console.error(err.response?.data || err.message)

        res.send(`
        <html>
        <body style="background:#0b1424;color:white;font-family:sans-serif;text-align:center;margin-top:100px;">
        <h2>Errore login</h2>
        </body>
        </html>
        `)

    }

})

// =========================
// SERVER
// =========================

const PORT = process.env.PORT || 8080

app.listen(PORT,"0.0.0.0",()=>{
    console.log("Server running on port "+PORT)
})