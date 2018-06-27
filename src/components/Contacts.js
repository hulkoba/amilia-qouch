import React, { Component } from 'react'
import PouchDB from 'pouchdb'

import Header from './Header'
import ContactList from './ContactList'
import ContactForm from './ContactForm'

const localDB = new PouchDB('contacts')
const remoteDB = new PouchDB('http://admin:admin@127.0.0.1:5984/contacts')

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
      .on('denied', info => console.log('+++ DENIED +++', info))
      .on('error', err => console.log('+++ ERROR ERROR ERROR +++.', err))

    this.toggleEdit = this.toggleEdit.bind(this)
    this.addContact = this.addContact.bind(this)
    this.deleteContact = this.deleteContact.bind(this)
  }

  // --------------------   Pouch section  ---------------------------
  async getPouchDocs () {
    const completeContacts = await localDB.allDocs({include_docs: true})
    const contacts = completeContacts.rows.map(c => c.doc)
    console.log('getting ' + contacts.length + ' contacts from PouchDB.')
    this.setState(() => ({
      contacts
    }))
  }

  async addPouchDoc (contact) {
    const c = {
      ...contact,
      id: new Date().toISOString(),
      type: 'contact'
    }
    await localDB.post(c)
    console.log(c.name + ' added to PouchDB.')
    this.getPouchDocs()
  }

  async editPouchDoc (contact) {
    let doc = localDB.get(contact._id)
    doc = {...contact}
    await localDB.put(doc)

    console.log(doc.name + ' edited in PouchDB.')
    this.getPouchDocs()
  }

  async deletePouchDoc (contact) {
    // localDB.remove(contact)
    const doc = await localDB.get(contact._id)
    doc._deleted = true
    await localDB.put(doc)
    console.log(contact.name + ' gets deleted')
    this.getPouchDocs()
  }
  // --------------------   Pouch section end  -------------------------

  // add or edit contact
  addContact (contact) {
    if (!contact.id) {
      console.log('### add contact', contact)
      this.addPouchDoc(contact)
    } else {
      console.log('### edit contact', contact)
      this.editPouchDoc(contact)
    }

    // go back to listView
    this.toggleEdit()
  }

  deleteContact (contact) {
    console.log('### delete contact', contact)
    this.deletePouchDoc(contact)
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
