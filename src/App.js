import React, { Component } from 'react'
import { Offline, Online } from 'react-detect-offline'

import ContactList from './components/ContactList'
import ContactForm from './components/ContactForm'
import './main.css'

const API = 'http://127.0.0.1:1312'


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      editView: false,
      contact: '',
      contacts: []
    }
  }

  componentDidMount () {
    this.fetchContacts()
    .then(res => this.setState({ contacts: res }))
    .catch(err => console.log(err))
  }

  // --------------------   API section   ----------------------------
  fetchContacts = async () => {
    try {
      const response = await fetch(`${API}/contacts`)
      const body = await response.json()
      return body
    } catch (error) { console.log(error) }
  }

  postContact = async (contact) => {
    console.log('### post contact', contact)
    const body = JSON.stringify(contact)
    try {
      const result = await fetch(`${API}/contacts`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: body
      })
      const res = await result.json()
      console.log(res)
    } catch (error) { console.log(error) }
  }

  editContact = async (contact) => {
    console.log('### eid contact', contact)
    const body = JSON.stringify(contact)
    console.log('### body', body)
    try {
      const result = await fetch(`${API}/contacts/${contact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: body
      })
      const res = await result.json()
      console.log(res)
    } catch (error) { console.log(error) }
  }

  removeContact = async (id) => {
    console.log('### removeContact contact', id)
    try {
      await fetch(`${API}/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) { console.log(error) }
  }
  // --------------------   API section end  -------------------------

  // add or edit contact
  addContact (contact) {
    console.log('### add or edit contact', contact)
    let newContacts
    // add a new contact
    if(!contact.id) {
      contact.id = Date.now().toString()
      newContacts = this.state.contacts.concat(contact)

      this.postContact(contact)

      // find and replace contact
    } else {
      newContacts = this.state.contacts.map(c => {
        if (c.id === contact.id) return contact
        return c
      })
      this.editContact(contact)
    }

    this.setState(() => {
      return {
        contacts: newContacts,
        editView: false
      }
    })
  }

  goToEdit (contact) {
    console.log('### edit contact', contact)
    this.setState(() => {
      return {
        editView: true,
        contact: contact.id ? contact : {name:'', email: '', phone: ''}
      }
    })
  }

  deleteContact (id) {
    console.log('### delete contact', id)
    // Filter all contacts except the one to be removed
    const remainder = this.state.contacts.filter(contact => contact.id !== id)

    this.setState(() => ({ contacts: remainder }))
    // TODO: delete on Server
    this.removeContact(id)
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
        {this.state.editView ?
        <ContactForm
          addOrEditContact={this.addContact.bind(this)}
          contact={this.state.contact} />
        :
        <ContactList
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
