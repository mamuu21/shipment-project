import React from 'react';
import logo from '../images/logo.jpg'; 


const Header = () => {
    const logout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
   };

    return (
        <nav className="navbar navbar-light" style={{ backgroundColor: '#ffffff', margin: 0, padding: 5,  border: '2px solid #fff'}}>
            <div className='container-fluid d-flex justify-content-end'>
                <a className='navbar-brand' href='/'>
                    <img 
                        src={logo} 
                        alt='logo'
                        style={{ height: '40px', width: '30px', borderRadius: '50%' }} 
                    />
                </a>
                <button className="btn btn-outline-secondary btn-sm" onClick={logout}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Header;
