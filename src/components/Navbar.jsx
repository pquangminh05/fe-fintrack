import { NavLink, useNavigate } from 'react-router-dom';

function Navbar() {
    const username = localStorage.getItem("username");
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear(); // Xóa token và username
        navigate("/login");   // Chuyển về trang đăng nhập
    };


    return (
        <nav className="navbar">
            <div className="container">
                <NavLink to="/dashboard" className="logo">⚡ FinTrack</NavLink>
                <div className="nav-links">
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
                    <NavLink to="/thu-chi" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Thu & Chi</NavLink>
                    <NavLink to="/mua-sam" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Mua sắm</NavLink>
                    <NavLink to="/dau-tu" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Đầu tư</NavLink>
                    <NavLink to="/bao-cao" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Báo cáo</NavLink>
                    <NavLink to="/nhac-nho" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Nhắc nhở</NavLink>

                    {username ? (
                        <>
                            <span className="nav-link">👤 {username}</span>
                            <button onClick={handleLogout} className="nav-link">Đăng xuất</button>
                        </>
                    ) : (
                        <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Đăng nhập</NavLink>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
