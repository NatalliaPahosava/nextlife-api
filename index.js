import express from 'express'
import cors from 'cors'
import { MongoClient } from 'mongodb'
import 'dotenv/config'

const URI=process.env.MONGO_URI
const PORT=process.env.PORT
const client= new MongoClient(URI)
const database=client.db('nextlife-api')
const items=database.collection('items')
client.connect()

const app=express()
app.use(cors())
app.use(express.json())

app.listen(PORT,()=>console.log('API is running on PORT 4040'))
app.get('/',async(req,res)=>{
const allItems=await items.find().toArray()
res.send(allItems)})
//POST

app.post('/',async(req,res)=>{
await items.insertOne(req.body)  
res.send('Item was added')
})
//DELETE
app.delete('/', async(req,res)=>{
  await items.findOneAndDelete(req.query)
  res.json('Item was deleted')
})
//---------PUT---------//
app.put('/',async (req,res)=>{
    items.findOneAndUpdate(req.query,{ $set:req.body })
    res.json('Item was updated')
})

