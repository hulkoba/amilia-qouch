import React, {Component} from 'react'

import '../main.css'

class ContactForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      contact: props.contact
    }

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange (type, event) {
    const val = event.target.value
    let contact = this.state.contact

    if (type === 'name') {
      contact = {...contact, name: val}
    }
    if (type === 'email') {
      contact = {...contact, email: val}
    }
    if (type === 'phone') {
      contact = {...contact, phone: val}
    }
    this.setState(() => ({contact: contact}))
  }

  handleSubmit (event) {
    console.log('A contact was submitted: ' + this.state.contact)
    event.preventDefault()
    this.props.addOrEditContact(this.state.contact)
  }

  render () {
    const {contact} = this.state

    return (
      <form className='contact-form' onSubmit={this.handleSubmit}>
        <p>
          <label htmlFor='contact-name'>Name</label>
          <input
            type='text'
            name='contact-name'
            value={contact.name}
            onChange={this.handleChange.bind(this, 'name')} />
        </p>

        <p>
          <label htmlFor='contact-email'>Email</label>
          <input
            type='text'
            name='contact-email'
            value={contact.email}
            onChange={this.handleChange.bind(this, 'email')} />
        </p>

        <p>
          <label htmlFor='contact-phone'>Phone</label>
          <input
            type='text'
            name='contact-phone'
            value={contact.phone}
            onChange={this.handleChange.bind(this, 'phone')} />
        </p>

        <button type='submit'>Save</button>
      </form>
    )
  }
}

export default ContactForm
