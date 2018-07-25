import React, {Component} from 'react'

import ContactForm from './ContactForm'

class FormContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      contact: props.contact
    }

    this.handleCancel = this.props.handleCancel.bind(this)
    this.handleChange = this.handleChange.bind(this)
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
    event.preventDefault()
    this.props.addOrEditContact(this.state.contact)
  }

  render () {
    const {contact} = this.state

    return (
      <ContactForm
        handleChange={this.handleChange}
        onCancel={this.handleCancel}
        onSubmit={this.handleSubmit}
        contact={contact} />
    )
  }
}

export default FormContainer
