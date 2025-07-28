import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

function InvestmentPage() {
    const [investments, setInvestments] = useState([]);
    const [form, setForm] = useState({
        assetType: '',
        assetName: '',
        quantity: '',
        purchasePrice: '',
        currentPrice: '',
        purchaseDate: ''
    });

    const userId = localStorage.getItem('userId');

    // Load dữ liệu từ backend
    const fetchInvestments = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/investments?userId=${userId}`);
            setInvestments(res.data);
        } catch (err) {
            console.error('Lỗi load investments:', err);
        }
    };

    useEffect(() => {
        fetchInvestments();
    }, []);

    // Xử lý thay đổi input
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Thêm mới đầu tư
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...form, user: { id: userId } };
            await axios.post('http://localhost:5000/api/investments', data);
            setForm({
                assetType: '',
                assetName: '',
                quantity: '',
                purchasePrice: '',
                currentPrice: '',
                purchaseDate: ''
            });
            fetchInvestments(); // cập nhật lại danh sách
        } catch (err) {
            console.error('Lỗi khi thêm:', err);
        }
    };

    // Xoá
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/investments/${id}`);
            fetchInvestments(); // cập nhật lại danh sách
        } catch (err) {
            console.error('Lỗi xoá:', err);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container mt-4">
                <h2>Quản lý Đầu tư</h2>

                <form onSubmit={handleSubmit} className="row g-3 mb-4">
                    <div className="col-md-3">
                        <input type="text" name="assetType" className="form-control" placeholder="Loại tài sản" value={form.assetType} onChange={handleChange} required />
                    </div>
                    <div className="col-md-3">
                        <input type="text" name="assetName" className="form-control" placeholder="Tên tài sản" value={form.assetName} onChange={handleChange} required />
                    </div>
                    <div className="col-md-2">
                        <input type="number" name="quantity" className="form-control" placeholder="Số lượng" value={form.quantity} onChange={handleChange} required />
                    </div>
                    <div className="col-md-2">
                        <input type="number" name="purchasePrice" className="form-control" placeholder="Giá mua" value={form.purchasePrice} onChange={handleChange} required />
                    </div>
                    <div className="col-md-2">
                        <input type="number" name="currentPrice" className="form-control" placeholder="Giá hiện tại" value={form.currentPrice} onChange={handleChange} required />
                    </div>
                    <div className="col-md-3">
                        <input type="date" name="purchaseDate" className="form-control" value={form.purchaseDate} onChange={handleChange} required />
                    </div>
                    <div className="col-md-2">
                        <button type="submit" className="btn btn-primary">Thêm</button>
                    </div>
                </form>

                <table className="table table-bordered">
                    <thead>
                    <tr>
                        <th>Loại</th>
                        <th>Tên</th>
                        <th>Số lượng</th>
                        <th>Giá mua</th>
                        <th>Giá hiện tại</th>
                        <th>Lãi/Lỗ</th>
                        <th>Ngày mua</th>
                        <th>Hành động</th>
                    </tr>
                    </thead>
                    <tbody>
                    {investments.map((item) => (
                        <tr key={item.id}>
                            <td>{item.assetType}</td>
                            <td>{item.assetName}</td>
                            <td>{item.quantity}</td>
                            <td>{item.purchasePrice}</td>
                            <td>{item.currentPrice}</td>
                            <td>{((item.currentPrice - item.purchasePrice) * item.quantity).toFixed(2)}</td>
                            <td>{item.purchaseDate}</td>
                            <td>
                                <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm">Xoá</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default InvestmentPage;
