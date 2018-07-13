import React, { Component } from 'react'
import PouchDB from 'pouchdb'

import Header from './Header'
import Modal from './Modal'
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
      since: 'now',
      include_docs: true
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
    try {
      const completeContacts = await localDB.allDocs({
        include_docs: true,
        conflicts: true // include conflict information in the _conflicts field of a doc.
      })
      const contacts = completeContacts.rows.map(c => c.doc)
      console.log('getting ' + contacts.length + ' contacts from PouchDB.')

      this.setState((prevState) => {
        if (prevState.contacts !== contacts) {
          return { contacts }
        }
      })
    } catch (err) {
      if (err.message === 'Document update conflict') {
        // TODO: show Modal
      }
      console.log(err)
    }
  }

  async addPouchDoc (contact) {
    const c = {
      ...contact,
      _id: new Date().toISOString()
    }
    try {
      await localDB.put({
        ...contact,
        _id: new Date().toISOString()
      })
      console.log(c.name + ' added to PouchDB.')
      this.getPouchDocs()
    } catch (err) {
      if (err.message === 'Document update conflict') {
        // TODO: show Modal
      }
      console.log(err)
    }
  }

  async editPouchDoc (contact) {
    try {
      let doc = await localDB.get(contact._id, {
        conflicts: true // include conflict information in the _conflicts field of a doc.
      })
      doc = {...contact}
      await localDB.put(doc)
      console.log(doc.name + ' edited in PouchDB.')
      this.getPouchDocs()
    } catch (err) {
      if (err.message === 'Document update conflict') {
        // TODO: show Modal
      }
      console.log(err)
    }
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
    if (!contact._id) {
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

  chooseRevA (contact) {
    console.log('### choose rev a ', contact)
  }
  chooseRevB (contact) {
    console.log('### choose rev b ', contact)
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

        <Modal
          contact={{ name: 'test', email: 'zuzu', phone: '1234' }}
          chooseRevA={this.chooseRevA}
          chooseRevB={this.chooseRevB} />

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
