var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var commonmark = require('commonmark')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var MongoClient = require('mongodb').MongoClient;
var db = require('./db');

var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var private_key = "C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c";

var reader = new commonmark.Parser();
var writer = new commonmark.HtmlRenderer();

var app = express();
app.set('view engine', 'ejs'); // template engine to use
app.set('views', './views')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
 
// parse application/json
app.use(bodyParser.json())
var dbo = null;

db.connect((err) => {
    if(err) return err;
    dbo = db.get().db('BlogServer');
});

var editor = require('./routes/editor');

app.use(editor);

app.use(express.static('public'));

var api = require('./routes/api');

app.use('/api',api);

app.get('/login', (req,res,next) => {
    res.render('login', {'username':"", 'password':"", 'redirect':req.query.redirect});
});

app.post('/login', (req,res,next) => {
    let username = req.body.username;
    let password = req.body.password;
    let redirect = req.body.redirect;

    if(username == null || password == null) {
        res.status(400).send("Bad Request!");
        return;
    }

    dbo.collection('Users').findOne({'username':username}, (err,result) => {
    	if(err) throw err;

        if(result == null){
            res.status(401).render('login', {'username':username, 'password':password, 'redirect':redirect});
            return;
        }

        let hash = result.password;
        bcrypt.compare(password, hash, (err2,hash_res) => {
        	if(err2) throw err2;

        	if(hash_res === false) {
        		res.status(401).render('login', {'username':username, 'password':password, 'redirect':redirect});
            	return;
        	}

        	jwt.sign({"exp": Math.floor(Date.now() /1000) + (120 * 60),"usr": username}, private_key, 
        		{noTimestamp: true, header: { "alg": "HS256","typ": "JWT"}}, (err3,token) => {
        		if(err3) throw err3;

        		res.cookie("jwt", token);
        		if(redirect == undefined || redirect == "") {
			        res.status(200).send("Authentication Successful!");
			    } else {
			        res.redirect(redirect);
			    }
        	});
        	
        });

    });
    
});

app.get('/blog/:username/:postid',(req,res,next) => {
    if(parseInt(req.params.postid) == NaN){
        res.status(400).send("Bad request!");
        return;
    }
    dbo.collection('Posts').findOne({'postid':parseInt(req.params.postid),'username':req.params.username},(err,result) => {
        if(err) throw err;

        if(result == null){
            res.status(404).send("Page not found!");
            return;
        }
        //console.log(result);
        
        let parsed = reader.parse(result.title);
        result.title = writer.render(parsed);
        parsed = reader.parse(result.body);
        result.body = writer.render(parsed);
        let m = new Date(result.modified);
        let c = new Date(result.created);
        result.modified = m.toString();
        result.created = c.toString();
        res.render('post',result);
    });
});


app.get('/blog/:username',(req,res,next) => {
    dbo.collection('Posts').find({'username':req.params.username,'postid':{$gte:parseInt(req.query.start) || 0}}).sort({'postid':1}).limit(5).toArray((err,result) => {
        if(err) throw err;
        // console.log(result);
        var i;
        for(i = 0; i < result.length; i++){
            let parsed = reader.parse(result[i].title);
            result[i].title = writer.render(parsed);
            parsed = reader.parse(result[i].body);
            result[i].body = writer.render(parsed);
            let m = new Date(result[i].modified);
            let c = new Date(result[i].created);
            result[i].modified = m.toString();
            result[i].created = c.toString();
        }
        // console.log(result);
        if(result.length == 0){
            res.status(404).send("No posts to show!");
        }
        else 
            res.render('list',{'title':req.params.username,'posts':result,'start':result[result.length-1].postid+1});

    });
});

/*app.get('*', (req, res) => {
    res.status(404).send("Page not found!");
});*/

module.exports = app;
