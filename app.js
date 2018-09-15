const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');

const app = express();

// Configure app to use bodyParser()
// This will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Make resources available
app.use('/static', express.static(path.join(__dirname, '/public')));

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.get('/', function(req, res) {
    res.render('index.html');
});

app.get('/project/:project', function(req, res) {
    res.render('project.html', { projectId: req.params.project });
});

app.get('/me', function(req, res) {
    res.render('me.html');
});

app.get('/new', function(req, res) {
    res.render('new.html');
});

app.listen(3000, () => console.log('Test app listening on port 3000!'));
