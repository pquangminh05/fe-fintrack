import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ThuChi from './pages/ThuChi';
import MuaSam from './pages/MuaSam';
import DauTu from './pages/DauTu';
import NhacNho from './pages/NhacNho';
import BaoCao from './pages/BaoCao';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/thu-chi" element={<ThuChi />} />
            <Route path="/mua-sam" element={<MuaSam />} />
            <Route path="/dau-tu" element={<DauTu />} />
            <Route path="/nhac-nho" element={<NhacNho />} />
            <Route path="/bao-cao" element={<BaoCao />} />
        </Routes>
    );
}

export default App;
