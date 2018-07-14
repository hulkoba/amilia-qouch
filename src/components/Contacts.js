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
      modalView: {
        hasConflict: false,
        contactMe: '',
        contactYou: ''
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

  componentWillUnmount () {
    localDB.sync().cancel()
  }

  componentDidMount () {
    this.getPouchDocs()
    localDB.sync(remoteDB, {
      live: true,
      since: 'now',
      include_docs: true,
      retry: true
    }).on('change', change => {
      console.log(change, 'changed!')
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
    console.log('### get pouch docs')
    try {
      const completeContacts = await localDB.allDocs({
        include_docs: true,
        conflicts: true // include conflict information in the _conflicts field of a doc.
      })
      const contacts = completeContacts.rows.map(c => c.doc)

      // check if there are conflict revisions
      const conflictedContact = contacts.find(contact => contact._conflicts)
      console.log('### conflictedContact', conflictedContact)
      if (conflictedContact) {
        this.getConflictRevisions({conflictedContact})
      } else {
        console.log('getting ' + contacts.length + ' contacts from PouchDB.')

        this.setState((prevState) => {
          if (prevState.contacts !== contacts) {
            return { contacts }
          }
        })
      }
    } catch (err) {
      if (err.message === 'Document update conflict') {
        // show Modal
        this.getConflictRevisions({contactID: err.docId})
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
        this.getConflictRevisions({contactID: err.docId})
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
        this.getConflictRevisions({contactID: err.docId})
      }
      console.log(err)
    }
  }

  async deletePouchDoc (contact) {
    try {
      localDB.remove(contact)
    } catch (err) {
      if (err.message === 'Document update conflict') {
        this.getConflictRevisions({contactID: err.docId})
      }
    } finally {
      this.getPouchDocs()
    }
    // const doc = await localDB.get(contact._id)
    // doc._deleted = true
    // await localDB.put(doc)
    // console.log(contact.name + ' gets deleted')
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

  async getConflictRevisions ({contactID, conflictedContact}) {
    // contactMe = contact
    console.log('### get conflict revisions ', contactID)
    let contactMe = ''
    if (conflictedContact) {
      contactMe = conflictedContact
    } else {
      contactMe = await localDB.get(contactID, {
        conflicts: true // include conflict information in the _conflicts field of a doc.
      })
    }
    console.log('### contactMe', contactMe)
    // To fetch the losing revision, you simply get() it using the rev option
    // localDB.get(contact.id, {rev: '2-y'}).then(function (doc) {
    const contactYou = await localDB.get(contactMe._id, {rev: contactMe._conflicts[0]})
    console.log('### contactYou', contactYou)

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

  chooseRev (contact) {
    // remove the losing revision
    localDB.remove(contact._id, contact._rev).then(function (doc) {
      // yay, we're done
    }).catch(function (err) {
      console.log(err)
      // handle any errors
    })
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
        {modalView.hasConflict
          ? <Modal
            contactMe={modalView.contactMe}
            contactYou={modalView.contactYou}
            chooseRev={this.chooseRev.bind(this)} />
          : <Header
            isOpen={editView.isOpen}
            handleGoToEdit={this.toggleEdit.bind(this, null)} />
        }
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
