import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function DauTu() {
    const [investments, setInvestments] = useState([]);
    const [asset, setAsset] = useState('');
    const [buyPrice, setBuyPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [currentPrice, setCurrentPrice] = useState('');

    // Lấy danh sách đầu tư từ backend
    const fetchInvestments = async () => {
        try {
            const userId = localStorage.getItem('userId'); // hoặc lấy từ context/token
            const response = await axios.get(`http://localhost:5000/api/investments?userId=${userId}`);
            setInvestments(response.data);
        } catch (error) {
            console.error('Lỗi lấy danh sách đầu tư:', error);
        }
    };


    useEffect(() => {
        fetchInvestments();
    }, []);

    const handleSubmit = async () => {
        const newInvestment = {
            asset,
            buyPrice: parseFloat(buyPrice),
            quantity: parseFloat(quantity),
            currentPrice: parseFloat(currentPrice)
        };

        try {
            await axios.post('http://localhost:5000/api/investments', newInvestment);
            fetchInvestments(); // cập nhật lại danh sách
            setAsset('');
            setBuyPrice('');
            setQuantity('');
            setCurrentPrice('');
        } catch (error) {
            console.error('Lỗi thêm đầu tư:', error);
        }
    };

    const userId = localStorage.getItem('userId');
    const newInvestment = {
        asset,
        buyPrice: parseFloat(buyPrice),
        quantity: parseFloat(quantity),
        currentPrice: parseFloat(currentPrice),
        userId: parseInt(userId) // Thêm dòng này
    };

    const chartData = {
        labels: investments.map((_, idx) => `Tháng ${idx + 1}`),
        datasets: [
            {
                label: 'Giá trị đầu tư',
                data: investments.map(inv => inv.quantity * inv.currentPrice),
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Danh mục đầu tư cá nhân</h1>

                {/* Form nhập liệu */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-8">
                    <div className="space-y-4">
                        <input type="text" placeholder="Tài sản" value={asset} onChange={e => setAsset(e.target.value)} className="block w-full p-2 border rounded-md" />
                        <input type="text" placeholder="Giá mua" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} className="block w-full p-2 border rounded-md" />
                        <input type="text" placeholder="Số lượng" value={quantity} onChange={e => setQuantity(e.target.value)} className="block w-full p-2 border rounded-md" />
                        <input type="text" placeholder="Giá hiện tại" value={currentPrice} onChange={e => setCurrentPrice(e.target.value)} className="block w-full p-2 border rounded-md" />
                        <button onClick={handleSubmit} className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">Tính lãi/lỗ</button>
                    </div>
                </div>

                {/* Danh sách đầu tư */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-8">
                    <h2 className="text-lg font-semibold mb-4">Danh sách đầu tư</h2>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 text-left">Tài sản</th>
                                <th className="p-2 text-left">Giá mua</th>
                                <th className="p-2 text-left">Số lượng</th>
                                <th className="p-2 text-left">Giá hiện tại</th>
                                <th className="p-2 text-left">Lãi/Lỗ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {investments.map((inv, idx) => {
                                const profit = (inv.currentPrice - inv.buyPrice) * inv.quantity;
                                return (
                                    <tr key={idx}>
                                        <td className="p-2">{inv.asset}</td>
                                        <td className="p-2">{inv.buyPrice.toLocaleString()}</td>
                                        <td className="p-2">{inv.quantity}</td>
                                        <td className="p-2">{inv.currentPrice.toLocaleString()}</td>
                                        <td className={`p-2 ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {profit >= 0 ? '+' : ''}{profit.toLocaleString()}₫
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Biểu đồ */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4">Biểu đồ tăng trưởng đầu tư</h2>
                    <Line data={chartData} />
                </div>
            </div>
        </div>
    );
}

export default DauTu;
