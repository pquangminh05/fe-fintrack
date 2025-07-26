import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        const confirmPassword = e.target.confirmPassword.value;

        if (password !== confirmPassword) {
            alert('Mật khẩu không khớp');
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/api/auth/register", {
                username: username,
                password: password
            });

            alert(response.data);
            navigate('/login');
        } catch (error) {
            alert('Đăng ký thất bại');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h1 className="auth-title">Đăng ký</h1>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label>Họ tên</label>
                    <input type="text" name="username" required />

                    <label>Email</label>
                    <input type="email" name="email" required />

                    <label>Mật khẩu</label>
                    <input type="password" name="password" required />

                    <label>Xác nhận mật khẩu</label>
                    <input type="password" name="confirmPassword" required />

                    <button type="submit">Đăng ký</button>
                </form>

                <p className="auth-footer">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-blue">
                        Đăng nhập
                    </Link>
                </p>

                <Link to="/dashboard" className="back-link">← Trở lại trang chủ</Link>
            </div>
        </div>
    );
}

export default Register;
