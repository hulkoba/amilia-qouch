import React, { Component } from 'react'
import PouchDB from 'pouchdb'

import Header from './Header'
import Modal from './Modal'
import Contacts from './Contacts'

PouchDB.plugin(require('pouchdb-upsert'))
const localDB = new PouchDB('contacts')
const remoteDB = new PouchDB('http://admin:admin@127.0.0.1:5984/contacts')

class ContactsContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      editView: {
        isOpen: false,
        contact: ''
      },
      modalView: {
        hasConflict: false,
        contactMe: '',
        contactYou: ''
      },
      contacts: [],
      lastEdited: {}
    }

    localDB.info().then(function (info) {
      console.log('localDB ', info)
    })
    remoteDB.info().then(function (info) {
      console.log('remoteDB ', info)
    })
  }

  componentWillUnmount () {
    localDB.sync().cancel()
  }

  componentDidMount () {
    localDB.sync(remoteDB, {
      live: true,
      include_docs: true,
      retry: true
    }).on('change', change => console.log(change, 'changed!'))
      .on('paused', info => console.log('replication paused.'))
      .on('active', info => console.log('replication resumed.'))
      .on('denied', info => console.log('+++ DENIED +++', info))
      .on('error', err => console.log('+++ ERROR ERROR ERROR +++.', err))

    this.getPouchDocs()

    this.toggleEdit = this.toggleEdit.bind(this)
    this.addContact = this.addContact.bind(this)
    this.editContact = this.editContact.bind(this)
    this.deleteContact = this.deleteContact.bind(this)
  }

  shouldComponentUpdate (nextProps, nextState) {
    if ((nextState.contacts === this.state.contacts) &&
      (nextState.editView.isOpen === this.state.editView.isOpen)) {
      return false
    }
    return true
  }

  // --------------------   Pouch section  ---------------------------
  async getPouchDocs () {
    console.log('### get pouch docs')
    try {
      const completeContacts = await localDB.allDocs({
        include_docs: true,
        conflicts: true // include conflict information in the _conflicts field of a doc.
      })
      const contacts = completeContacts.rows.map(c => c.doc)

      // check if there are conflict revisions
      const conflictedContact = contacts.find(contact => contact._conflicts)

      if (conflictedContact) {
        console.log('### conflictedContact', conflictedContact)
        this.getConflictRevisions(conflictedContact)
      } else {
        console.log('getting ' + contacts.length + ' contacts from PouchDB.')

        this.setState((prevState) => {
          if (prevState.contacts !== contacts) {
            return { contacts }
          }
        })
      }
    } catch (err) {
      console.log(err)
    }
  }

  async addPouchDoc (contact) {
    try {
      const id = new Date().toISOString()
      await localDB.upsert(id, function () { return contact })
      console.log(contact.name + ' added to PouchDB.')

      // update state
      this.getPouchDocs()
    } catch (err) {
      // error (not a 404 or 409)
      console.log(err)
    }
  }

  async editPouchDoc (contact) {
    try {
      await localDB.upsert(contact._id, function (doc) {
        console.log(doc.name + ' edited in PouchDB.')
        return {...contact}
      })

      // update state
      this.getPouchDocs()
    } catch (err) {
      console.log(err)
    }
  }

  async deletePouchDoc (contact) {
    try {
      await localDB.upsert(contact._id, function (doc) {
        console.log(doc.name + ' removed from PouchDB.')
        if (!doc._deleted) {
          doc._deleted = true
          return doc
        }

        return false // don't update the doc
      })

      // update state
      this.getPouchDocs()
    } catch (err) {
      console.log(err)
    }
  }
  // --------------------   Pouch section end  -------------------------

  addContact (contact) {
    console.log('### add contact', contact)
    this.addPouchDoc(contact)

    this.setState(() => ({lastEdited: contact}))
    // go back to listView
    this.toggleEdit()
  }

  editContact (contact) {
    console.log('### edit contact', contact)
    this.editPouchDoc(contact)

    this.setState(() => ({lastEdited: contact}))
    // go back to listView
    this.toggleEdit()
  }

  deleteContact (contact) {
    console.log('### delete contact', contact)
    this.deletePouchDoc(contact)
  }

  async getConflictRevisions (conflictedContact) {
    console.log('### get conflict revisions ', conflictedContact)

    let contactMe, contactYou
    if (conflictedContact.name === this.state.lastEdited.name &&
    conflictedContact.phone === this.state.lastEdited.phone &&
    conflictedContact.email === this.state.lastEdited.email) {
      contactMe = conflictedContact
      // To fetch the losing revision, simply get() it using the rev option
      contactYou = await localDB.get(conflictedContact._id, {
        rev: conflictedContact._conflicts[0]
      })
    } else {
      contactYou = conflictedContact
      contactMe = await localDB.get(conflictedContact._id, {
        rev: conflictedContact._conflicts[0]
      })
    }

    this.setState(() => {
      return {
        modalView: {
          hasConflict: true,
          contactMe,
          contactYou
        }
      }
    })
  }

  async removeRev (contact) {
    // remove the losing revision
    await localDB.remove(contact._id, contact._rev)

    this.setState(() => {
      return {
        modalView: {
          hasConflict: false
        }
      }
    })
    this.getPouchDocs()
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
    const { contacts, editView, modalView } = this.state
    return (
      <div>
        <Header
          isOpen={editView.isOpen}
          handleGoToEdit={this.toggleEdit.bind(this, null)} />
        <Contacts
          isOpen={editView.isOpen}
          toggleEdit={this.toggleEdit}
          addContact={this.addContact}
          editContact={this.editContact}
          deleteContact={this.deleteContact}
          contact={editView.contact}
          contacts={contacts}
        />

        {modalView.hasConflict &&
          <Modal
            contactMe={modalView.contactMe}
            contactYou={modalView.contactYou}
            removeRev={this.removeRev.bind(this)}
          />
        }
      </div>
    )
  }
}

export default ContactsContainer
