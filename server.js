require('dotenv').config();
const express = require('express');
const app = express();
const api = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const { authenticate } = require('./middleware');

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const port = process.env.PORT;
const secret = process.env.SECRET;


//Define middleware
app.use(express.static('build'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use((req, res, next) => {
    console.log(`${req.method} request received at ${req.url}`);
    next();
});


//Functions
async function getUsers() {
  const { rows } = await pool.query('SELECT users.name, users.handle FROM users ORDER BY id ASC');
  return rows;
};

async function getTweets() {
  const { rows } = await pool.query(`
  SELECT 
    tweets.id,
    tweets.message,
    tweets.created_at,
    users.name,
    users.handle
  FROM
    tweets
  INNER JOIN users ON
    tweets.user_id = users.id
  ORDER BY tweets.id DESC
  `);
  return rows;
};

async function getUserdataByHandle(handle) {
  const { rows } = await pool.query(`SELECT
  tweets.id,
  tweets.message,
  tweets.created_at,
  users.name,
  users.handle,
  users.description
FROM
  tweets
INNER JOIN users ON
  tweets.user_id = users.id
WHERE
  users.handle = $1
ORDER BY tweets.id DESC
`, [handle]);
  return rows;
};

function getUserByHandle(handle) {
  return pool.query(`
    SELECT * FROM users WHERE handle = $1
  `, [handle])
  .then(({ rows }) => rows[0]);
};

function createTweet(message, userId) {
  return pool.query(`
  INSERT INTO tweets
    (message, user_id)
  VALUES
    ($1, $2)
  RETURNING
    *
  `, [message, userId])
  .then(({ rows }) => rows[0]);
};


//Define routes
api.get('/tweets/:handle', async function (req, res) {
  const { handle } = req.params;
  const userData = await getUserdataByHandle(handle);
  res.send(userData);
});

api.get('/tweets', async function (req, res) {
  const tweets = await getTweets();
  res.send(tweets);
});

api.get('/users', async function (req, res) {
  const users = await getUsers();
  res.send(users);
})

api.get('/session', authenticate, function (req, res) {
  res.send({
    message: 'You are authenticated'
  });
});

api.post('/session', async function (req, res) {
  const { handle, password } = req.body;
  const user = await getUserByHandle(handle);

  if (!user) {
    return res.status(401).send({ error: 'Unknown user' });
  }

  if (user.password !== password) {
    return res.status(401).send({ error: 'Wrong password' });
  }

  const token = jwt.sign({
    id: user.id,
    handle: user.handle,
    name: user.name
  }, new Buffer(secret, 'base64'));

  res.send({
    token: token
  });
});

api.post('/tweets', authenticate, async function(req, res) {
  const { id } = req.user;
  const { message } = req.body;
  const newTweet = await createTweet(message, id);

  res.send(newTweet); 
});

app.use('/api', api);



//Listen to port
app.listen(port, () => {
    console.log('Twitter app is running on http://localhost:3002')
});