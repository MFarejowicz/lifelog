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

// SETUP bodyParser to let us get data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// SETUP resources like style sheets and scripts
app.use('/static', express.static(path.join(__dirname, '/public')));

// SETUP nunjucks to be used for rendering
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

// SETUP Google Auth for login and logout
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
  const { _json: {
      id: userId,
      displayName: userName,
      gender,
      emails: [
        {
          value: email
        }
      ],
      image: {
        url: imageUrl
      }
    }
  } = user;

  utils.paramQuery('SELECT * FROM users WHERE userId = ?', userId)
  .then((results) => {
    if (results.length == 0) {
      const values = { userId, userName, gender, email, imageUrl };
      utils.paramQuery('INSERT INTO users SET ?', values)
      .then((results) => {
        console.log('Added user');
        done(null, user);
      })
      .catch((err) => {
        console.log(err);
      });
    } else {
      console.log('User already exists');
      done(null, user);
    }
  })
  .catch((err) => {
    console.log(err);
  })
});

passport.deserializeUser((userDataFromCookie, done) => {
  done(null, userDataFromCookie);
});

app.get('/auth/google/callback',
  passport.authenticate('google', { successRedirect : 'back', failureRedirect: 'back', session: true}));

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

// SETUP all GET routes for viewing pages
// Landing page
app.get('/', function(req, res) {
  utils.noParamQuery('SELECT * FROM projects')
  .then((results) => {
    res.render('index.html', {projects: results, loggedIn: req.isAuthenticated()});
  })
  .catch((err) => {
    console.log(err);
  });
});

// Project page
app.get('/project/:project', function(req, res) {
  Promise.all([
    utils.paramQuery('SELECT * FROM projects WHERE projectId = ?', req.params.project),
    utils.paramQuery('SELECT fkUserId, fkUserName FROM projectsUsers WHERE fkProjectId = ?', req.params.project),
    utils.paramQuery('SELECT * FROM updates WHERE fkProjectId=?', req.params.project),
    utils.paramQuery('SELECT * FROM projectComments WHERE fkProjectId=?', req.params.project),
  ])
  .then((results) => {
    const dbHit = results[0][0];
    const ownerList = results[1];
    const ownerNames = ownerList.map(el => el.fkUserName).join(', ');
    let isOwner = false;
    if (req.user) {
      isOwner = ownerList.some(el => el.fkUserId === req.user.id);
    }
    const updates = results[2];
    const projectComments = results[3];
    res.render('project.html', {project: dbHit, updates, ownerNames, isOwner, projectComments, loggedIn: req.isAuthenticated()});
  })
  .catch((err) => {
    console.log(err);
  });
});

// Project owners
app.get('/owners/:project', function(req, res) {
  utils.paramQuery('SELECT fkUserId, fkUserName FROM projectsUsers WHERE fkProjectId = ?', req.params.project)
  .then((results) => {
    const dataWithSelfRemoved = results.filter((el) => {
      return el.fkUserId !== req.user.id;
    });
    res.send(dataWithSelfRemoved);
  })
  .catch((err) => {
    console.log(err);
  })
})

// Other user's projects page
app.get('/user/:user', function(req, res) {
  Promise.all([
    utils.paramQuery('SELECT * FROM users WHERE userId = ?', req.params.user),
    utils.paramQuery('SELECT projects.* FROM projectsUsers JOIN projects ON fkProjectId=projectId WHERE fkUserId = ?', req.params.user)
  ])
  .then((results) => {
    const userHits = results[0];
    if (userHits.length > 0) {
      const userInfo = userHits[0];
      const userProjects = results[1];
      res.render('user.html', { validUser: true, userInfo, userProjects, loggedIn: req.isAuthenticated() });
    } else {
      res.render('user.html', { validUser: false, loggedIn: req.isAuthenticated() });
    }
  })
  .catch((error) => {
    console.log(error);
  })
})

// My projects page
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

// New project page
app.get('/new', function(req, res) {
  res.render('new.html', {loggedIn: req.isAuthenticated()});
});

// SETUP all POST routes for performing actions
// Website search
app.post('/search', function(req, res) {
  Promise.all([
    utils.paramQuery('SELECT * FROM projects WHERE name LIKE ?', `%${req.body.search}%`),
    utils.paramQuery('SELECT * FROM users WHERE userName LIKE ?', `%${req.body.search}%`)
  ])
  .then((results) => {
    const output = [];
    const projects = results[0];
    projects.forEach((el) => {
      output.push({ type: 'project', data: el});
    });
    const users = results[1];
    users.forEach((el) => {
      output.push({ type: 'user', data: el});
    });
    res.send(output);
  })
  .catch((err) => {
    console.log(err);
  });
});

// Collaborator search
app.post('/searchusers', function(req, res) {
  utils.paramQuery('SELECT * FROM users WHERE userName LIKE ?', `%${req.body.search}%`)
  .then((results) => {
    const dataWithSelfRemoved = results.filter((el) => {
      return el.userName !== req.user.displayName
    });
    res.send(dataWithSelfRemoved);
  })
  .catch((err) => {
    console.log(err);
  })
});

// Project creation
app.post('/createproject', function(req, res) {
  const timeStamp = new Date().toString();
  const values = {
    createTime: timeStamp,
    name: req.body.name,
    description: req.body.desc || null,
    deadline: req.body.deadline || null,
  };
  utils.paramQuery('INSERT INTO projects SET ?', values)
  .then((results) => {
    const owners = [];
    owners.push([results.insertId, req.user.id, req.user.displayName]);
    const collabRows = req.body.collab.map((el) => {
      return [
        results.insertId,
        el.id,
        el.name
      ]
    });
    owners.push(...collabRows)
    utils.paramQuery('INSERT INTO projectsUsers VALUES ?', [owners]);

    const progressRows = req.body.progress.map((el) => {
      return [
        results.insertId,
        req.user.displayName,
        'Prior',
        el
      ]
    });
    utils.paramQuery('INSERT INTO updates (fkProjectId, fkUserName, timeStamp, content) VALUES ?', [progressRows]);

    res.send({ redirect: `/project/${results.insertId}` });
  })
  .catch((err) => {
    console.log(err);
  });
});

// Project deletion
app.post('/deleteproject', function(req, res) {
  Promise.all([
    utils.paramQuery('DELETE FROM projects WHERE projectId = ?', req.body.projectId),
    utils.paramQuery('DELETE FROM updates WHERE fkProjectId = ?', req.body.projectId),
    utils.paramQuery('DELETE FROM projectComments WHERE fkProjectId = ?', req.body.projectId),
    utils.paramQuery('DELETE FROM projectsUsers WHERE fkProjectId = ?', req.body.projectId),
  ])
  .then((results) => {
    console.log('Successful project deletion');
    res.send('success');
  })
  .catch((err) => {
    console.log(err);
    res.send('error');
  })
});

// Update deletion
app.post('/deleteupdate', function(req, res) {
  utils.paramQuery('DELETE FROM updates WHERE updateId = ?', req.body.updateId)
  .then((results) => {
    console.log('Successful update deletion');
    res.send('success');
  })
  .catch((err) => {
    console.log(err);
    res.send('error');
  })
});

// Project name change
app.post('/changename', function(req, res) {
  utils.paramQuery('UPDATE projects SET name = ? WHERE projectId = ?', [req.body.newName, req.body.projectId])
  .then((results) => {
    console.log('Successful name change');
    res.send('success');
  })
  .catch((err) => {
    console.log(err);
    res.send('error');
  })
});

// Project name change
app.post('/changeowner', function(req, res) {
  utils.paramQuery('DELETE FROM projectsUsers WHERE fkProjectId = ?', req.body.projectId)
  .then((temp) => {
    const owners = [];
    owners.push([req.body.projectId, req.user.id, req.user.displayName]);
    const collabRows = req.body.collab.map((el) => {
      return [
        req.body.projectId,
        el.id,
        el.name
      ]
    });
    owners.push(...collabRows);
    utils.paramQuery('INSERT INTO projectsUsers (fkProjectId, fkUserId, fkUserName) VALUES ?', [owners])
    .then((results) => {
      console.log('Successful owner change');
      res.send('success');
    })
    .catch((err) => {
      console.log(err);
      res.send('error');
    })
  })
  .catch((err) => {
    console.log(err);
  });
});

// Project description change
app.post('/changedesc', function(req, res) {
  utils.paramQuery('UPDATE projects SET description = ? WHERE projectId = ?', [req.body.newDesc, req.body.projectId])
  .then((results) => {
    console.log('Successful deadline change');
    res.send('success');
  })
  .catch((err) => {
    console.log(err);
    res.send('error');
  })
});

// Project deadline change
app.post('/changedeadline', function(req, res) {
  utils.paramQuery('UPDATE projects SET deadline = ? WHERE projectId = ?', [req.body.newDeadline, req.body.projectId])
  .then((results) => {
    console.log('Successful description change');
    res.send('success');
  })
  .catch((err) => {
    console.log(err);
    res.send('error');
  })
});

// Project update posting
app.post('/postupdate', function(req, res) {
  const timeStamp = new Date().toLocaleString('en-US');
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


// Project comment posting
app.post('/postprojectcomment', function(req, res) {
  // const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const timeStamp = new Date().toLocaleString('en-US');
  const values = {
    fkProjectId: req.body.projectId,
    fkUserName: req.user.displayName,
    fkUserId: req.user.id,
    timeStamp,
    comment: req.body.projectComment,
  }
  utils.paramQuery('INSERT INTO projectComments SET ?', values)
  .then((results) => {
    res.send('success');
  })
  .catch((err) => {
    console.log(err);
  });
});

app.listen(3000, () => console.log('Test app listening on port 3000!'));
