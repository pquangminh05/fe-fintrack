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

    // ✅ Lấy userId và username từ localStorage
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");

    useEffect(() => {
        if (userId) {
            fetchData();
        }
    }, [userId]);

    // ✅ Cập nhật fetchData để lấy dữ liệu theo userId
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

    // ✅ Kiểm tra đăng nhập
    if (!userId) {
        return (
            <>
                <Navbar />
                <div className="container">
                    <p>Vui lòng đăng nhập để xem báo cáo</p>
                    <a href="/login" className="btn btn-primary">Đăng nhập</a>
                </div>
            </>
        );
    }

    // Tổng hợp
    const totalPurchase = purchases.reduce((sum, item) => sum + item.price, 0);
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0);
    const totalInvestment = investments.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);

    // ✅ Tính số dư thực tế
    const balance = totalIncome - totalExpense - totalPurchase;

    const pieData = {
        labels: ['Mua sắm', 'Thu nhập', 'Chi tiêu', 'Đầu tư'],
        datasets: [
            {
                label: 'Tổng tiền',
                data: [totalPurchase, totalIncome, totalExpense, totalInvestment],
                backgroundColor: ['#FF6384', '#36A2EB', '#FF9F40', '#FFCE56'],
                borderWidth: 1,
            },
        ],
    };

    return (
        <>
            <Navbar />
            <div className="container">
                <h1>Báo cáo tài chính</h1>

                {/* ✅ Hiển thị thông tin user */}
                <div className="user-info mb-4">
                    <p><strong>Báo cáo của:</strong> {username}</p>
                </div>

                <div className="card">
                    <h2>Tổng quan chi tiêu</h2>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <h3>Thu nhập</h3>
                            <p className="text-green">{totalIncome.toLocaleString()} VND</p>
                        </div>
                        <div className="stat-item">
                            <h3>Chi tiêu</h3>
                            <p className="text-red">{totalExpense.toLocaleString()} VND</p>
                        </div>
                        <div className="stat-item">
                            <h3>Mua sắm</h3>
                            <p className="text-orange">{totalPurchase.toLocaleString()} VND</p>
                        </div>
                        <div className="stat-item">
                            <h3>Đầu tư</h3>
                            <p className="text-blue">{totalInvestment.toLocaleString()} VND</p>
                        </div>
                        <div className="stat-item">
                            <h3>Số dư còn lại</h3>
                            <p className={balance >= 0 ? 'text-green' : 'text-red'}>
                                {balance.toLocaleString()} VND
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h2>Biểu đồ phân bổ</h2>
                    <div style={{ maxWidth: '400px', margin: 'auto' }}>
                        <Pie data={pieData} />
                    </div>
                </div>

                {/* ✅ Thêm chi tiết giao dịch */}
                <div className="card">
                    <h2>Chi tiết giao dịch</h2>
                    <div className="detail-grid">
                        <div>
                            <h3>Giao dịch Thu/Chi ({transactions.length})</h3>
                            <ul>
                                {transactions.slice(0, 5).map(tx => (
                                    <li key={tx.id}>
                                        {tx.type === 'income' ? '💰' : '💸'}
                                        {tx.category}: {Number(tx.amount).toLocaleString()}₫
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3>Mua sắm ({purchases.length})</h3>
                            <ul>
                                {purchases.slice(0, 5).map(purchase => (
                                    <li key={purchase.id}>
                                        🛒 {purchase.productName}: {purchase.price.toLocaleString()}₫
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3>Đầu tư ({investments.length})</h3>
                            <ul>
                                {investments.slice(0, 5).map(investment => (
                                    <li key={investment.id}>
                                        📈 {investment.assetName}: {(investment.currentPrice * investment.quantity).toLocaleString()}₫
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default BaoCao;