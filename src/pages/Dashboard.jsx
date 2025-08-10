import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';
import axios from 'axios';
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
import dayjs from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Thêm state cho việc chọn khoảng thời gian
  const [timeRange, setTimeRange] = useState('3months'); // Mặc định 3 tháng

  // ✅ Lấy userId từ localStorage
  const userId = localStorage.getItem('userId');

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  // ✅ Cập nhật fetchData để lấy theo userId
  const fetchData = async () => {
    try {
      if (!userId) {
        console.warn("Không tìm thấy userId, chuyển hướng về login");
        window.location.href = '/login';
        return;
      }

      const res = await axios.get(`http://localhost:5000/api/transactions?userId=${userId}`);
      setTransactions(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu dashboard:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const reload = localStorage.getItem('reloadDashboard');
    if (reload === 'true') {
      localStorage.removeItem('reloadDashboard');
      fetchData();
    }
  }, [userId]);

  // ✅ Hàm tạo dữ liệu biểu đồ theo khoảng thời gian được chọn
  const generateChartData = () => {
    const currentMonth = dayjs();
    let periods = [];
    let chartTitle = '';

    switch (timeRange) {
      case '3months':
        periods = [
          currentMonth.subtract(2, 'month'),
          currentMonth.subtract(1, 'month'),
          currentMonth,
        ];
        chartTitle = 'Biểu đồ Thu - Chi 3 tháng gần nhất';
        break;

      case '6months':
        for (let i = 5; i >= 0; i--) {
          periods.push(currentMonth.subtract(i, 'month'));
        }
        chartTitle = 'Biểu đồ Thu - Chi 6 tháng gần nhất';
        break;

      case '12months':
        for (let i = 11; i >= 0; i--) {
          periods.push(currentMonth.subtract(i, 'month'));
        }
        chartTitle = 'Biểu đồ Thu - Chi 12 tháng gần nhất';
        break;

      case '1year':
        // Hiển thị từng quý trong năm vừa qua
        const currentYear = currentMonth.year();
        periods = [
          { label: 'Q1', start: dayjs(`${currentYear}-01-01`), end: dayjs(`${currentYear}-03-31`) },
          { label: 'Q2', start: dayjs(`${currentYear}-04-01`), end: dayjs(`${currentYear}-06-30`) },
          { label: 'Q3', start: dayjs(`${currentYear}-07-01`), end: dayjs(`${currentYear}-09-30`) },
          { label: 'Q4', start: dayjs(`${currentYear}-10-01`), end: dayjs(`${currentYear}-12-31`) },
        ];
        chartTitle = `Biểu đồ Thu - Chi theo quý năm ${currentYear}`;
        break;
    }

    let monthlyData = [];

    if (timeRange === '1year') {
      // ✅ Xử lý theo quý
      monthlyData = periods.map((period) => {
        let income = 0;
        let expense = 0;

        transactions.forEach((t) => {
          const txDate = dayjs(t.date);
          if (txDate.isAfter(period.start.subtract(1, 'day')) && txDate.isBefore(period.end.add(1, 'day'))) {
            if (t.type === 'income') income += Number(t.amount);
            if (t.type === 'expense') expense += Number(t.amount);
          }
        });

        return { label: period.label, income, expense };
      });
    } else {
      // ✅ Xử lý theo tháng
      monthlyData = periods.map((month) => {
        const monthKey = month.format('YYYY-MM');
        const label = `T${month.month() + 1}/${month.year()}`;
        let income = 0;
        let expense = 0;

        transactions.forEach((t) => {
          const txMonth = dayjs(t.date).format('YYYY-MM');
          if (txMonth === monthKey) {
            if (t.type === 'income') income += Number(t.amount);
            if (t.type === 'expense') expense += Number(t.amount);
          }
        });

        return { label, income, expense };
      });
    }

    return { monthlyData, chartTitle };
  };

  // ✅ Tạo dữ liệu biểu đồ
  const { monthlyData, chartTitle } = generateChartData();

  const chartData = {
    labels: monthlyData.map((d) => d.label),
    datasets: [
      {
        label: 'Thu nhập',
        data: monthlyData.map((d) => d.income),
        backgroundColor: '#16a34a',
      },
      {
        label: 'Chi tiêu',
        data: monthlyData.map((d) => d.expense),
        backgroundColor: '#dc2626',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: chartTitle },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString() + '₫';
          }
        }
      }
    }
  };

  // ✅ Kiểm tra đăng nhập
  if (!userId) {
    return (
      <>
        <Navbar />
        <div className="container">
          <p>Vui lòng đăng nhập để xem dashboard</p>
          <a href="/login" className="btn btn-primary">Đăng nhập</a>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container dashboard-page">
        <h1>Trang tổng quan tài chính</h1>

        {/* ✅ Hiển thị thông tin user */}
        <div style={{ marginBottom: '20px' }}>
          <p><strong>Chào mừng:</strong> {localStorage.getItem('username')}</p>
        </div>

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

            {/* ✅ Biểu đồ với bộ lọc thời gian */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Biểu đồ Thu - Chi</h2>

                {/* ✅ Dropdown chọn khoảng thời gian */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label htmlFor="timeRange" style={{ fontWeight: 'bold', marginBottom: 0 }}>
                    📅 Khoảng thời gian:
                  </label>
                  <select
                    id="timeRange"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      backgroundColor: '#f8f9fa',
                      fontWeight: 'bold'
                    }}
                  >
                    <option value="3months">📊 3 tháng gần nhất</option>
                    <option value="6months">📈 6 tháng gần nhất</option>
                    <option value="12months">📉 12 tháng gần nhất</option>
                    <option value="1year">🗓️ Theo quý năm nay</option>
                  </select>
                </div>
              </div>

              {/* ✅ Thống kê tóm tắt cho khoảng thời gian được chọn */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ color: '#16a34a', margin: '5px 0' }}>
                    💰 {monthlyData.reduce((sum, d) => sum + d.income, 0).toLocaleString()}₫
                  </h4>
                  <small>Tổng thu nhập</small>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ color: '#dc2626', margin: '5px 0' }}>
                    💸 {monthlyData.reduce((sum, d) => sum + d.expense, 0).toLocaleString()}₫
                  </h4>
                  <small>Tổng chi tiêu</small>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{
                    color: monthlyData.reduce((sum, d) => sum + d.income - d.expense, 0) >= 0 ? '#16a34a' : '#dc2626',
                    margin: '5px 0'
                  }}>
                    💳 {monthlyData.reduce((sum, d) => sum + d.income - d.expense, 0).toLocaleString()}₫
                  </h4>
                  <small>Số dư trong kỳ</small>
                </div>
              </div>

              <div style={{ height: '400px' }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* ✅ Giao dịch gần đây của user */}
            {transactions.length > 0 && (
              <div className="card">
                <h2>Giao dịch gần đây</h2>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Loại</th>
                        <th>Danh mục</th>
                        <th>Số tiền</th>
                        <th>Ngày</th>
                        <th>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions
                        .sort((a, b) => new Date(b.date) - new Date(a.date)) // ✅ Sắp xếp theo ngày mới nhất
                        .slice(0, 10)
                        .map((tx) => (
                        <tr key={tx.id}>
                          <td>
                            <span className={`badge ${tx.type === 'income' ? 'bg-success' : 'bg-danger'}`}>
                              {tx.type === 'income' ? '💰 Thu nhập' : '💸 Chi tiêu'}
                            </span>
                          </td>
                          <td>{tx.category}</td>
                          <td className={tx.type === 'income' ? 'text-green' : 'text-red'}>
                            <strong>{Number(tx.amount).toLocaleString()}₫</strong>
                          </td>
                          <td>{dayjs(tx.date).format('DD/MM/YYYY')}</td>
                          <td>{tx.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ✅ Thêm CSS tùy chỉnh */}
      <style jsx>{`
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .stat-card.green {
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: white !important;
        }

        .stat-card.red {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: white !important;
        }

        .stat-card.blue {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: white !important;
        }

        .stat-card h3 {
          margin: 0 0 10px 0;
          font-size: 1.1rem;
          opacity: 0.95;
          color: white !important;
        }

        .stat-card p {
          margin: 0;
          font-size: 1.5rem;
          font-weight: bold;
          color: white !important;
        }

        .stat-card h3 {
          margin: 0 0 10px 0;
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .stat-card p {
          margin: 0;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 25px;
        }

        .card h2 {
          margin-bottom: 20px;
          color: #1f2937;
        }

        .table-container {
          max-height: 400px;
          overflow-y: auto;
        }

        .table {
          margin-bottom: 0;
        }

        .table th {
          background-color: #f8f9fa;
          border-top: none;
          font-weight: 600;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .text-green {
          color: #16a34a !important;
        }

        .text-red {
          color: #dc2626 !important;
        }

        .user-info {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 15px 20px;
          border-radius: 10px;
          margin-bottom: 25px;
        }

        .user-info p {
          margin: 0;
          font-size: 1.1rem;
        }

        .badge {
          padding: 6px 12px;
          font-size: 0.85rem;
          border-radius: 20px;
        }

        .bg-success {
          background-color: #16a34a !important;
        }

        .bg-danger {
          background-color: #dc2626 !important;
        }

        @media (max-width: 768px) {
          .stat-grid {
            grid-template-columns: 1fr;
          }

          .card {
            padding: 15px;
          }

          .table-container {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </>
  );
}

export default Dashboard;