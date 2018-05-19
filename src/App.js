import React, { Component } from 'react'
import './main.css'

const API = 'http://127.0.0.1:1312'


class App extends Component {
  state = {
    contact: null
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

  render () {
    console.log(this.state)
    return (
      <div className='app'>
        <header className='app-header'>
          <h1 className='app-title'>Hello cat</h1>
        </header>
        <p>{this.state.contact}</p>
      </div>
    )
  }
}

export default App
