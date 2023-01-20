const express = require('express')
const uid = require('uniqid')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const studentRouter = express()
const fs = require('fs')

//-----Middleware
studentRouter.use(express.urlencoded({ extended: true }))
//return the user authorizing the token
const authenticateTocken = (req, res, nex) => {
    const authHeader = req.headers['authorisation']
    console.log(authHeader.split(' ')[1])
    const tocken = authHeader && authHeader.split(' ')[1]
    if (tocken == null) return res.status(401).send()

    jwt.verify(tocken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).send(err)
        req.user = user
        nex()
    })
}

/*studentRouter.listen('3000', () => {
    console.log('server initiated json')
})*/

//------Functions
const checkUser = (us=null) => {
    let index = fs.readFileSync('./db.json')
    index = JSON.parse(index)
    let user=us
    us && ( user = index.find(u => u.user == us))
    return { index, user }
}


const indexId = (req, res) => {
    const {user}=checkUser(req.user.user)
    res.status(201).send(user)

    
}

const indexAll = (req, res) => {
    const {index}=checkUser()
    let stuList=index.map(s=>s.info)
    res.status(201).send(stuList)
}


const create = (req, res) => {
    
}

const update = (req, res) => {
    const {user, index}=checkUser(req.user.user)
    console.log(req.body)
    console.log('/n /n')
    user.info.name=req.body.name
    user.info.rollnumber=req.body.rollnumber
    user.info.email=req.body.email
    fs.writeFileSync("./db.json",JSON.stringify(index, null , 2),'utf8')
    res.status(201).send(user)
}




const delet = (req, res) => {
    const {user, index}=checkUser(req.user.user)
    index.splice(index.indexOf(user),1)
    fs.writeFileSync("./db.json",JSON.stringify(index, null , 2),'utf8')
    res.status(201).send({...user, message:"deleted"})
}


//------Routes
/*INDEX*/
studentRouter.get('/user',authenticateTocken, indexId)
studentRouter.get('/', indexAll)

/*CREATE POST*/
studentRouter.post('/', authenticateTocken, create)

/*UPDATE*/
studentRouter.patch('/', authenticateTocken, update)

/*DELETE*/
studentRouter.delete('/',authenticateTocken, delet)


//DEFAULT
/*
studentRouter.use('/', (req, res) => {
    res.redirect('/')
})*/

module.exports = studentRouter;