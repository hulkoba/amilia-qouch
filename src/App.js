import React, { Component } from 'react'
import { Offline, Online } from 'react-detect-offline'
import PouchDB from 'pouchdb'

import ContactList from './components/ContactList'
import ContactForm from './components/ContactForm'
import './main.css'

const localDB = new PouchDB('contacts')
// const remoteDB = new PouchDB('https://admin:d<3j@localhost:15984/contacts')
const remoteDB = new PouchDB('https://admin:d<3j@127.0.0.1:15984/contacts')
// const remoteDB = new PouchDB('https://127.0.0.1:15984/contacts')

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      editView: false,
      contact: '',
      contacts: []
    }

    localDB.info().then(function (info) {
      console.log('### localDB info', info)
    })
    remoteDB.info().then(function (info) {
      console.log('### remoteDB info', info)
    })
  }

  componentDidMount () {
    this.getPouchDocs()

    var url = 'https://admin:d<3j@127.0.0.1:5984/contact'
    var opts = { live: true, retry: true }

    // do one way, one-off sync from the server until completion
    localDB.replicate.from(url).on('complete', function (info) {
      console.log('### info in replication ', info)
      // then two-way, continuous, retriable sync
      localDB.sync(url, opts)
        .on('change', change => {
          console.log('### something changed!')
          this.getPouchDocs()
        })
        .on('paused', info => console.log('replication paused.'))
        .on('error', err => console.log('Sync error', err))
    }).on('error', err => console.log('Replication error', err))
    // localDB.sync(remoteDB, {
    //   live: true,
    //   since: 'now',
    //   // retry: true
    // }).on('change', change => {
    //     console.log('something changed!')
    //     this.getPouchDocs()
    //   })
    //   .on('paused', info => console.log('replication paused.'))
    //   .on('complete', info => console.log('yay, we are in sync!'))
    //   .on('active', info => console.log('replication resumed.'))
    //   .on('denied', info => console.log('+++ ERROR ERROR ERROR +++ DENIED'))
    //   .on('error', err => console.log('uh oh! an error occured.', err))

    console.log('### remoteDB', remoteDB)
  }

  // --------------------   Pouch section  ---------------------------
  getPouchDocs () {
    localDB.allDocs({
      include_docs: true
    }).then(response => {
      const contacts = response.rows.map(c => c.doc)
      console.log('getting updated ' + contacts.length + ' contacts from PouchDB.')
      this.setState(() => ({contacts: contacts}))
    })
  }

  addPouchDoc (contact) {
    const c = {
      id: new Date().toISOString(),
      type: 'contact',
      ...contact
    }
    localDB.post(c).then(response => {
      console.log(c.name + ' added to PouchDB.')
      this.getPouchDocs()
    }).catch(err => {
      console.log(err)
    })
  }

  editPouchDoc (contact) {
    localDB.get(contact._id).then(function (doc) {
      doc = {...contact}
      // doc = Object.assign(contact, doc)
      // put them back
      return localDB.put(doc)
    }).then(res => {
      // fetch contacts again
      this.getPouchDocs()
    }).catch(err => {
      console.log(err)
    })
  }

  delPouchDoc (contact) {
    // localDB.remove(contact)
    localDB.get(contact._id).then(doc => {
      console.log('### doc', doc)
      doc._deleted = true
      return localDB.remove(doc)
    }).then(result => {
      console.log(contact.name + ' gets deleted')
      this.getPouchDocs()
    }).catch(err => console.log(err))
  }
  // --------------------   Pouch section end  -------------------------

  // add or edit contact
  addContact (contact) {
    console.log('### add or edit contact', contact)

    if (!contact.id) {
      this.addPouchDoc(contact)
    } else {
      this.editPouchDoc(contact)
    }

    this.setState(() => ({editView: false}))
  }

  goToEdit (contact) {
    this.setState(() => {
      return {
        editView: true,
        contact: contact.id ? contact : {name: '', email: '', phone: ''}
      }
    })
  }

  deleteContact (contact) {
    console.log('### delete contact', contact)

    this.delPouchDoc(contact)
  }

  render () {
    return (
      <div className='app'>
        <header className='app-header'>
          <h1 className='app-title'>
            <Online>
              <div>Hello cat, <span className='green'>you're online</span></div>
            </Online>
            <Offline>
              <div>Hello cat, <span className='red'>you're offline</span></div>
            </Offline>
          </h1>
          {!this.state.editView &&
          <button
            className='add-btn'
            onClick={this.goToEdit.bind(this)}>Add a cat
          </button>}
        </header>
        {this.state.editView
          ? <ContactForm
            addOrEditContact={this.addContact.bind(this)}
            handleCancel={() => { this.setState(() => ({editView: false})) }}
            contact={this.state.contact} />
          : <ContactList
            contacts={this.state.contacts}
            handleOnEditClick={this.goToEdit.bind(this)}
            handleOnDeleteClick={this.deleteContact.bind(this)}
          />
        }
      </div>
    )
  }
}

export default App
