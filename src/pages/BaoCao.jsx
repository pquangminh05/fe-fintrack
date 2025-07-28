import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function BaoCao() {
    const [purchases, setPurchases] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [investments, setInvestments] = useState([]);

    const userId = localStorage.getItem("userId");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [purchaseRes, transactionRes, investmentRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/purchases?userId=${userId}`),
                axios.get(`http://localhost:5000/api/transactions?userId=${userId}`),
                axios.get(`http://localhost:5000/api/investments?userId=${userId}`)
            ]);
            setPurchases(purchaseRes.data);
            setTransactions(transactionRes.data);
            setInvestments(investmentRes.data);
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu báo cáo:", err);
        }
    };

    // Tổng hợp
    const totalPurchase = purchases.reduce((sum, item) => sum + item.price, 0);
    const totalTransaction = transactions.reduce((sum, item) => sum + item.amount, 0);
    const totalInvestment = investments.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);

    const pieData = {
        labels: ['Mua sắm', 'Thu-Chi', 'Đầu tư'],
        datasets: [
            {
                label: 'Tổng tiền',
                data: [totalPurchase, totalTransaction, totalInvestment],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                borderWidth: 1,
            },
        ],
    };

    return (
        <>
            <Navbar />
            <div className="container">
                <h1>Báo cáo tài chính</h1>

                <div className="card">
                    <h2>Tổng quan chi tiêu</h2>
                    <ul>
                        <li><strong>Mua sắm:</strong> {totalPurchase.toLocaleString()} VND</li>
                        <li><strong>Thu-Chi:</strong> {totalTransaction.toLocaleString()} VND</li>
                        <li><strong>Đầu tư:</strong> {totalInvestment.toLocaleString()} VND</li>
                    </ul>
                </div>

                <div className="card">
                    <h2>Biểu đồ phân bổ</h2>
                    <div style={{ maxWidth: '400px', margin: 'auto' }}>
                        <Pie data={pieData} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default BaoCao;
