const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');
const utils = require('./utils');

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
  utils.noParamQuery('SELECT * FROM projects')
  .then((results) => {
    res.render('index.html', {projects: results});
  })
  .catch((err) => {
    console.log(err);
  });
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

app.post('/createproject', function(req, res) {
  const timeStamp = new Date().toString();
  const values  = {
    createTime: timeStamp,
    name: req.body.name,
    description: req.body.desc,
    deadline: req.body.deadline,
  };
  utils.paramQuery('INSERT INTO projects SET ?', values)
  .then((results) => {
    res.send({ redirect: `/project/${results.insertId}` })
  })
  .catch((err) => {
    console.log(err);
  });
});

app.listen(3000, () => console.log('Test app listening on port 3000!'));
