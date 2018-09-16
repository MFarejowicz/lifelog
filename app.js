const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { googleCredentials } = require('./credentials');
const session = require('express-session');
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
  passport.authenticate('google', { successRedirect : 'back', failureRedirect: 'back', session: true}),
  function (req, res) {
    console.log('Here is our user object:', req.user);
    res.redirect('/');
  }
);

app.get('/', function(req, res) {
  utils.noParamQuery('SELECT * FROM projects')
  .then((results) => {
    res.render('index.html', {projects: results, loggedIn: req.isAuthenticated()});
  })
  .catch((err) => {
    console.log(err);
  });
});

app.get('/project/:project', function(req, res) {
  Promise.all([
    utils.paramQuery('SELECT * FROM projects WHERE projectId = ?', req.params.project),
    utils.paramQuery('SELECT fkUserId, fkUserName FROM projectsUsers WHERE fkProjectId = ?', req.params.project),
    utils.paramQuery('SELECT * FROM updates WHERE fkProjectId=?', req.params.project)
  ])
  .then((results) => {
    const dbHit = results[0][0];
    const ownerList = results[1];
    const ownerNames = ownerList.map(el => el.fkUserName)
    let isOwner = false;
    if (req.user) {
      isOwner = ownerList.some(el => el.fkUserId === req.user.id);
    }
    const updates = results[2];
    res.render('project.html', {project: dbHit, updates, ownerNames, isOwner, loggedIn: req.isAuthenticated()});
  })
  .catch((err) => {
    console.log(err);
  });
});

app.get('/me', function(req, res) {
  if (req.isAuthenticated()) {
    utils.paramQuery('SELECT projects.* FROM projectsUsers JOIN projects ON fkProjectId=projectId WHERE fkUserId = ?', req.user.id)
    .then((results) => {
      res.render('me.html', {projects: results, loggedIn: true});
    })
    .catch((err) => {
      console.log(err);
    });
  } else {
    res.render('me.html', {loggedIn: false});
  }
});

app.get('/new', function(req, res) {
  res.render('new.html', {loggedIn: req.isAuthenticated()});
});

app.post('/createproject', function(req, res) {
  const timeStamp = new Date().toString();
  const values = {
    createTime: timeStamp,
    name: req.body.name,
    description: req.body.desc,
    deadline: req.body.deadline,
  };
  utils.paramQuery('INSERT INTO projects SET ?', values)
  .then((results) => {
    const ownerInfo = [results.insertId, req.user.id, req.user.displayName];
    utils.paramQuery('INSERT INTO projectsUsers VALUES (?)', [ownerInfo])
    res.send({ redirect: `/project/${results.insertId}` })
  })
  .catch((err) => {
    console.log(err);
  });
});

app.post('/postupdate', function(req, res) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const timeStamp = new Date().toLocaleDateString('en-US', options);
  const values = {
    fkProjectId: req.body.projectId,
    fkUserName: req.user.displayName,
    timeStamp,
    content: req.body.content,
  }
  utils.paramQuery('INSERT INTO updates SET ?', values)
  .then((results) => {
    res.send('success');
  })
  .catch((err) => {
    console.log(err);
  });
});

app.listen(3000, () => console.log('Test app listening on port 3000!'));
