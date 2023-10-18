const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


// const uri = "mongodb+srv://<username>:<password>@cluster0.3al0nc5.mongodb.net/?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3al0nc5.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const coffeeCollection = client.db("coffeeDB").collection('coffee');
        const userCollection = client.db("coffeeDB").collection('user');

        app.post('/coffee', async (req, res) => {
            const newCoffee = req.body;
            console.log(newCoffee);

            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result);
        })

        app.get('/coffee', async (req, res) => {
            // return only selected fields to client side
            const options = {
                projection: { _id: 1, name: 1, photo: 1, chef: 1, price: 1 }
            }
            const cursor = coffeeCollection.find({}, options);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        })

        app.put('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }; // same as find (select which data will be updated)
            const options = { upsert: true }; // will insert new if _id does not matched
            const updatedCoffee = req.body; // updated data from client
            const updateCoffee = {
                $set: {
                    name: updatedCoffee.name,
                    quantity: updatedCoffee.quantity,
                    chef: updatedCoffee.chef,
                    supplier: updatedCoffee.supplier,
                    category: updatedCoffee.category,
                    details: updatedCoffee.details,
                    photo: updatedCoffee.photo,
                    price: updatedCoffee.price
                }
            };
            const result = await coffeeCollection.updateOne(filter, updateCoffee, options);
            res.send(result);
        })

        app.delete('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        })


        // user related api's
        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.get('/user', async (req, res) => {
            const options = {
                projection: { _id: 1, name: 1, email: 1, createAt: 1 }
            }
            const cursor = userCollection.find({}, options);
            const users = await cursor.toArray();
            res.send(users);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Server is running...');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});