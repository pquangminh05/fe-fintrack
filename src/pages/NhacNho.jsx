import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';
import axios from 'axios';

function NhacNho() {
    const [reminders, setReminders] = useState([]);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [repeat, setRepeat] = useState('');
    const [editingId, setEditingId] = useState(null);

    // Load danh sách nhắc nhở khi load trang
    useEffect(() => {
        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/reminders');
            setReminders(res.data);
        } catch (err) {
            console.error('Lỗi khi load nhắc nhở:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const reminder = {
            title,
            reminderDate: date,
            repeatType: repeat === 'monthly' ? 'MONTHLY' : 'ONCE',
        };

        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/api/reminders/${editingId}`, reminder);
            } else {
                await axios.post('http://localhost:5000/api/reminders', reminder);
            }
            fetchReminders();
            setTitle('');
            setDate('');
            setRepeat('');
            setEditingId(null);
        } catch (err) {
            console.error('Lỗi khi lưu nhắc nhở:', err);
        }
    };

    const handleEdit = (reminder) => {
        setTitle(reminder.title);
        setDate(reminder.reminderDate);
        setRepeat(reminder.repeatType === 'MONTHLY' ? 'monthly' : 'once');
        setEditingId(reminder.id);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/reminders/${id}`);
            fetchReminders();
        } catch (err) {
            console.error('Lỗi khi xóa nhắc nhở:', err);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container">
                <h1>Nhắc nhở & Cảnh báo</h1>

                {/* Form tạo nhắc nhở */}
                <div className="card">
                    <h2>{editingId ? 'Chỉnh sửa nhắc nhở' : 'Tạo nhắc nhở mới'}</h2>
                    <form className="reminder-form" onSubmit={handleSubmit}>
                        <label>Tên nhắc nhở</label>
                        <input type="text" placeholder="VD: Đóng tiền điện" required value={title} onChange={(e) => setTitle(e.target.value)} />

                        <label>Ngày nhắc</label>
                        <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />

                        <label>Chu kỳ</label>
                        <div className="reminder-radio">
                            <label><input type="radio" name="repeat" value="monthly" checked={repeat === 'monthly'} onChange={() => setRepeat('monthly')} /> Lặp lại hàng tháng</label>
                            <label><input type="radio" name="repeat" value="once" checked={repeat === 'once'} onChange={() => setRepeat('once')} /> Chỉ 1 lần</label>
                        </div>

                        <button type="submit">{editingId ? 'Lưu thay đổi' : 'Tạo nhắc nhở'}</button>
                    </form>
                </div>

                {/* Danh sách nhắc nhở */}
                <div className="card">
                    <h2>Danh sách nhắc nhở</h2>
                    <div className="reminder-list">
                        {reminders.map((reminder) => (
                            <div className="reminder-item" key={reminder.id}>
                                <div>
                                    <p className="reminder-title">{reminder.title}</p>
                                    <p className="reminder-date">Hạn: {reminder.reminderDate}</p>
                                </div>
                                <div className="reminder-actions">
                                    <button className="text-blue" onClick={() => handleEdit(reminder)}>Sửa</button>
                                    <button className="text-red" onClick={() => handleDelete(reminder.id)}>Xóa</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default NhacNho;
