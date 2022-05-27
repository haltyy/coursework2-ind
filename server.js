//list of added modules.
const { request } = require('express');
const express = require('express');
var path = require("path");
var fs = require("fs");
const { ObjectId } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;

const app = express();

app.use(express.json());
app.set('port', 3000)

//logger middleware to output requests to server console
app.use(function(req, res, next) {
    console.log("In comes a " + req.method + " request to " + req.url);
    next();
})
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});


let db;

//connecting mongodp compass
MongoClient.connect('mongodb+srv://sadiya:sadiyamuhd@cluster0.xzza6.mongodb.net', (err, client) => {
    db = client.db('afterschoolclub');
});

app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collectionName');
});

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
});

//mongodb GET request 
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results);
    });
});

// mongodb GET request for search feature
app.get('/collection/:collectionName/:k', (req, res) => {
    var key_1 = req.params.k;
    console.log("Searched figure: " + key_1);
    
    req.collection.find({$or: [ {subject: { $regex: '^'+key_1, $options: "i" }}, {location: { $regex: '^'+key_1, $options: "i" }}]}).toArray((e, results) => {
        if (e) return console.log(e)
        res.send(results);
    });
});

//mongodb POST request 
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insertOne(req.body, (e, results) => {
        if (e) return next(e);
        res.send(results.ops);
    });
});

const ObjectID = require('mongodb').ObjectID;

//GET request for retrieving lesson by specifying the id
app.get('/collection/:collectionName/:id', (req, res, next) => {
req.collection.findOne({ _id: new ObjectId(req.params.id) }, (e, result) => {
if (e) return next(e)
res.send(result)
})
})

//PUT request to update the lessons
app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.update(
    {_id: new ObjectId(req.params.id)},
    {$set: req.body},
    {safe: true, multi: false},
    (e, result) => {
    if (e) return next(e)
    res.send(
        result.modifiedCount === 1 ? { msg: "success" } : { msg: "error" }
        );
    
    })
    })

//Static middleware. This middleware checks if an image exists in the static folder
    app.use(function(req, res, next){
        var filePath = path.join(__dirname, "static", req.url);
        fs.stat(filePath, function(err, fileInfo){
            if(err){
                next();
                return;
            }
            if(fileInfo.isFile()){ //checks if the file exists in the static directory
                res.sendFile(filePath);
            }else{
                
                next();
            }
        });
    });

//If an image does not exist in the static folder, the error message is displayed.
    app.use(function(req, res){
        res.status(404);
        res.send("File not Found!");
    });   

//deploying the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Server running...");
});