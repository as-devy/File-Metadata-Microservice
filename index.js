var express = require('express');
var cors = require('cors');
require('dotenv').config();
const bodyParser = require("body-parser")
const multer = require('multer');
const { Client } = require('pg');

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/api/fileanalyse", upload.single('upfile'), async (req, res) => {
  const file = req.file;

  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const fileData = req.file.buffer;
  const fileName = req.file.originalname;

  try {
    const query = 'INSERT INTO files (name, file) VALUES ($1, $2)';
    const values = [fileName, fileData];

    const dbres = await client.query(query, values);

    res.json({
      name: fileName,
      type: file.mimetype,
      size: file.size
    })
  } catch (error) {
    console.error('Error inserting file into the database:', err);
    res.status(500).send('Error inserting file into the database.');
  }
})


const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
