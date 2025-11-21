import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState(null);
  const [users, setUsers] = useState([]);
  const [systemInfo, setSystemInfo] = useState(null);
  
  // Forms state
  const [hotelForm, setHotelForm] = useState({});
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'RECEPTIONIST',
    department: 'FRONT_DESK',
    permissions: {
      canManageRooms: false,
      canManageGuests: true,
      canManageReservations: true,
      canManageHousekeeping: false,
      canManagePOS: false,
      canViewReports: false,
      canManageUsers: false,
      canManageSettings: false
    }
  });
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Fetch data
  useEffect(() => {
    fetchSettings();
    fetchUsers();
    fetchSystemInfo();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
      setHotelForm(res.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const res = await api.get('/settings/system-info');
      setSystemInfo(res.data);
    } catch (err) {
      console.error('Error fetching system info:', err);
    }
  };

  const saveHotelSettings = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.patch('/settings', hotelForm);
      await fetchSettings();
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingUser) {
        await api.patch(`/users/${editingUser._id}`, userForm);
      } else {
        await api.post('/users', userForm);
      }
      
      setShowUserForm(false);
      setEditingUser(null);
      setUserForm({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'RECEPTIONIST',
        department: 'FRONT_DESK',
        permissions: {
          canManageRooms: false,
          canManageGuests: true,
          canManageReservations: true,
          canManageHousekeeping: false,
          canManagePOS: false,
          canViewReports: false,
          canManageUsers: false,
          canManageSettings: false
        }
      });
      
      await fetchUsers();
      alert(editingUser ? 'User updated successfully!' : 'User created successfully!');
    } catch (err) {
      console.error('Error saving user:', err);
      alert('Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      email: user.email,
      password: '', // Don't pre-fill password
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      role: user.role,
      department: user.department,
      permissions: user.permissions
    });
    setShowUserForm(true);
  };

  const handleToggleUserActive = async (user) => {
    try {
      await api.post(`/users/${user._id}/toggle-active`);
      await fetchUsers();
      alert(`User ${user.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (err) {
      console.error('Error toggling user status:', err);
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!confirm(`Are you sure you want to delete user ${user.username}?`)) return;
    
    try {
      await api.delete(`/users/${user._id}`);
      await fetchUsers();
      alert('User deleted successfully!');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const seedDefaultUsers = async () => {
    try {
      await api.post('/users/seed');
      await fetchUsers();
      alert('Default users created successfully!');
    } catch (err) {
      console.error('Error seeding users:', err);
      alert('Failed to create default users');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'MANAGER': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'RECEPTIONIST': return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'HOUSEKEEPING': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'RESTAURANT': return 'bg-red-500/20 text-red-400 border-red-500/40';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  // User Form Modal
  const UserFormModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {editingUser ? 'Edit User' : 'Create New User'}
        </h3>
        
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">First Name</label>
              <input
                type="text"
                required
                value={userForm.firstName}
                onChange={(e) => setUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={userForm.lastName}
                onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Username</label>
            <input
              type="text"
              required
              value={userForm.username}
              onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={userForm.email}
              onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Password {editingUser && '(leave blank to keep current)'}
            </label>
            <input
              type="password"
              required={!editingUser}
              value={userForm.password}
              onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Role</label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="MANAGER">Manager</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="HOUSEKEEPING">Housekeeping</option>
                <option value="RESTAURANT">Restaurant</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Department</label>
              <select
                value={userForm.department}
                onChange={(e) => setUserForm(prev => ({ ...prev, department: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="FRONT_DESK">Front Desk</option>
                <option value="HOUSEKEEPING">Housekeeping</option>
                <option value="RESTAURANT">Restaurant</option>
                <option value="MANAGEMENT">Management</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Phone</label>
            <input
              type="text"
              value={userForm.phone}
              onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          {/* Permissions Section */}
          <div className="border-t border-slate-700 pt-4">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Permissions</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(userForm.permissions).map(permission => (
                <label key={permission} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={userForm.permissions[permission]}
                    onChange={(e) => setUserForm(prev => ({
                      ...prev,
                      permissions: {
                        ...prev.permissions,
                        [permission]: e.target.checked
                      }
                    }))}
                    className="rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary"
                  />
                  <span className="text-slate-300 capitalize">
                    {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowUserForm(false);
                setEditingUser(null);
              }}
              className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-xl font-medium transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (!settings) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-slate-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings & Configuration</h1>
          <p className="text-sm text-slate-400">
            Manage hotel configuration, users, and system settings
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto">
        {[
          { id: 'general', label: '🏨 Hotel Settings', icon: '🏨' },
          { id: 'users', label: '👥 User Management', icon: '👥' },
          { id: 'system', label: '⚙️ System Info', icon: '⚙️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <form onSubmit={saveHotelSettings} className="space-y-6">
            {/* Hotel Information */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Hotel Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Hotel Name</label>
                  <input
                    type="text"
                    value={hotelForm.hotelName || ''}
                    onChange={(e) => setHotelForm(prev => ({ ...prev, hotelName: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Phone</label>
                  <input
                    type="text"
                    value={hotelForm.phone || ''}
                    onChange={(e) => setHotelForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-1">Address</label>
                  <input
                    type="text"
                    value={hotelForm.address || ''}
                    onChange={(e) => setHotelForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    value={hotelForm.city || ''}
                    onChange={(e) => setHotelForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={hotelForm.email || ''}
                    onChange={(e) => setHotelForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Business Settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Business Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Default Check-in Time</label>
                  <input
                    type="time"
                    value={hotelForm.defaultCheckInTime || '14:00'}
                    onChange={(e) => setHotelForm(prev => ({ ...prev, defaultCheckInTime: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Default Check-out Time</label>
                  <input
                    type="time"
                    value={hotelForm.defaultCheckOutTime || '12:00'}
                    onChange={(e) => setHotelForm(prev => ({ ...prev, defaultCheckOutTime: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={hotelForm.taxRate || 5}
                    onChange={(e) => setHotelForm(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Currency</label>
                  <select
                    value={hotelForm.currency || 'INR'}
                    onChange={(e) => setHotelForm(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-xl font-medium transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold">User Management</h3>
            <div className="flex gap-2">
              {users.length === 0 && (
                <button
                  onClick={seedDefaultUsers}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm transition"
                >
                  Create Default Users
                </button>
              )}
              <button
                onClick={() => setShowUserForm(true)}
                className="px-4 py-2 bg-primary hover:bg-primaryDark text-white rounded-xl text-sm transition"
              >
                + Add User
              </button>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {users.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No users found. Create default users or add new users.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left p-4 text-sm font-medium text-slate-400">User</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-400">Role</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-400">Department</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id} className="border-b border-slate-800/50 hover:bg-slate-800/50">
                        <td className="p-4">
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-slate-400">{user.username}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs border ${getRoleColor(user.role)}`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="text-sm capitalize">
                            {user.department.toLowerCase().replace('_', ' ')}
                          </div>
                        </td>
                        <td className="p-4">
                          {user.isActive ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/40">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/40">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleUserActive(user)}
                              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded-lg transition"
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            {user.role !== 'SUPER_ADMIN' && (
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Information */}
      {activeTab === 'system' && systemInfo && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Status */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Version</span>
                  <span className="font-medium">{systemInfo.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Node.js Version</span>
                  <span className="font-medium">{systemInfo.nodeVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Platform</span>
                  <span className="font-medium">{systemInfo.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Uptime</span>
                  <span className="font-medium">
                    {Math.floor(systemInfo.uptime / 60)} minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Database</span>
                  <span className={`font-medium ${
                    systemInfo.database?.connected ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {systemInfo.database?.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Memory Usage</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Heap Used</span>
                  <span className="font-medium">
                    {(systemInfo.memoryUsage?.heapUsed / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Heap Total</span>
                  <span className="font-medium">
                    {(systemInfo.memoryUsage?.heapTotal / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">RSS</span>
                  <span className="font-medium">
                    {(systemInfo.memoryUsage?.rss / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">External</span>
                  <span className="font-medium">
                    {(systemInfo.memoryUsage?.external / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Database Information */}
          {systemInfo.database && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Database Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-slate-400 text-sm">Host</span>
                  <div className="font-medium">{systemInfo.database.host || 'localhost'}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Database Name</span>
                  <div className="font-medium">{systemInfo.database.name || 'hotel_pms'}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">Status</span>
                  <div className={`font-medium ${
                    systemInfo.database.connected ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {systemInfo.database.connected ? 'Connected' : 'Disconnected'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-center text-slate-500 text-sm">
            Last updated: {new Date(systemInfo.timestamp).toLocaleString()}
          </div>
        </div>
      )}

      {/* User Form Modal */}
      {showUserForm && <UserFormModal />}
    </div>
  );
}