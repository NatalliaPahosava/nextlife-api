import express from 'express'
import cors from 'cors'
import { MongoClient, ObjectId } from 'mongodb'
import 'dotenv/config'

///---connections---///
const URI='mongodb+srv://NatalliaPahosava:sladk11mo1@nataliapogosova.1b8tti3.mongodb.net/test'
const PORT=4040
const client= new MongoClient(URI)
const database=client.db('nextlife-api')
const items=database.collection('items')
client.connect()

const app=express()
app.use(cors())
app.use(express.json())

app.listen(PORT,()=>console.log('API is running on PORT 4040'))

//--------Get(Read)---------//
app.get('/',async(req,res)=>{
const allItems=await items.find().toArray()
res.send(allItems)})

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

