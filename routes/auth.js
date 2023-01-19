const express = require('express')
const authRouter = express()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
require('dotenv').config()
const fs = require('fs')

const uid = require('uniqid')

//-----Middleware
authRouter.use(express.json())
authRouter.use(express.urlencoded({ extended: true }))
//authRouter.listen(5001)

//------Functions
const checkUser = (us) => {
    let index = fs.readFileSync('./db.json')
    index = JSON.parse(index)
    const user = index.find(u => u.user == us)
    return { index, user }
}

const authenticate_create = async (req, res) => {
    if (!(req.body.user && req.body.password))
        return res.status(400).send("insufficient credidentials")
    let { index, user } = checkUser(req.body.user)
    if (user)
        res.status(400).send("user already exists")
    else {
        //authenticate user first
        try {
            const hashedPass = await bcrypt.hash(req.body.password, 10)
            const user = {
                user: req.body.user, password: hashedPass, info: {
                    name: "name",
                    rollnumber: "rollnumber",
                    email: "email",
                    id: uid()
                }
            }

            index.push(user)
            fs.writeFileSync("./db.json", JSON.stringify(index, null, 2), 'utf8')

            authenticate_login(req, res)

        }
        catch (err) {
            console.log(err)//*
            res.status(500).send()
        }
    }
}

const authenticate_login = async (req, res) => {
    //check if user exists
    let { user } = checkUser(req.body.user)

    if (user) {
        try {
            if (await bcrypt.compare(req.body.password, user.password)) {
                //jwt session token(athorization)
                const acTkn = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})
                res.status(201).json({ accessTocken: acTkn })
            }
            else
                res.status(400).send("wrong password")
        } catch (e) {
            console.log(e)
            res.status(500).send(e)
        }

    }
    else
        res.status(400).send("no user")
}

//------Routes

/*Create new account, adds it to list of user*/
authRouter.post('/signup', authenticate_create)

/*authenticates user account, matching from user list*/
authRouter.post('/login', authenticate_login)

module.exports = authRouter;