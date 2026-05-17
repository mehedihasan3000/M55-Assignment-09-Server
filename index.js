const express = require('express')
require('dotenv').config()
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 8000

app.use(cors())
app.use(express.json())

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const db = client.db("tutor-booking");
        const tutorsColl = db.collection("tutors");

        app.get('/tutors', async (req, res) => {
            const cursor = tutorsColl.find();
            const alltutors = await cursor.toArray();
            res.send(alltutors);
        })

        app.get('/tutors/:id', async (req, res) => {
            const id = req.params.id
            const tutor = await tutorsColl.findOne({ _id: new ObjectId(id) });
            res.send(tutor);
        })

        app.post('/add-tutor', async (req, res) => {
            const tutor = req.body;
            const result = await tutorsColl.insertOne(tutor);
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
