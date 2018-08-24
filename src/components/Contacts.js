import React from 'react'

import ContactList from './ContactList'
import FormContainer from './FormContainer'

const Contacts = ({isOpen, toggleEdit, addContact, editContact, deleteContact, contact, contacts}) => (
  isOpen
    ? <FormContainer
      addContact={addContact}
      editContact={editContact}
      handleCancel={toggleEdit.bind(this, null)}
      contact={contact}
    />

    : <ContactList
      contacts={contacts}
      handleOnEditClick={toggleEdit}
      handleOnDeleteClick={deleteContact}
    />
)

export default Contacts
