import React from 'react'
import { Offline, Online } from 'react-detect-offline'

import '../main.css'

const Header = ({editView, handleGoToEdit}) => (
  <header className='app-header'>
    <h1 className='app-title'>
      <Online>
        <div>Hello cat, <span className='green'>you're online</span></div>
      </Online>
      <Offline>
        <div>Hello cat, <span className='red'>you're offline</span></div>
      </Offline>
    </h1>
    {!editView &&
      <button
        className='add-btn'
        onClick={handleGoToEdit.bind(this)}>Add a cat
      </button>}
  </header>
)

export default Header
