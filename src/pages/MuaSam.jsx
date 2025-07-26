import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

function MuaSam() {
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [store, setStore] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [receipt, setReceipt] = useState(null); // placeholder
    const [purchases, setPurchases] = useState([]);
    const [editId, setEditId] = useState(null);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/purchases?userId=${userId}`);
            setPurchases(res.data);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách mua sắm:', err);
        }
    };

    const handleSubmit = async () => {
        const data = {
            productName,
            price: parseFloat(price),
            store,
            purchaseDate,
            user: { id: parseInt(userId) }
        };

        try {
            if (editId) {
                await axios.put(`http://localhost:5000/api/purchases/${editId}`, data);
                setEditId(null);
            } else {
                await axios.post('http://localhost:5000/api/purchases', data);
            }
            fetchPurchases();
            clearForm();
        } catch (err) {
            console.error('Lỗi lưu mua sắm:', err);
        }
    };

    const clearForm = () => {
        setProductName('');
        setPrice('');
        setStore('');
        setPurchaseDate('');
        setReceipt(null);
    };

    const handleEdit = (item) => {
        setProductName(item.productName);
        setPrice(item.price);
        setStore(item.store);
        setPurchaseDate(item.purchaseDate);
        setEditId(item.id);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/purchases/${id}`);
            fetchPurchases();
        } catch (err) {
            console.error('Lỗi xóa mục mua sắm:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Lịch sử Mua sắm</h1>
                <div className="bg-white p-4 rounded-lg shadow-md mb-8">
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Tên sản phẩm"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="block w-full p-2 border rounded-md"
                        />
                        <input
                            type="text"
                            placeholder="Giá"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="block w-full p-2 border rounded-md"
                        />
                        <input
                            type="text"
                            placeholder="Nơi mua"
                            value={store}
                            onChange={(e) => setStore(e.target.value)}
                            className="block w-full p-2 border rounded-md"
                        />
                        <input
                            type="date"
                            value={purchaseDate}
                            onChange={(e) => setPurchaseDate(e.target.value)}
                            className="block w-full p-2 border rounded-md"
                        />
                        <input
                            type="file"
                            disabled
                            className="block w-full p-2 border rounded-md"
                        />
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
                        >
                            {editId ? 'Cập nhật' : 'Lưu mua sắm'}
                        </button>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4">Sản phẩm đã mua gần đây</h2>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 text-left">Tên</th>
                                <th className="p-2 text-left">Giá</th>
                                <th className="p-2 text-left">Nơi mua</th>
                                <th className="p-2 text-left">Ngày</th>
                                <th className="p-2 text-left">Hóa đơn</th>
                                <th className="p-2 text-left">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.map((item) => (
                                <tr key={item.id}>
                                    <td className="p-2">{item.productName}</td>
                                    <td className="p-2">{item.price.toLocaleString()}₫</td>
                                    <td className="p-2">{item.store}</td>
                                    <td className="p-2">{item.purchaseDate}</td>
                                    <td className="p-2 text-blue-600">Chưa có</td>
                                    <td className="p-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-600 hover:underline ml-2"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {purchases.length === 0 && (
                                <tr>
                                    <td className="p-2 text-gray-500" colSpan="6">
                                        Chưa có dữ liệu mua sắm.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default MuaSam;
