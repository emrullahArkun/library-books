import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">📚 Library Books</Link>
            </div>
            <div className="navbar-menu">
                <Link to="/" className="navbar-item">Home</Link>
                <Link to="/my-books" className="navbar-item">My Books</Link>
            </div>
        </nav>
    );
}

export default Navbar;
