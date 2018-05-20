const express = require('express')
const PouchDB = require('pouchdb')
const bodyParser = require('body-parser')
const path = require('path')

const db = PouchDB('db')
const app = express()

// TODO need to configute the path
app.use(express.static(path.join(__dirname, 'client', 'public')))
app.use(bodyParser.json())

// get all contacts
app.get('/', function (req, res) {
  res.send('Welcome to my contacts API')
})

// Query the database to return all the contacts stored in the database.
app.get('/contacts', function (req, res) {
  const allContacts = function (doc) {
    if (doc.type === 'contact') {
      emit(doc._id, null)
    }
  }

  db.query(allContacts, { include_docs: true }, function (err, data) {
    if (err) {
      console.log(err)
      res.status(500).send({ msg: err })
    }

    var result = {
      rows: []
    }
    data.rows.forEach(function (row) {
      result.rows.push(row.doc)
    })
    res.json(result.rows)
  })
})

// create a contact
app.post('/contacts', function (req, res) {
  let contact = req.body
  if (!contact) {
    res.status(400).send({ msg: 'contact malformed.' })
  }

  const id = contact.id
  db.get(id, function (err, doc) {
    if (err && !(err.status === 404)) res.status(500).send({ msg: err })
    if (doc !== undefined) res.status(400).send({msg: 'contact already exists.'})

    contact.type = 'contact'
    contact._id = id

    db.put(contact, function (err, contact) {
      if (err) res.status(500).send({ msg: err })

      console.log('successfully posted to pouch')
      res.send(contact)
    })
  })
})

// update a contact
app.put('/contacts/:id', function (req, res) {
  console.log('### update contact ', req.params.id)
  let contact = req.body
  if (!contact) {
    res.status(400).send({ msg: 'contact malformed.' })
  }

  const id = contact.id
  db.get(id, function (err, doc) {
    if (err && !(err.status === 404)) res.status(500).send({ msg: err })

    db.put(contact, function (err, contact) {
      if (err) res.status(500).send({ msg: err })

      console.log('successfully posted to pouch')
      res.send(contact)
    })
  })
})

// delete a contact
app.delete('/contacts/:id', function (req, res) {
  const id = req.params.id

  db.get(id, function (err, doc) {
    if (err) res.status(500).send({ msg: err })
    if (doc === null) res.status(404).send({ msg: 'Contact does not exist.' })

    // remove contact from pouch
    db.remove(doc, function (err) {
      if (err) res.status(500).send({ msg: err })

      console.log('successfully removed to pouch')
      res.sendStatus(204)
    })
  })
})

const port = process.env.PORT || 1312
const server = app.listen(port, 'localhost', () => {
  const { address, port } = server.address()
  console.log(`Listening at http://${address}:${port}`)
})
