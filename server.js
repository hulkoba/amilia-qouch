const express = require('express')
const http = require('http')
const path = require('path')

// Initialize http server
const app = express()

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

// get all contacts
app.get('/gif', async (req, res) => {
  res.json({
    gif: await fetchGif()
  })
})

// create contact and send back all contacts after creation
app.post('/contacts', function (req, res) {

  // Todo.create({
  //   text: req.body.text,
  //   done: false
  // }, function (err, todo) {
  //   if (err)
  //     res.send(err)

  //   Todo.find(function (err, contacts) {
  //     if (err)
  //       res.send(err)
  //     res.json(contacts)
  //   })
  // })
})

// delete a contact
app.delete('/contacts/:contact_id', function (req, res) {
  // Todo.remove({
  //   _id: req.params.todo_id
  // }, function (err, todo) {
  //   if (err)
  //     res.send(err)

  //   // get and return all the contacts after you create another
  //   Todo.find(function (err, contacts) {
  //     if (err)
  //       res.send(err)
  //     res.json(contacts)
  //   })
  // })
})

const port = process.env.PORT || 1312
const server = app.listen(port, 'localhost', () => {
  const { address, port } = server.address()
  console.log(`Listening at http://${address}:${port}`)
})

// Fetch random GIF url with Giphy API, download and Base64 encode it
const fetchGif = async () => {
  console.log('fetch gif')
  // const url = await download('giphy.com/embed/oyBqefMw5zVTi')
  return 'giphy.com/embed/oyBqefMw5zVTi'
}

// File download helper
// function that downloads a file and returns a stream
const download = async (url) => {
  return new Promise((resolve, reject) => {
    let req = http.get(url.replace('https', 'http'))
    req.on('response', res => {
      resolve(res)
    })
    req.on('error', err => {
      reject(err)
    })
  })
}
