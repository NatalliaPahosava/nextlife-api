import express from 'express'
import cors from 'cors'
import { MongoClient, ObjectId } from 'mongodb'
import 'dotenv/config'
////////----For Login----//////
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

///---Connections---///
const URI=process.env.MONGO_URI
const PORT = 4040
const client = new MongoClient(URI)
const database = client.db('nextlife-api')
const items = database.collection('items')

///////--Login Collections--/////
const usersdb = database.collection('users')

client.connect()

const app = express()
app.use(cors())
app.use(express.json())
app.listen(PORT, () => console.log('API is running on PORT 4040'))

//--------Get(Read)---------/
app.get('/', async (req, res) => {
  const userToken = req.headers.authentication
  jwt.verify(userToken, 'secret-key', async (err, decoded) => {
    //if token is ok then send list of users to req
    if (decoded) {
      const allItems = await items.find().toArray()
      res.status(200).send(allItems)
    } else {
      res.send('sorry no token found,please log in again')
    }
  })
})

//--------POST(Create)-------//
app.post('/', async (req, res) => {
  await items.insertOne(req.body)
  res.status(201).json({ success: 'Item was added' })
})
//---------DELETE(Delete)-----// start

app.delete('/', async (req, res) => {
  let id = new ObjectId(req.query._id)
  await items.findOneAndDelete({ _id: id })
  res.status(200).json('Item was deleted')
})
//---------PUT(Update)--------//
app.put('/', async (req, res) => {
  await items.findOneAndUpdate(req.query, { $set: req.body })
  res.status(200).json('Item was updated')
})

////////----signup-----/////
app.post('/signup', async (req, res) => {
  //1.get data from RQ
  const newUser = { email: req.body.email, password: req.body.password }
  console.log('this is req body', req.body)
  //2. hash password
  const hashedPassword = await bcrypt.hash(newUser.password, 10)
  //3. save the new user in to DB
  await usersdb.insertOne({ email: newUser.email, password: hashedPassword })
  //4.send somth back to the requestor aka frontend
  res.status(201).send('User was added')
})
//////----login-----/////
app.post('/login', async (req, res) => {
  if (req.body.email && req.body.password) {
    //1.get data from req
    const user = await usersdb.findOne({ email: req.body.email })
    console.log('user found---', user)
    //2. check the hashed password against the db-authentication
    const allowedUser = await bcrypt.compare(req.body.password, user.password)
    console.log('this is req body---', allowedUser)
    //3.create a jwt token for user-Authorization
    const accessToken = jwt.sign(user, 'secret-key')
    console.log('this isToken-----', accessToken)
    //4. Send somth back to requestor aka frontend
    res.status(200).send({ accessToken: accessToken })
  } else {
    res.send('Hey you are not sending me Email/Password?')
  }
})
