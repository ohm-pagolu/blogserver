var express = require('express');
var router = express.Router();
var db = require('../db');
var dbo = null;

var jwt = require('jsonwebtoken');
var private_key = "C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c";
var cookieParser = require('cookie-parser');
router.use(cookieParser());

db.connect((err) => {
    if(err) return err;
    dbo = db.get().db('BlogServer');
});

router.get('/:username', (req,res,next) => {
    const token = req.cookies.jwt;

    if(!token) {
        res.status(401).send();
        return;
    }

    jwt.verify(token, private_key, (err,decoded) => {
        if(err) {
            res.status(401).send();
            return;
        }
        
        if(decoded.usr !== req.params.username) {
            res.status(401).send();
            return;
        }
        next();
    });

});

router.get('/:username', (req,res,next) => {
    dbo.collection('Posts').find({'username':req.params.username}).sort({'postid':1}).toArray((err,result) => {
        if(err) throw err;
        // console.log(result);
        res.status(200).send(result);
    });
});

router.all('/:username/:postid', (req,res,next) => {
    const token = req.cookies.jwt;

    if(!token) {
        res.status(401).send();
        return;
    }

    jwt.verify(token, private_key, (err,decoded) => {
        if(err) {
            res.status(401).send();
            return;
        }
        
        if(decoded.usr !== req.params.username) {
            res.status(401).send();
            return;
        }
        next();
    });

});

router.get('/:username/:postid',(req,res,next) => {
    if(parseInt(req.params.postid) == NaN){
        res.status(400).send("Bad request!");
        return;
    }
    dbo.collection('Posts').findOne({'postid':parseInt(req.params.postid),'username':req.params.username},(err,result) => {
        if(err) throw err;

        if(result == null){
            res.status(404).send();
            return;
        }
        // console.log(typeof(result));
        res.status(200).send(result);
    });
});

router.post('/:username/:postid',(req,res,next) => {
    if(parseInt(req.params.postid) == NaN || req.body.title == null || req.body.body == null){
        console.log(req.body);
        if(parseInt(req.params.postid) == NaN ){
            res.status(400).send("Bad request! 1");
        }
        else if(req.body.title == null){
            res.status(400).send("Bad request! 2");
        }
        else if(req.body.body == null){
            res.status(400).send("Bad request! 3");
        }
        
        return;
    }
    dbo.collection('Posts').findOne({'postid':parseInt(req.params.postid),'username':req.params.username},(err,result) => {
        if(err) throw err;
        // console.log(result);
        if(result != null){
            res.status(400).send();
            return;
        }
        let t = Date.now();
        let v = {'postid':parseInt(req.params.postid),'username':req.params.username,'created':t,'modified':t,'title':req.body.title,'body':req.body.body};
        dbo.collection('Posts').insertOne(v,(err,result) => {
            // console.log('Inserted : ' + v);
            res.status(201).send();
        });
        
    });
});

router.put('/:username/:postid',(req,res,next) => {
    if(parseInt(req.params.postid) == NaN || req.body.title == null || req.body.body == null){
        res.status(400).send("Bad request!");
        return;
    }
    dbo.collection('Posts').findOne({'postid':parseInt(req.params.postid),'username':req.params.username},(err,result) => {
        if(err) throw err;
        // console.log(result);
        if(result == null){
            res.status(400).send();
            return;
        }
        let t = Date.now();
        let q = {'postid':parseInt(req.params.postid),'username':req.params.username};
        let update = {$set : {'modified':t,'title':req.body.title,'body':req.body.body}};

        dbo.collection('Posts').updateOne(q,update,(err,result) => {
            // console.log('Inserted : ' + v);
            res.status(200).send();
        });
        
    });
});

router.delete('/:username/:postid',(req,res,next) => {
    if(parseInt(req.params.postid) == NaN){
        res.status(400).send("Bad request!");
        return;
    }
    dbo.collection('Posts').deleteOne({'postid':parseInt(req.params.postid),'username':req.params.username},(err, r) => {
        // console.log(r.deletedCount);
        if(r.deletedCount == 1)
            res.status(204).send();
        else
            res.status(400).send();
    });
});

module.exports = router;