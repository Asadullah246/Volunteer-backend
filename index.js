const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
// middleware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1ogyy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const volunteerCollection = client.db("members").collection('member-details');
        const newCollection=client.db("members").collection('new-members')
        const eventsCollection=client.db("members").collection('events')

        app.get('/volunteer', async (req, res) => {
            const query = {};
            const cursor = volunteerCollection.find(query);
            const allVolunteer = await cursor.toArray();
            res.send(allVolunteer);
        })
        app.get('/allEvents', async (req, res) => {
            const query = {};
            const cursor = eventsCollection.find(query);
            const events = await cursor.toArray();
            res.send(events);
        })
        app.post('/newVolunteer', async(req, res)=>{
            const newVolunteer=req.body;
            const result=await newCollection.insertOne(newVolunteer);
            res.send(result);
        })
        app.get('/volunteerList', async(req, res)=>{
            const query={};
            const cursor=newCollection.find(query);
            const list=await cursor.toArray();
            res.send(list);
        })
        app.delete('/volunteerList/:id', async(req, res)=>{
            const id =req.params.id;
            console.log(id);
            const query={_id: ObjectId(id)}
            const result=await newCollection.deleteOne(query);
            res.send (result)
        })
        app.post('/addEvents', async(req, res)=>{
            const newEvent=req.body;
            const email=req.headers.email;
            const accessToken=req.headers.token;
            try{

                const  decoded = jwt.verify(accessToken, process.env.DB_JWTTOKEN);
                if(email===decoded.email){
                    const result=await eventsCollection.insertOne(newEvent);
                    res.send({success : "Done"});
                    console.log("sucess done");

                }
            }
            catch(err){
                res.send({success : "unauthorized user"})
                console.log("failed hoyeche");

            }
            
    
           
        })
        app.post('/login',async(req,res)=>{
            const email=req.body;
            const token = jwt.sign(email, process.env.DB_JWTTOKEN);
            res.send({token});
        })
    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('starting volunteer')
})
app.listen(port, () => {
    console.log("listening this", port);
})