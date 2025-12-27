import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import MyBooks from './MyBooks';
import BookSearch from './BookSearch';
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <div className="home-content">
              <h1>Welcome to Library Books</h1>
              <BookSearch />
            </div>
          } />
          <Route path="/my-books" element={<MyBooks />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
