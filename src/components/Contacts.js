import React, { Component } from 'react'
import PouchDB from 'pouchdb'

import Header from './Header'
import ContactList from './ContactList'
import ContactForm from './ContactForm'

const localDB = new PouchDB('contacts')
const remoteDB = new PouchDB('http://localhost:15984/contacts')
// const remoteDB = new PouchDB('https://admin:d<3j@127.0.0.1:15984/contacts')

class Contacts extends Component {
  constructor (props) {
    super(props)
    this.state = {
      editView: {
        isOpen: false,
        contact: ''
      },
      contacts: []
    }

    localDB.info().then(function (info) {
      console.log('localDB ', info)
    })
    remoteDB.info().then(function (info) {
      console.log('remoteDB ', info)
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

    this.toggleEdit = this.toggleEdit.bind(this)
    this.addContact = this.addContact.bind(this)
    this.deleteContact = this.deleteContact.bind(this)
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

    // go back to listView
    this.toggleEdit()
  }

  deleteContact (contact) {
    console.log('### delete contact', contact)
    this.delPouchDoc(contact)
  }

  toggleEdit (contact) {
    if (!contact) {
      contact = { name: '', email: '', phone: '' }
    }

    this.setState(prevState => {
      return {
        editView: {
          isOpen: !prevState.editView.isOpen,
          contact
        }
      }
    })
  }

  render () {
    const { contacts, editView } = this.state
    return (
      <div>
        <Header
          isOpen={editView.isOpen}
          handleGoToEdit={this.toggleEdit.bind(this, null)} />

        {editView.isOpen
          ? <ContactForm
            addOrEditContact={this.addContact}
            handleCancel={this.toggleEdit.bind(this, null)}
            contact={editView.contact} />

          : <ContactList
            contacts={contacts}
            handleOnEditClick={this.toggleEdit}
            handleOnDeleteClick={this.deleteContact}
          />
        }
      </div>
    )
  }
}

export default Contacts
