
import React, { useState } from 'react';

interface User {
  username: string;
  password: string;
}

interface AdminPanelProps {
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (username: string) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ users, onAddUser, onDeleteUser, onClose }) => {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      setError('يرجى ملء جميع الحقول');
      return;
    }
    if (users.some(u => u.username === newUsername.trim())) {
      setError('اسم المستخدم موجود بالفعل');
      return;
    }
    
    onAddUser({ username: newUsername.trim(), password: newPassword.trim() });
    setNewUsername('');
    setNewPassword('');
    setError('');
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in p-4">
      <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-bold text-cyan-400">لوحة تحكم المسؤول</h2>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          العودة للمحرر
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Add User Section */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg h-fit">
          <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">إضافة مستخدم جديد</h3>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1 text-right">اسم المستخدم</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-right text-white"
                placeholder="أدخل الاسم"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1 text-right">كلمة المرور</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-right text-white"
                placeholder="أدخل الرقم السري"
              />
            </div>
            
            {error && <p className="text-red-400 text-sm text-right">{error}</p>}

            <button
              type="submit"
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-transform transform active:scale-95 mt-2"
            >
              إضافة المستخدم
            </button>
          </form>
        </div>

        {/* Users List Section */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">المستخدمين المصرح لهم ({users.length})</h3>
          <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
            {users.length === 0 ? (
              <p className="text-gray-500 text-center py-4">لا يوجد مستخدمين إضافيين حالياً</p>
            ) : (
              users.map((user, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-700">
                  <button
                    onClick={() => onDeleteUser(user.username)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/30 p-2 rounded transition-colors"
                    title="حذف المستخدم"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div className="text-right">
                    <p className="font-bold text-gray-200">{user.username}</p>
                    <p className="text-xs text-gray-500 font-mono">Pass: {user.password}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
