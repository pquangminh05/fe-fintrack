import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';

function ThuChi() {
    const [transactions, setTransactions] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);


    useEffect(() => {
        axios.get('http://localhost:5000/api/transactions')
            .then(response => setTransactions(response.data))
            .catch(error => console.error('Lỗi khi lấy giao dịch:', error));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const type = e.target.type.value;
        const category = e.target.category.value;
        const amount = parseFloat(e.target.amount.value); // ép kiểu
        const date = e.target.date.value; // giữ nguyên nếu backend accept dạng yyyy-MM-dd
        const note = e.target.note.value;

        try {
            if (isEditing) {
                await axios.put(`http://localhost:5000/api/transactions/${editId}`, {
                    type, category, amount, date, note
                });
                alert('Cập nhật thành công');
                setIsEditing(false);
                setEditId(null);
            } else {
                await axios.post('http://localhost:5000/api/transactions', {
                    type, category, amount, date, note
                });
                alert('Lưu giao dịch thành công');
            }

            const response = await axios.get('http://localhost:5000/api/transactions');
            setTransactions(response.data);
            e.target.reset();
        } catch (error) {
            console.error(error); // để debug rõ
            alert('Lỗi khi lưu/cập nhật');
        }
    };
    const [categories, setCategories] = useState([]);

   useEffect(() => {
     axios.get("http://localhost:5000/api/categories")
       .then(res => setCategories(res.data))
       .catch(err => console.error("Lỗi khi load categories", err));
   }, []);




    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/transactions/${id}`);
            const response = await axios.get('http://localhost:5000/api/transactions');
            setTransactions(response.data);
        } catch (error) {
            alert('Xóa giao dịch thất bại');
        }
    };
    const handleEdit = (tx) => {
        setIsEditing(true);
        setEditId(tx.id);
        // Gán dữ liệu vào form
        document.querySelector('select[name="type"]').value = tx.type;
        document.querySelector('select[name="category"]').value = tx.category;
        document.querySelector('input[name="amount"]').value = tx.amount;
        document.querySelector('input[name="date"]').value = tx.date;
        document.querySelector('input[name="note"]').value = tx.note;
    };


    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Quản lý Thu & Chi</h1>
                <div className="bg-white p-4 rounded-lg shadow-md mb-8">
                    <form onSubmit={handleSubmit}>
                        <div className="flex space-x-4 mb-4">
                            <select name="type" className="bg-blue-600 text-white px-4 py-2 rounded-md">
                                <option value="Thu nhập">Thu nhập</option>
                                <option value="Chi tiêu">Chi tiêu</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            <select name="category" className="block w-full p-2 border rounded-md">
                                {categories.map(cat => (
                                  <option key={cat.id} value={cat.name}>
                                    {cat.name} ({cat.type})
                                  </option>
                                ))}

                            </select>
                            <input type="text" name="amount" placeholder="Số tiền" className="block w-full p-2 border rounded-md" />
                            <input type="date" name="date" className="block w-full p-2 border rounded-md" />
                            <input type="text" name="note" placeholder="Ghi chú" className="block w-full p-2 border rounded-md" />
                            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">Lưu giao dịch</button>
                        </div>
                    </form>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4">Danh sách thu/chi gần đây</h2>
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
                        {transactions.map((tx, index) => (
                            <tr key={index}>
                                <td className="p-2">{tx.type}</td>
                                <td className="p-2">{tx.category}</td>
                                <td className="p-2">{tx.amount}</td>
                                <td className="p-2">{tx.date}</td>
                                <td className="p-2">{tx.note}</td>
                                <td className="p-2">
                                    <button onClick={() => handleEdit(tx)} className="text-blue-600 hover:underline">Sửa</button>
                                    <button onClick={() => handleDelete(tx.id)} className="text-red-600 hover:underline ml-2">Xóa</button>

                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ThuChi;