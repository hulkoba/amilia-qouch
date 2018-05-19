import React from 'react'

import '../main.css'

const ContactList = ({contacts, handleOnEditClick, handleOnDeleteClick}) => (
  <ul className='contact-list'>
    {contacts.map(contact => (
      <li className='contact-list-li' key={contact.id}>
        <span>{contact.name}</span>
        <div className='action-btns'>
          <button onClick={handleOnEditClick.bind(this, contact)}>edit</button>
          <button onClick={handleOnDeleteClick.bind(this, contact.id)}>delete</button>
        </div>
      </li>
    ))}
  </ul>
)

export default ContactList
