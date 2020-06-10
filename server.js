var express = require('express');
var exphbs = require('express-handlebars');
var postData = require('./postData');
var bodyParser = require('body-parser');
var fs = require('fs');



var app = express();
var port = process.env.PORT || 3000;

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(express.static('public'));

var hbs = exphbs.create({});

hbs.handlebars.registerHelper('ifModal', function(value, option) {
    if (value <= 1) {
        return option.inverse(this);
    }
    return option.fn(this);
});

function renderIndexPage(req, res, next) {
    if (postData) {
        res.status(200).render('postPage', {
            posts: postData
        });
    } else {
        next();
    }
};


app.get('/', function(req, res) {
    console.log("==  home page is shown.")

    res.status(200).render('postPage', {
        posts: postData
    });

});


app.get('/index.html', renderIndexPage);

app.get('/posts/:n', function(req, res, next) {
    var n = req.params.n.toLowerCase();
    if (postData[n]) {
        res.status(200).render('partials/postCard', postData[n]);
    } else {
        next();
    }
});





app.post('/addPic', function(req, res, next) {
    console.log("== req.body:", req.body);
    if (req.body && req.body.title && req.body.imageURL && req.body.theme && req.body.link) {

        postData.push({
            link: req.body.link,
            title: req.body.title,
            imageURL: req.body.imageURL,
            theme: req.body.theme
        });
        if (req.body.numD) {
            postData.splice(req.body.numD, 1);
        }
        /////////////////////////////////////
        res.status(200).send("Photo successfully added");
        fs.writeFile('postData.json', JSON.stringify(postData, null, 2), function(err) {
            if (err) throw err;
            console.log('File updated.');
        });

    } else {
        res.status(400).send({
            error: "Request body needs full information."
        });
    }
});





app.get('*', function(req, res) {
    res.status(404).render('404', {});
});


app.listen(port, function() {
    console.log("== Server is listening on port", port);
});