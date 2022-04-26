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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" })
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "forbidden access" })
    }
    req.decoded = decoded;
    next();
  })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.v95so.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

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

    // Auth
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d"
      })
      res.send({ accessToken })
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
    app.get("/orders", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email
      const email = req.query.email
      if (email === decodedEmail) {
        const query = { email: email }
        const cursor = orderCollection.find(query)
        const result = await cursor.toArray();
        res.send(result);
      }
      else {
        res.status(403).send({ message: "forbidden access" })
      }
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