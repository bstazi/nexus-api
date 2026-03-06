const express = require("express")
const session = require("express-session")
const passport = require("passport")
const DiscordStrategy = require("passport-discord").Strategy
const cors = require("cors")

const app = express()

// necessario su Render
app.set("trust proxy", 1)

app.use(cors())
app.use(express.json())

app.use(session({
    secret: "nexus_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))

app.use(passport.initialize())
app.use(passport.session())

// =========================
// DISCORD CONFIG
// =========================

const CLIENT_ID = "1479505514013659289"
const CLIENT_SECRET = "NTYu1gAdj5XXy4a3vW0eQzn3nK-np86O"
const CALLBACK_URL = "https://nexus-api-lx74.onrender.com/auth/discord/callback"

// =========================
// PASSPORT SERIALIZE
// =========================

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((obj, done) => {
    done(null, obj)
})

// =========================
// DISCORD STRATEGY
// =========================

passport.use(new DiscordStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    scope: ["identify", "email", "guilds"]
},
(accessToken, refreshToken, profile, done) => {

    try {

        const user = {
            id: profile.id || null,
            username: profile.username || profile.global_name || "discord_user",
            avatar: profile.avatar || null,
            email: profile.email || null
        }

        return done(null, user)

    } catch(err) {
        console.error("Discord error:", err)
        return done(err, null)
    }

}))

// =========================
// ROUTES
// =========================

// test api
app.get("/", (req,res)=>{
    res.json({
        name:"NexusComunication API",
        status:"online"
    })
})

// login discord
app.get("/auth/discord",
    passport.authenticate("discord")
)

// callback discord
app.get("/auth/discord/callback",
    passport.authenticate("discord",{ failureRedirect: "/error" }),
    (req,res)=>{
        res.json({
            login:true,
            user:req.user
        })
})

// errore login
app.get("/error",(req,res)=>{
    res.json({
        login:false,
        message:"Discord authentication failed"
    })
})

// =========================
// SERVER
// =========================

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log("Nexus API running on port " + PORT)
})