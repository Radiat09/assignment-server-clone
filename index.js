const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 9000;

// milldeware
app.use(cors());
app.use(express.json());

// MondoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fgalepw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const productCollection = client.db("productDB").collection("products");
    const cart = client.db("productDB").collection("cart");

    // Read All products data
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // read specific brand products data
    app.get("/products/:brand", async (req, res) => {
      const brand = req.params.brand;
      // console.log(brand);
      const query = { brandName: brand };

      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Read read specific single brand product data
    app.get("/products/:brand/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await productCollection.findOne(query);
      res.send(result);
    });

    // Read All cart products data
    app.get("/cart", async (req, res) => {
      const cursor = cart.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // Read specific cart products data
    app.get("/cart/:email", async (req, res) => {
      const uEmail = req.params.email;
      const query = { email: uEmail };
      const cursor = cart.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Create Products data
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });
    // Create Cart data
    app.post("/cart", async (req, res) => {
      const newProduct = req.body;
      const result = await cart.insertOne(newProduct);
      res.send(result);
    });

    // Update Product data
    app.patch("/products/:brand/:id", async (req, res) => {
      const product = req.body;
      const id = req.params.id;
      const options = { upsert: true };
      const filter = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          name: product?.name,
          brandName: product?.brandName,
          type: product?.type,
          price: product?.price,
          rating: product.rating,
          short_description: product?.short_description,
          photo: product?.photo,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // Delete Cart Data
    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cart.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Product Server is Running");
});

app.listen(port, () => {
  console.log("Product server is running on port: ", port);
});
