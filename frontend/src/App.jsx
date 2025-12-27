import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [books, setBooks] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/books')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok')
        return res.json()
      })
      .then(data => setBooks(data))
      .catch(err => setError(err.message))
  }, [])

  return (
    <div className="container">
      <h1>Library Books</h1>
      {error && <p className="error">Error: {error}</p>}
      <div className="book-grid">
        {books.map(book => (
          <div key={book.id} className="book-card">
            <h3>{book.title}</h3>
            <p className="isbn">ISBN: {book.isbn}</p>
          </div>
        ))}
        {books.length === 0 && !error && <p>No books found. Add some via API!</p>}
      </div>
    </div>
  )
}

export default App
