const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const utils = require('./utils');
const { googleCredentials } = require('./credentials');

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

// Set up passport strategy
passport.use(new GoogleStrategy({
    clientID: googleCredentials.clientId,
    clientSecret: googleCredentials.clientSecret,
    callbackURL: 'http://localhost:3000/auth/google/callback',
    scope: ['email'],
  },
  function (accessToken, refreshToken, profile, callback) {
    return callback(null, profile);
  },
));

app.use(session({
  secret: 'default_session_secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((userDataFromCookie, done) => {
  done(null, userDataFromCookie);
});

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/', session: true}),
  function (req, res) {
    console.log('Here is our user object:', req.user);
    res.redirect('/');
  }
);

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
  utils.paramQuery('SELECT * FROM projects WHERE projectId = ?', req.params.project)
  .then((results) => {
    const dbHit = results[0];
    res.render('project.html', { project: dbHit });
  })
  .catch((err) => {
    console.log(err);
  });
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
