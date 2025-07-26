import Navbar from '../components/Navbar';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from 'react';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend);

function BaoCao() {
    const [labels, setLabels] = useState([]);
    const [values, setValues] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/transactions/statistics/category')
            .then(response => {
                const data = response.data;
                setLabels(Object.keys(data));
                setValues(Object.values(data));
            })
            .catch(error => {
                console.error('Lỗi khi fetch dữ liệu thống kê:', error);
            });
    }, []);

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Chi tiêu',
                data: values,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(199, 199, 199, 0.5)',
                ],
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Báo cáo & Phân tích tài chính</h1>

                <div className="bg-white p-4 rounded-lg shadow-md mb-8">
                    <h2 className="text-lg font-semibold mb-4">Biểu đồ Thu - Chi theo tháng</h2>
                    <div className="h-64 bg-gray-200 flex items-center justify-center">
                        Biểu đồ sẽ hiển thị ở đây
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md mb-8">
                    <h2 className="text-lg font-semibold mb-4">Phân bổ chi tiêu theo danh mục</h2>
                    {labels.length > 0 ? <Pie data={data} /> : <p>Đang tải dữ liệu...</p>}
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4">Gợi ý tiết kiệm</h2>
                    <ul className="list-disc pl-5">
                        <li>Giảm chi tiêu ăn uống xuống 20%</li>
                        <li>Xem xét gói Internet rẻ hơn để tiết kiệm hàng tháng</li>
                        <li>Thiết lập hạn mức chi tiêu hàng tuần</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default BaoCao;
