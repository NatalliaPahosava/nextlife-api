import express from 'express'
import cors from 'cors'
import { MongoClient, ObjectId } from 'mongodb'
import 'dotenv/config'
////////----for login//////
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

///---connections---///
const URI='mongodb+srv://NatalliaPahosava:sladk11mo1@nataliapogosova.1b8tti3.mongodb.net/test'
//const URI=MONGO_URI
const PORT=4040
const client= new MongoClient(URI)
const database=client.db('nextlife-api')
const items=database.collection('items')
///////login collections/////
const usersdb = database.collection('users')

client.connect()

const app=express()
app.use(cors())
app.use(express.json())

app.listen(PORT,()=>console.log('API is running on PORT 4040'))

//--------Get(Read)---------//
// app.get('/',async(req,res)=>{
// const allItems=await items.find().toArray()
// res.send(allItems)})

app.get('/',async(req,res)=>{
  const userToken = req.headers.authentication
  jwt.verify(userToken, process.env.SECRET_KEY, async (err, decoded) => {
 
  //if token is ok then send list of users to req
    if (decoded) {
       const allItems=await items.find().toArray()
      res.status(200).send(allItems)
    } else {
      res.send('sorry no token found,please log in again')
    }
  })
 })

//--------POST(Create)-------//
app.post('/',async(req,res)=>{
await items.insertOne(req.body)  
res.send('Item was added')
})
//---------DELETE(Delete)-----//
app.delete('/', async(req,res)=>{
  let id=new ObjectId(req.query._id)
  await items.findOneAndDelete({_id: id})
  res.json('Item was deleted')
})
//---------PUT(Update)--------//
app.put('/',async (req,res)=>{
   await items.findOneAndUpdate(req.query,{ $set:req.body })
    res.json('Item was updated')
})

////////----signup-----/////
app.post('/signup', async (req, res) => {
  //1.get data from RQ
  console.log(req.body)
   const newUser = { email: req.body.email, password: req.body.password } 
  //firstName:req.body.firstName, lastName:req.body.lastName  }
  //2. hash password
  const hashedPassword = await bcrypt.hash(newUser.password, 10)
  //3. save the new user in to DB
  await usersdb.insertOne({ email: newUser.email, password: hashedPassword})
    // , firstName: newUser.firstName,lastName: newUser.lastName })
  //4.send somth back to the requestor aka frontend
  res.status(201).send('User was added')
})
//////----login-----/////
app.post('/login', async (req, res) => {
  if (req.body.email && req.body.password) {
    //1.get data from req
    const user = await usersdb.findOne({ email: req.body.email })
    console.log('user found', user)
    //2. check the hashed password against the db-authentication
    const allowedUser = await bcrypt.compare(req.body.password, user.password)
    console.log(allowedUser)
    //3.create a jwt token for user-Authorization
    const accessToken = jwt.sign(user, process.env.SECRET_KEY)
    console.log(accessToken)
    //4. Send somth back to requestor aka frontend
    res.status(200).send({ accessToken: accessToken })
  } else {
    res.send('Hey you are not sending me Email/Password?')
  }
})
// app.get('/', async (req, res) => {
//   //1. get jwt token from req
//   console.log(req.headers)
//   const userToken = req.headers.authentication
//   console.log(userToken)
//   //2. check jwt token is ok
//   jwt.verify(userToken, process.env.SECRET_KEY, async (err, decoded) => {
//     console.log('decoded user', decoded)

//     //3. if token is ok then send list of users to req
//     if (decoded) {
//       const allUsers = await usersdb.find().toArray()
//       res.status(200).send(allUsers)
//     } else {
//       res.send('sorry no token found,please log in again')
//     }
//   })
// })

// app.post('/add-car', async (req, res) => {
//   //1. get req body
//   const userToken = req.headers.authentication
//   if (!userToken) res.send('sorry no token found,pls log in')
//   //2. check the jwt token
//   jwt.verify(userToken, process.env.SECRET_KEY, async (err, decoded) => {
//    //3.if token is good then add-car to db 
//    if (decoded) {
//       const date = new Date()
//       await carsdb.insertOne({
//         make: req.body.make,
//         model: req.body.model,
//         price: req.body.price,
//         user: decoded.email,
//         createdAt: date,
//         sold: false,
//       })
//       res.send('car was added vroom vroom ')
//     }
//   })
  
// })