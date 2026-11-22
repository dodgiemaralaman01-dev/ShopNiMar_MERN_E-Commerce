import './Navbar.css'
import navlogo from '../../assets/nav-logo.svg'
import navProfile from '../../assets/nav-profile.svg'

const Navbar = ({ onLogout }) => {
  return (
    <div className='navbar'>
        <img src={navlogo} alt="" className="nav-logo" />
        <div className="navbar-actions">
            <img src={navProfile} className='nav-profile' alt="" />
            <button type="button" className="navbar-logout" onClick={onLogout}>Log out</button>
        </div>
    </div>
  )
}

export default Navbar