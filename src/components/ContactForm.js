import React from 'react'

import '../main.css'

const ContactForm = ({contact, handleChange, onSubmit, onCancel}) => (
  <form className='contact-form' onSubmit={onSubmit}>
    <p>
      <label htmlFor='contact-name'>Name</label>
      <input
        type='text'
        name='contact-name'
        value={contact.name}
        onChange={handleChange.bind(this, 'name')}
        required />
    </p>

    <p>
      <label htmlFor='contact-email'>Email</label>
      <input
        type='email'
        name='contact-email'
        value={contact.email}
        onChange={handleChange.bind(this, 'email')} />
    </p>

    <p>
      <label htmlFor='contact-phone'>Phone</label>
      <input
        type='text'
        name='contact-phone'
        value={contact.phone}
        onChange={handleChange.bind(this, 'phone')} />
    </p>

    <div className='footer action-btns'>
      <button type='button' onClick={onCancel}>Cancel</button>
      <button type='submit'>Save</button>
    </div>
  </form>
)

export default ContactForm
