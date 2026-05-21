const express = require('express')
require('dotenv').config()
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs')
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

const JWKS = createRemoteJWKSet(
    new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)

const verifyToken = async (req, res, next) => {
    const authHeader = req?.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1]
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
        const { payload } = await jwtVerify(token, JWKS)
        console.log(payload)
        next();
    }
     catch (error) {
        return res.status(403).json({ message: 'Forbidden' });
    }
}

async function run() {
    try {
        // await client.connect();

        const db = client.db("tutor-booking");
        const tutorsColl = db.collection("tutors");
        const myBookSession = db.collection("book-session");

        // Make database collection available globally to services/controllers
        app.locals.tutorsColl = tutorsColl;

        // Mount modular routes ( clean architecture )
        const tutorRoutes = require('./routes/tutorRoutes');
        app.use('/api', tutorRoutes);
        app.use('/', tutorRoutes);

        app.get('/tutors', async (req, res) => {
            const id = req.params.id
            const tutors = await tutorsColl.find().toArray();
            res.send(tutors);
        })

        app.get('/tutors/:id', verifyToken, async (req, res) => {
            const id = req.params.id
            const tutor = await tutorsColl.findOne({ _id: new ObjectId(id) });
            res.send(tutor);
        })

        app.get('/book-session', async (req, res) => {
            const cursor = myBookSession.find();
            const myBookSessions = await cursor.toArray();
            res.send(myBookSessions);
        })

        app.get('/available-tutor', async (req, res) => {
            const cursor = tutorsColl.find().limit(4);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.post('/add-tutor',verifyToken, async (req, res) => {
            const tutor = req.body;
            const result = await tutorsColl.insertOne(tutor);
            res.send(result)
        })

        app.post('/book-session', async (req, res) => {
            const bookSession = req.body;
            const result = await myBookSession.insertOne(bookSession);
            res.send(result);
        })

        //
        app.patch('/book-session/:id', async (req, res) => {
            const id = req.params.id;
            const updatedStatus = req.body.statusX;
            const email = req.body.email;
            const name = req.body.name;

            const filter = { _id: new ObjectId(id) };

            const updateDoc = {
                $set: {
                    statusX: updatedStatus,
                    email: email,
                    name: name
                    }
            };

            const result = await myBookSession.updateOne(filter, updateDoc);

            res.send(result);
        });

        app.patch('/my-tutor/:id',verifyToken, async (req, res) => {
            const id = req.params.id;
            const filter = {
                _id: new ObjectId(id),
            }
            const modifiedData = req.body;
            const updateDoc = {
                $set: modifiedData,
            }
            const result = await tutorsColl.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.delete('/my-tutor/:id',verifyToken, async (req, res) => {
            const { id } = req.params
            const result = await tutorsColl.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        })

        // await client.db("admin").command({ ping: 1 });
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
