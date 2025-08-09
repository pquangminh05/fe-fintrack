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

    // ✅ Thêm state cho trạng thái hoàn thành
    const [done, setDone] = useState(false);

    // ✅ Lấy userId và username từ localStorage
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (username && userId) {
            fetchReminders();
        }
    }, [username, userId]);

    const fetchReminders = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/reminders?username=${username}`);
            setReminders(res.data);
        } catch (err) {
            console.error('Lỗi khi load nhắc nhở:', err);
        }
    };

    // ✅ Cập nhật handleSubmit để bao gồm trạng thái done
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
            done: done, // ✅ Thêm trạng thái done
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

    // ✅ Cập nhật handleEdit để bao gồm trạng thái done
    const handleEdit = (reminder) => {
        setTitle(reminder.title);
        setContent(reminder.content || '');
        setDate(reminder.remindDate);
        setDone(reminder.done); // ✅ Set trạng thái done
        setEditingId(reminder.id);
    };

    // ✅ Thêm hàm toggle trạng thái hoàn thành nhanh
    const toggleDone = async (reminderId, currentDone) => {
        try {
            // Lấy thông tin reminder hiện tại
            const reminder = reminders.find(r => r.id === reminderId);
            if (!reminder) return;

            // Cập nhật trạng thái done
            const updatedReminder = {
                ...reminder,
                done: !currentDone,
                user: {
                    id: Number(userId)
                }
            };

            await axios.put(`http://localhost:5000/api/reminders/${reminderId}`, updatedReminder);
            fetchReminders(); // Tải lại danh sách
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái:', err);
            alert('Lỗi khi cập nhật trạng thái');
        }
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

    // ✅ Cập nhật resetForm để bao gồm done
    const resetForm = () => {
        setTitle('');
        setContent('');
        setDate('');
        setDone(false); // ✅ Reset trạng thái done
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

                {/* ✅ Cập nhật Form tạo nhắc nhở với checkbox trạng thái */}
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

                        {/* ✅ Thêm checkbox trạng thái hoàn thành */}
                        <div className="checkbox-wrapper" style={{marginTop: '15px', marginBottom: '15px'}}>
                            <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <input
                                    type="checkbox"
                                    checked={done}
                                    onChange={(e) => setDone(e.target.checked)}
                                    style={{width: '20px', height: '20px'}}
                                />
                                <span style={{fontWeight: 'bold', color: done ? '#16a34a' : '#6b7280'}}>
                                    {done ? '✅ Đã hoàn thành' : '⏳ Chưa hoàn thành'}
                                </span>
                            </label>
                        </div>

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

                {/* ✅ Cập nhật Danh sách nhắc nhở với nút toggle trạng thái */}
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
                                            reminder.done ? 'reminder-completed' :
                                            isOverdue ? 'reminder-overdue' :
                                            isToday ? 'reminder-today' : 'reminder-upcoming'
                                        }`}
                                        key={reminder.id}
                                        style={{
                                            opacity: reminder.done ? 0.7 : 1,
                                            textDecoration: reminder.done ? 'line-through' : 'none'
                                        }}
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
                                                {!reminder.done && isOverdue && <span className="text-red"> (Đã quá hạn)</span>}
                                                {!reminder.done && isToday && <span className="text-orange"> (Hôm nay)</span>}
                                            </p>
                                            <p className="reminder-status">
                                                Trạng thái: {reminder.done ?
                                                    <span className="text-green">✅ Đã hoàn thành</span> :
                                                    <span className="text-blue">⏳ Chưa hoàn thành</span>
                                                }
                                            </p>
                                        </div>
                                        <div className="reminder-actions">
                                            {/* ✅ Thêm nút toggle trạng thái */}
                                            <button
                                                className={`btn btn-sm ${reminder.done ? 'btn-warning' : 'btn-success'}`}
                                                onClick={() => toggleDone(reminder.id, reminder.done)}
                                                style={{marginRight: '5px'}}
                                            >
                                                {reminder.done ? '↩️ Chưa xong' : '✅ Xong'}
                                            </button>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => handleEdit(reminder)}
                                                style={{marginRight: '5px'}}
                                            >
                                                ✏️ Sửa
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(reminder.id)}
                                            >
                                                🗑️ Xóa
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* ✅ Thêm CSS tùy chỉnh */}
            <style jsx>{`
                .reminder-completed {
                    background-color: #f0f9f0 !important;
                    border-left: 4px solid #16a34a !important;
                }

                .checkbox-wrapper {
                    padding: 10px;
                    background-color: #f8f9fa;
                    border-radius: 5px;
                    border: 1px solid #dee2e6;
                }

                .reminder-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                }

                @media (max-width: 576px) {
                    .reminder-actions {
                        flex-direction: column;
                    }

                    .reminder-actions button {
                        width: 100%;
                    }
                }
            `}</style>
        </>
    );
}

export default NhacNho;