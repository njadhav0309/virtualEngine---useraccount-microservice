const express = require('express')
const app = express()
var port = process.env.PORT || 8080
app.use(express.urlencoded({extended: false}))

const cors = require('cors')//New for microservice
app.use(cors())//New for microservice

app.listen(port, () => 
    console.log(`HTTP Server with Express.js is listening on port:${port}`))

const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const saltRounds = 10;
const mongourl = "mongodb+srv://cca-jadhavn1:njadhav@cca-jadhavn1.wsjtb.mongodb.net/cca-labs?retryWrites=true&w=majority"; //from previous step
const dbClient = new MongoClient(mongourl, {useNewUrlParser: true, useUnifiedTopology: true});
dbClient.connect(err => {
    if (err) throw err;
    console.log("Connected to the MongoDB cluster");
});

app.get('/', (req,res) => {
    console.log("Here i am", __dirname);
    res.sendFile(__dirname + "/signup.html");
})

app.post('/signup', (req,res) => {
    const {username, password, email, fullname} = req.body;
    console.log("Username", username);
    console.log("Password", password, fullname, email);

    const db = dbClient.db();

    db.collection("users").findOne({username:username}, (err,user) => {
        if(user) {
            console.log("User Found", user);
            res.send({statusMsg:"Username Alrpeady Exists!", status:false});
        } else {
            let newUser = {
                username: username,
                password: password,
                email: email,
                fullname: fullname
            }
            console.log("Adding User", username);
            bcrypt.hash(password, saltRounds, function(err, hash) {
                if(err) {
                    res.send({statusMsg:"Signup unsuccessful!", status:false});
                }
                let newUser = {
                    username: username,
                    password: hash,
                    email: email,
                    fullname: fullname
                }
                db.collection("users").insertOne(newUser, (err, result) => {
                    if(err) {
                        res.send({statusMsg:"Signup unsuccessful", status:false});
                    }
                    res.send({statusMsg:"Signup successful", status:true});
                })
            });
        }
    });
});

app.post('/login', (req,res) => {
    const {username, password} = req.body;
    console.log("Username", username);
    console.log("Password", password);
    const db = dbClient.db();

    db.collection("users").findOne({username:username}, (err,user) => {
        if(err) {
            console.log("Login failed",err);
            res.send({statusMsg:"Login Failed! Username or password invalid", status:false});
        }
        
        if(user){ 
            console.log("User details", user, password);
            bcrypt.compare(password, user.password, function(err, result) {
                if(err) {
                    console.log("Login failed",err);
                    res.send({statusMsg:"Login Failed! bcrypt password failed ", status:false});
                }
            
                if(result) {
                    console.log("Login suceess", result, err);
                    res.send({statusMsg:"Success", status:true});
                } else {
                    console.log("Login failed",err);
                    res.send({statusMsg:"Login Failed! Password Mismatched", status:false});
                }
                
            });
        }
    });

});
