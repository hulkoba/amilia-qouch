import React from 'react'

import '../main.css'

const Modal = ({contactMe, contactYou, chooseRev}) => (
  <div className='modal'>
    <h1 className='modal-title'>
      Es gibt einen Konflikt bei Kontakt {contactMe.name}<br />
      Welche Version möchtest du behalten?
    </h1>

    <div className='rev-a'>
      <p>Eingehende Änderung</p>
      <button
        className='rev-btn blue'
        onClick={chooseRev.bind(this, contactMe)}>
        <p>Kontakt: {JSON.stringify(contactYou)}</p>
      </button>
    </div>

    <div className='rev-b'>
      <p>Deine Änderung</p>
      <button
        className='rev-btn lila'
        onClick={chooseRev.bind(this, contactYou)}>
        <p>Kontakt: {JSON.stringify(contactMe)}</p>
      </button>
    </div>
  </div>
)

export default Modal
