var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken');
var private_key = "C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c";
var cookieParser = require('cookie-parser');
router.use(cookieParser());

router.all('/editor', (req,res,next) => {
    const token = req.cookies.jwt;

    if(!token) {
        res.redirect("/login?redirect=/editor/");
        return;
    }

    jwt.verify(token, private_key, (err,decoded) => {
        if(err) {
            res.redirect("/login?redirect=/editor/");
            return;
        }
        next();
    });
});

module.exports = router;