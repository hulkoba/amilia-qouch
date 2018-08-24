import React from 'react'

import '../main.css'

const Modal = ({contactMe, contactYou, removeRev}) => (
  <div className='modal'>
    <h1 className='modal-title'>
      Es gibt einen Konflikt bei Kontakt <span className='red'>{contactMe.name}</span><br />
      Welche Version möchtest du behalten?
    </h1>

    <div className='rev-a'>
      <p>Eingehende Änderung</p>
      <button
        className='rev-btn blue'
        onClick={removeRev.bind(this, contactMe)}>
        <p>Kontakt: {JSON.stringify({name: contactYou.name, email: contactYou.email, phone: contactYou.phone, id: contactYou._id})}</p>
      </button>
    </div>

    <div className='rev-b'>
      <p>Aktuelle Änderung</p>
      <button
        className='rev-btn lila'
        onClick={removeRev.bind(this, contactYou)}>
        <p>Kontakt: {JSON.stringify({name: contactMe.name, email: contactMe.email, phone: contactMe.phone, id: contactMe._id})}</p>
      </button>
    </div>
  </div>
)

export default Modal
