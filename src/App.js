import React, { Component } from 'react'
import { Offline, Online } from 'react-detect-offline'
import PouchDB from 'pouchdb'

import ContactList from './components/ContactList'
import ContactForm from './components/ContactForm'
import './main.css'

const localDB = new PouchDB('contacts')
const remoteDB = new PouchDB('http://localhost:15984/contacts')

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      editView: false,
      contact: '',
      contacts: []
    }

    localDB.info().then(function (info) {
      console.log('localDB ', info)
    })
    remoteDB.info().then(function (info) {
      console.log(info)
    })
  }

  componentDidMount () {
    this.getPouchDocs()
    localDB.sync(remoteDB, {
      live: true,
      since: 'now'
      // retry: true
    }).on('change', change => {
      console.log('something changed!')
      this.getPouchDocs()
    })
      .on('paused', info => console.log('replication paused.'))
      .on('complete', info => console.log('yay, we are in sync!'))
      .on('active', info => console.log('replication resumed.'))
      .on('denied', info => console.log('+++ ERROR ERROR ERROR +++ DENIED'))
      .on('error', err => console.log('uh oh! an error occured.', err))

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
      ...contact,
      id: new Date().toISOString(),
      type: 'contact'
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
