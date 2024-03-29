const express = require('express')
const cors = require("cors");
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
require("dotenv").config();
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Genius car services')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.v95so.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect()
  .then((result) => {
    console.log("Mongodb Connected")
  })
  .catch((error) => {
    console.log("Mongodb not Connected");
  })

async function run() {
  try {

    await client.connect();
    const userCollection = client.db("geniusCar").collection("service");
    const orderCollection = client.db("geniusCar").collection("order");

    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = userCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await userCollection.findOne(query);
      res.send(result);
    })

    app.post("/service", async (req, res) => {
      const newUser = req.body
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    })

    app.delete("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })

    // Orders
    app.get("/orders", async (req, res) => {
      const email = req.query.email
      const query = { email: email }
      const cursor = orderCollection.find(query)
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post("/order", async (req, res) => {
      const order = req.body
      const result = await orderCollection.insertOne(order);
      res.send(result);
    })

  }
  finally {
    //  await client.close();
  }
}

run().catch(console.dir)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})