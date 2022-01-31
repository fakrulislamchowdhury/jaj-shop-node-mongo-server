const express = require('express');
const { JAJ_SHOP_DB, SERVICE_COLLECTION } = require("./collection.constant")
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
var admin = require("firebase-admin");

const cors = require('cors');
const { get } = require('express/lib/response');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 7000;

// firebase admin initialization
var serviceAccount = require('./jaj-shop-firebase-adminsdk-d3buk-73751537e4.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a29dq.mongodb.net/JAJ_Shop?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db(JAJ_SHOP_DB);
        const servicesCollection = database.collection(SERVICE_COLLECTION);

        // console.log(servicesCollection)
        console.log(uri);

        // Get API
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })

        //Get Single Service
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.json(service);
        })

        // POST API
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            console.log(result);
            res.json(result);
        })

    }

    finally {
        // await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('JAJ Shop server is Running');
});

app.listen(port, () => {
    console.log('Running Server on port', port);
});