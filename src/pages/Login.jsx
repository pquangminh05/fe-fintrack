import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;

        try {
            const response =  await axios.post("http://localhost:5000/api/auth/login", {
                                     username: username,
                                     password: password
             });
            localStorage.setItem("username", response.data.username);

            alert(response.data);
            navigate('/dashboard');
        } catch (error) {
            alert('Đăng nhập thất bại');
        }
    };



    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h1 className="auth-title">Đăng nhập</h1>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label>Tên đăng nhâp</label>
                    <input type = "text" name="username" required />

                    <label>Mật khẩu</label>
                    <input type="password" name="password" required />

                    <button type="submit">Đăng nhập</button>
                </form>

                <p className="auth-footer">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-blue">
                        Đăng ký
                    </Link>
                </p>

                <Link to="/dashboard" className="back-link">← Trở lại trang chủ</Link>
            </div>
        </div>
    );
}

export default Login;

