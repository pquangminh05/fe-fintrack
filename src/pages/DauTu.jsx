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

    // ✅ Thêm state để quản lý chế độ chỉnh sửa
    const [editingId, setEditingId] = useState(null);

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

    // ✅ Cập nhật hàm handleSubmit để hỗ trợ cả thêm mới và chỉnh sửa
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...form, user: { id: userId } };

            if (editingId) {
                // ✅ Chế độ chỉnh sửa
                await axios.put(`http://localhost:5000/api/investments/${editingId}`, data);
                alert('Cập nhật đầu tư thành công!');
                setEditingId(null);
            } else {
                // ✅ Chế độ thêm mới
                await axios.post('http://localhost:5000/api/investments', data);
                alert('Thêm đầu tư thành công!');
            }

            // Reset form và tải lại dữ liệu
            setForm({
                assetType: '',
                assetName: '',
                quantity: '',
                purchasePrice: '',
                currentPrice: '',
                purchaseDate: ''
            });
            fetchInvestments();
        } catch (err) {
            console.error('Lỗi khi lưu:', err);
            alert('Có lỗi xảy ra: ' + (err.response?.data?.message || err.message));
        }
    };

    // ✅ Thêm hàm xử lý chỉnh sửa
    const handleEdit = (investment) => {
        setForm({
            assetType: investment.assetType,
            assetName: investment.assetName,
            quantity: investment.quantity.toString(),
            purchasePrice: investment.purchasePrice.toString(),
            currentPrice: investment.currentPrice.toString(),
            purchaseDate: investment.purchaseDate
        });
        setEditingId(investment.id);
    };

    // ✅ Thêm hàm hủy chỉnh sửa
    const handleCancelEdit = () => {
        setForm({
            assetType: '',
            assetName: '',
            quantity: '',
            purchasePrice: '',
            currentPrice: '',
            purchaseDate: ''
        });
        setEditingId(null);
    };

    // Xoá
    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa khoản đầu tư này?')) return;

        try {
            await axios.delete(`http://localhost:5000/api/investments/${id}`);
            alert('Xóa thành công!');
            fetchInvestments();
        } catch (err) {
            console.error('Lỗi xoá:', err);
            alert('Lỗi khi xóa!');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container mt-4">
                <h2>Quản lý Đầu tư</h2>

                {/* ✅ Cập nhật form để hiển thị trạng thái chỉnh sửa */}
                <div className="card mb-4">
                    <div className="card-header">
                        <h5>{editingId ? '✏️ Chỉnh sửa đầu tư' : '➕ Thêm đầu tư mới'}</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit} className="row g-3">
                            <div className="col-md-3">
                                <input
                                    type="text"
                                    name="assetType"
                                    className="form-control"
                                    placeholder="Loại tài sản"
                                    value={form.assetType}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-md-3">
                                <input
                                    type="text"
                                    name="assetName"
                                    className="form-control"
                                    placeholder="Tên tài sản"
                                    value={form.assetName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-md-2">
                                <input
                                    type="number"
                                    name="quantity"
                                    className="form-control"
                                    placeholder="Số lượng"
                                    value={form.quantity}
                                    onChange={handleChange}
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="col-md-2">
                                <input
                                    type="number"
                                    name="purchasePrice"
                                    className="form-control"
                                    placeholder="Giá mua"
                                    value={form.purchasePrice}
                                    onChange={handleChange}
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="col-md-2">
                                <input
                                    type="number"
                                    name="currentPrice"
                                    className="form-control"
                                    placeholder="Giá hiện tại"
                                    value={form.currentPrice}
                                    onChange={handleChange}
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="col-md-3">
                                <input
                                    type="date"
                                    name="purchaseDate"
                                    className="form-control"
                                    value={form.purchaseDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="col-md-12">
                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary">
                                        {editingId ? '💾 Cập nhật' : '➕ Thêm'}
                                    </button>
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="btn btn-secondary"
                                        >
                                            ❌ Hủy
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* ✅ Cập nhật bảng để thêm nút Sửa */}
                <div className="card">
                    <div className="card-header">
                        <h5>📊 Danh sách đầu tư</h5>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover">
                                <thead className="table-light">
                                <tr>
                                    <th>Loại</th>
                                    <th>Tên</th>
                                    <th>Số lượng</th>
                                    <th>Giá mua</th>
                                    <th>Giá hiện tại</th>
                                    <th>Lãi/Lỗ</th>
                                    <th>% Lãi/Lỗ</th>
                                    <th>Ngày mua</th>
                                    <th>Hành động</th>
                                </tr>
                                </thead>
                                <tbody>
                                {investments.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center text-muted">
                                            Chưa có khoản đầu tư nào
                                        </td>
                                    </tr>
                                ) : (
                                    investments.map((item) => {
                                        const profitLoss = (item.currentPrice - item.purchasePrice) * item.quantity;
                                        const profitLossPercent = ((item.currentPrice - item.purchasePrice) / item.purchasePrice * 100).toFixed(2);

                                        return (
                                            <tr key={item.id} className={editingId === item.id ? 'table-warning' : ''}>
                                                <td>{item.assetType}</td>
                                                <td><strong>{item.assetName}</strong></td>
                                                <td>{item.quantity}</td>
                                                <td>{item.purchasePrice.toLocaleString()}₫</td>
                                                <td>{item.currentPrice.toLocaleString()}₫</td>
                                                <td className={profitLoss >= 0 ? 'text-success' : 'text-danger'}>
                                                    <strong>{profitLoss.toLocaleString()}₫</strong>
                                                </td>
                                                <td className={profitLoss >= 0 ? 'text-success' : 'text-danger'}>
                                                    <strong>{profitLossPercent}%</strong>
                                                </td>
                                                <td>{item.purchaseDate}</td>
                                                <td>
                                                    <div className="btn-group" role="group">
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="btn btn-outline-primary btn-sm"
                                                            disabled={editingId === item.id}
                                                        >
                                                            {editingId === item.id ? '✏️ Đang sửa...' : '✏️ Sửa'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="btn btn-outline-danger btn-sm"
                                                        >
                                                            🗑️ Xoá
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InvestmentPage;