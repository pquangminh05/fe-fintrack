import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

function NhacNho() {
    const [reminders, setReminders] = useState([]);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [content, setContent] = useState('');
    const [editingId, setEditingId] = useState(null);

    // ✅ Lấy userId và username từ localStorage
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (username && userId) {
            fetchReminders();
        }
    }, [username, userId]);

    // ✅ Giữ nguyên fetchReminders vì đã đúng
    const fetchReminders = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/reminders?username=${username}`);
            setReminders(res.data);
        } catch (err) {
            console.error('Lỗi khi load nhắc nhở:', err);
        }
    };

    // ✅ Cập nhật handleSubmit để đảm bảo có đủ thông tin user
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId) {
            alert('Vui lòng đăng nhập để tạo nhắc nhở');
            return;
        }

        const reminder = {
            title,
            content,
            remindDate: date,
            done: false,
            user: {
                id: Number(userId)
            }
        };

        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/api/reminders/${editingId}`, reminder);
                alert('Cập nhật nhắc nhở thành công');
            } else {
                await axios.post('http://localhost:5000/api/reminders', reminder);
                alert('Tạo nhắc nhở thành công');
            }
            fetchReminders();
            resetForm();
        } catch (err) {
            console.error('Lỗi khi lưu nhắc nhở:', err);
            alert('Lỗi khi lưu nhắc nhở: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleEdit = (reminder) => {
        setTitle(reminder.title);
        setContent(reminder.content || '');
        setDate(reminder.remindDate);
        setEditingId(reminder.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa nhắc nhở này không?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/reminders/${id}`);
            fetchReminders();
            alert('Xóa nhắc nhở thành công');
        } catch (err) {
            console.error('Lỗi khi xóa nhắc nhở:', err);
            alert('Lỗi khi xóa nhắc nhở');
        }
    };

    const resetForm = () => {
        setTitle('');
        setContent('');
        setDate('');
        setEditingId(null);
    };

    // ✅ Kiểm tra đăng nhập
    if (!userId || !username) {
        return (
            <>
                <Navbar />
                <div className="container">
                    <p>Vui lòng đăng nhập để sử dụng chức năng nhắc nhở</p>
                    <a href="/login" className="btn btn-primary">Đăng nhập</a>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="container">
                <h1>Nhắc nhở & Cảnh báo</h1>

                {/* ✅ Hiển thị thông tin user */}
                <div className="user-info mb-4">
                    <p><strong>Nhắc nhở của:</strong> {username}</p>
                </div>

                {/* Form tạo nhắc nhở */}
                <div className="card">
                    <h2>{editingId ? 'Chỉnh sửa nhắc nhở' : 'Tạo nhắc nhở mới'}</h2>
                    <form className="reminder-form" onSubmit={handleSubmit}>
                        <label>Tiêu đề nhắc nhở *</label>
                        <input
                            type="text"
                            placeholder="VD: Đóng tiền điện"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <label>Nội dung chi tiết</label>
                        <textarea
                            placeholder="Mô tả chi tiết về nhắc nhở (không bắt buộc)"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows="3"
                        />

                        <label>Ngày nhắc *</label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                {editingId ? 'Lưu thay đổi' : 'Tạo nhắc nhở'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={resetForm} className="btn btn-secondary">
                                    Hủy chỉnh sửa
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Danh sách nhắc nhở */}
                <div className="card">
                    <h2>Danh sách nhắc nhở</h2>
                    <div className="reminder-list">
                        {reminders.length === 0 ? (
                            <p className="text-gray-500">Không có nhắc nhở nào.</p>
                        ) : (
                            reminders.map((reminder) => {
                                const isOverdue = dayjs(reminder.remindDate).isBefore(dayjs(), 'day');
                                const isToday = dayjs(reminder.remindDate).isSame(dayjs(), 'day');

                                return (
                                    <div
                                        className={`reminder-item ${
                                            isOverdue ? 'reminder-overdue' :
                                            isToday ? 'reminder-today' : 'reminder-upcoming'
                                        }`}
                                        key={reminder.id}
                                    >
                                        <div className="reminder-content">
                                            <h3 className="reminder-title">
                                                {reminder.done ? '✅' : '📋'} {reminder.title}
                                            </h3>
                                            {reminder.content && (
                                                <p className="reminder-description">{reminder.content}</p>
                                            )}
                                            <p className="reminder-date">
                                                📅 Hạn: {dayjs(reminder.remindDate).format('DD/MM/YYYY')}
                                                {isOverdue && <span className="text-red"> (Đã quá hạn)</span>}
                                                {isToday && <span className="text-orange"> (Hôm nay)</span>}
                                            </p>
                                            <p className="reminder-status">
                                                Trạng thái: {reminder.done ?
                                                    <span className="text-green">Đã hoàn thành</span> :
                                                    <span className="text-blue">Chưa hoàn thành</span>
                                                }
                                            </p>
                                        </div>
                                        <div className="reminder-actions">
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handleEdit(reminder)}
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(reminder.id)}
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default NhacNho;