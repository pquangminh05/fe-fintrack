import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/transactions');
        setTransactions(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3'],
    datasets: [
      {
        label: 'Thu nhập',
        data: [15000000, 12000000, 18000000], // TODO: replace bằng data thực
        backgroundColor: '#16a34a',
      },
      {
        label: 'Chi tiêu',
        data: [7500000, 8000000, 6000000], // TODO: replace bằng data thực
        backgroundColor: '#dc2626',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Biểu đồ Thu - Chi 3 tháng gần nhất' },
    },
  };

  return (
    <>
      <Navbar />
      <div className="container dashboard-page">
        <h1>Trang tổng quan tài chính</h1>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <>
            {/* Tổng hợp thu chi */}
            <div className="stat-grid">
              <div className="stat-card green">
                <h3>Tổng Thu</h3>
                <p>{totalIncome.toLocaleString()}₫</p>
              </div>
              <div className="stat-card red">
                <h3>Tổng Chi</h3>
                <p>{totalExpense.toLocaleString()}₫</p>
              </div>
              <div className="stat-card blue">
                <h3>Số Dư</h3>
                <p>{balance.toLocaleString()}₫</p>
              </div>
            </div>

            {/* Biểu đồ */}
            <div className="card">
              <h2>Biểu đồ Thu - Chi</h2>
              <div style={{ height: '300px' }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Dashboard;
