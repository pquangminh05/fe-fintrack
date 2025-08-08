import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';

function ThuChi() {
    const [transactions, setTransactions] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalTransaction, setModalTransaction] = useState(null);

    // ✅ Lấy userId và username từ localStorage
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    useEffect(() => {
        fetchTransactions();
    }, []);

    // ✅ Cập nhật fetchTransactions để lấy theo userId
    const fetchTransactions = async () => {
        if (!userId) {
            console.warn("Không tìm thấy userId");
            return;
        }
        try {
            const response = await axios.get(`http://localhost:5000/api/transactions?userId=${userId}`);
            setTransactions(response.data);
        } catch (error) {
            console.error("Lỗi khi tải giao dịch:", error);
        }
    };

    // ✅ Cập nhật handleSubmit để lưu với user
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId) {
            alert('Vui lòng đăng nhập để thực hiện giao dịch');
            return;
        }

        const type = e.target.type.value;
        const category = e.target.category.value;
        const amount = parseFloat(e.target.amount.value);
        const date = e.target.date.value;
        const description = e.target.note.value;

        // ✅ Tạo object transaction với user
        const transactionData = {
            type,
            category,
            amount,
            date,
            description,
            user: {
                id: parseInt(userId)
            }
        };

        try {
            if (isEditing) {
                await axios.put(`http://localhost:5000/api/transactions/${editId}`, transactionData);
                alert('Cập nhật thành công');
                setIsEditing(false);
                setEditId(null);
            } else {
                await axios.post('http://localhost:5000/api/transactions', transactionData);
                alert('Lưu giao dịch thành công');
            }
            localStorage.setItem('reloadDashboard', 'true');
            fetchTransactions();
            e.target.reset();
        } catch (error) {
            console.error("Lỗi khi lưu/cập nhật:", error);
            alert('Lỗi khi lưu/cập nhật: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (tx) => {
        setIsEditing(true);
        setEditId(tx.id);
        document.querySelector('select[name="type"]').value = tx.type;
        document.querySelector('select[name="category"]').value = tx.category;
        document.querySelector('input[name="amount"]').value = tx.amount;
        document.querySelector('input[name="date"]').value = tx.date;
        document.querySelector('input[name="note"]').value = tx.description || '';
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/transactions/${id}`);
            fetchTransactions();
            alert('Xóa thành công');
        } catch (error) {
            console.error("Lỗi khi xóa:", error);
            alert('Lỗi khi xóa giao dịch');
        }
    };

    const handleAddNew = () => {
        setIsEditing(false);
        setEditId(null);
        document.querySelector('form').reset();
    };

    const openModal = (tx) => {
        setModalTransaction(tx);
        setShowModal(true);
    };

    const confirmEdit = () => {
        setShowModal(false);
        handleEdit(modalTransaction);
    };

    const confirmDelete = () => {
        setShowModal(false);
        handleDelete(modalTransaction.id);
    };

    // ✅ Kiểm tra đăng nhập
    if (!userId) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="container mx-auto p-4">
                    <p>Vui lòng đăng nhập để sử dụng chức năng này</p>
                    <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md">Đăng nhập</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Quản lý Thu & Chi</h1>

                {/* ✅ Hiển thị thông tin user */}
                <div className="user-info mb-4 bg-blue-100 p-3 rounded-lg">
                    <p><strong>Đang quản lý cho:</strong> {username}</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md mb-8">
                    <form onSubmit={handleSubmit}>
                        <div className="flex space-x-4 mb-4">
                            <select name="type" className="bg-blue-600 text-white px-4 py-2 rounded-md" required>
                                <option value="income">Thu nhập</option>
                                <option value="expense">Chi tiêu</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            <select name="category" className="block w-full p-2 border rounded-md" required>
                                <option value="">-- Chọn danh mục --</option>
                                <option value="An uong">Ăn uống</option>
                                <option value="Di lai">Đi lại</option>
                                <option value="Mua sam">Mua sắm</option>
                                <option value="Hoc tap">Học tập</option>
                                <option value="Luong">Lương</option>
                                <option value="Khac">Khác</option>
                            </select>
                            <input
                                type="number"
                                name="amount"
                                placeholder="Số tiền"
                                className="block w-full p-2 border rounded-md"
                                min="0"
                                step="1000"
                                required
                            />
                            <input
                                type="date"
                                name="date"
                                className="block w-full p-2 border rounded-md"
                                required
                            />
                            <input
                                type="text"
                                name="note"
                                placeholder="Ghi chú"
                                className="block w-full p-2 border rounded-md"
                            />

                            <div className="flex space-x-4">
                                <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">
                                    {isEditing ? 'Cập nhật' : 'Lưu giao dịch'}
                                </button>
                                <button type="button" onClick={handleAddNew} className="flex-1 bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600">
                                    Thêm giao dịch
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4">Danh sách thu/chi gần đây</h2>
                    {transactions.length === 0 ? (
                        <p className="text-gray-500">Chưa có giao dịch nào.</p>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 text-left">Loại</th>
                                    <th className="p-2 text-left">Danh mục</th>
                                    <th className="p-2 text-left">Số tiền</th>
                                    <th className="p-2 text-left">Ngày</th>
                                    <th className="p-2 text-left">Ghi chú</th>
                                    <th className="p-2 text-left">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 rounded text-sm ${
                                                tx.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {tx.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                                            </span>
                                        </td>
                                        <td className="p-2">{tx.category}</td>
                                        <td className={`p-2 font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {Number(tx.amount).toLocaleString()}₫
                                        </td>
                                        <td className="p-2">{tx.date}</td>
                                        <td className="p-2">{tx.description || '-'}</td>
                                        <td className="p-2">
                                            <button onClick={() => openModal(tx)} className="text-blue-600 hover:underline">Sửa</button>
                                            <button onClick={() => openModal(tx)} className="text-red-600 hover:underline ml-2">Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {showModal && modalTransaction && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                            <h2 className="text-lg font-bold mb-4">Bạn muốn làm gì?</h2>
                            <p className="mb-4">
                                Giao dịch: {modalTransaction.description || modalTransaction.category}
                                ({Number(modalTransaction.amount).toLocaleString()}₫)
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={confirmEdit}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    Sửa
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                                >
                                    Xóa
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
                                >
                                    Huỷ
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ThuChi;