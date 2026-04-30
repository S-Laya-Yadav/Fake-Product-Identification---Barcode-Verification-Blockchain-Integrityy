import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('userInfo'));

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <nav>
            <Link to="/" className="logo">BlockVerify</Link>
            <div className="nav-links">
                <Link to="/">Home</Link>
                {user ? (
                    <>
                        {user.role === 'admin' && <Link to="/admin">Dashboard</Link>}
                        <button onClick={logoutHandler} className="btn btn-danger" style={{ padding: '6px 16px', fontSize: '0.9rem' }}>Logout</button>
                    </>
                ) : (
                    <Link to="/login" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.9rem' }}>Sign In</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
