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
      contacts: [{
        name: 'Amilia Pond',
        id: 11,
        email: 'amilia@pond.com',
        phone: '34567899876'
      }, {
          name: 'Doctor Who',
          id: 22,
          email: 'doctor@who.com',
          phone: '34567899876'
        }]
    }
  }

  componentDidMount () {
    this.fetchContacts()
    .then(res => this.setState({ contact: res.gif }))
    .catch(err => console.log(err))
  }

  fetchContacts = async () => {
    try {
      const response = await fetch(`${API}/gif`)
      const body = await response.json()

      return body

    } catch (error) {
      console.log(error)
    }
  }

  addContact(contact) {
    console.log('### contact', contact)
    // const contact = { name: val, id: window.id++ }

    // this.state.contacts.push(contact)
    // this.setState(() => { contacts: this.state.contacts })
    this.setState(() => {
      return {
        contact: contact,
        editView: false
      }
    })
  }

  // handleRemove(id) {
  //   // Filter all contacts except the one to be removed
  //   const remainder = this.state.contacts.filter((contact) => {
  //     if (contact.id !== id) return contact;
  //   });

  //   this.setState(() => { contacts: remainder });
  // }
  goToEdit (contact) {
    console.log('### edit contact', contact)
    this.setState(() => {
      return {
        editView: true,
        contact: contact.id ? contact : {name:'', email: '', phone: ''}
      }
    })
  }
  deleteContact (contactID) {
    console.log('### delete contact', contactID)
  }

  render () {
    console.log(this.state)
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
