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
    .then(res => this.setState({ contacts: res.contacts }))
    .catch(err => console.log(err))
  }

  fetchContacts = async () => {
    try {
      const response = await fetch(`${API}/`)
      const body = await response.json()

      return body
    } catch (error) { console.log(error) }
  }

  // add or edit contact
  addContact(contact) {
    console.log('### add or edit contact', contact)
    let newContacts
    // add a new contact
    if(!contact.id) {
      contact.id = Date.now()
      newContacts = this.state.contacts.concat(contact)
    // find and replace contact
    } else {
      newContacts = this.state.contacts.map(c => {
        if (c.id === contact.id) return contact
        return c
      })
    }
    this.setState(() => {
      return {
        contacts: newContacts,
        editView: false
      }
    })
    // TODO send it to Server
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
