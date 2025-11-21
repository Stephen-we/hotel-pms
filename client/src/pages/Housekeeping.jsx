import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Housekeeping() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');

  // Fetch all rooms
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedRoom || !updateStatus) return;

    try {
      await api.patch(`/rooms/${selectedRoom._id}/status`, { status: updateStatus });
      await fetchRooms();
      setShowUpdateForm(false);
      setSelectedRoom(null);
      setUpdateStatus('');
      alert('Room status updated successfully!');
    } catch (err) {
      console.error('Error updating room status:', err);
      alert('Failed to update room status.');
    }
  };

  const handleQuickUpdate = async (roomId, newStatus) => {
    try {
      await api.patch(`/rooms/${roomId}/status`, { status: newStatus });
      await fetchRooms();
      alert('Room status updated!');
    } catch (err) {
      console.error('Error updating room status:', err);
      alert('Failed to update room status.');
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'VACANT_CLEAN':
        return { color: 'bg-emerald-500', text: 'Vacant Clean', icon: '✅' };
      case 'VACANT_DIRTY':
        return { color: 'bg-amber-500', text: 'Vacant Dirty', icon: '🧹' };
      case 'OCCUPIED':
        return { color: 'bg-blue-500', text: 'Occupied', icon: '👤' };
      case 'OUT_OF_ORDER':
        return { color: 'bg-red-500', text: 'Out of Order', icon: '🚫' };
      default:
        return { color: 'bg-slate-500', text: status, icon: '❓' };
    }
  };

  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'VACANT_DIRTY':
        return [
          { value: 'VACANT_CLEAN', label: 'Mark as Clean', description: 'Room cleaning completed' },
          { value: 'OUT_OF_ORDER', label: 'Report Issue', description: 'Room needs maintenance' }
        ];
      case 'VACANT_CLEAN':
        return [
          { value: 'VACANT_DIRTY', label: 'Mark as Dirty', description: 'Room needs cleaning' },
          { value: 'OUT_OF_ORDER', label: 'Report Issue', description: 'Room needs maintenance' }
        ];
      case 'OCCUPIED':
        return [
          { value: 'OUT_OF_ORDER', label: 'Report Issue', description: 'Room needs maintenance' }
        ];
      case 'OUT_OF_ORDER':
        return [
          { value: 'VACANT_CLEAN', label: 'Repair Completed', description: 'Room ready for use' },
          { value: 'VACANT_DIRTY', label: 'Repair Completed (Needs Cleaning)', description: 'Room repaired but needs cleaning' }
        ];
      default:
        return [];
    }
  };

  const filteredRooms = rooms.filter(room => {
    if (filter === 'ALL') return true;
    return room.status === filter;
  });

  const statusCounts = rooms.reduce((acc, room) => {
    acc[room.status] = (acc[room.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Housekeeping</h1>
          <p className="text-sm text-slate-400">
            Manage room cleaning schedules and maintenance status
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
            Total Rooms: {rooms.length}
          </span>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { status: 'VACANT_CLEAN', label: 'Clean & Ready' },
          { status: 'VACANT_DIRTY', label: 'Needs Cleaning' },
          { status: 'OCCUPIED', label: 'Occupied' },
          { status: 'OUT_OF_ORDER', label: 'Maintenance' }
        ].map(({ status, label }) => {
          const info = getStatusInfo(status);
          return (
            <div key={status} className="bg-cardBg border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-semibold">{statusCounts[status] || 0}</div>
                  <div className="text-sm text-slate-400">{label}</div>
                </div>
                <div className={`w-3 h-3 rounded-full ${info.color}`}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1 rounded-full text-sm border transition ${
            filter === 'ALL'
              ? 'bg-primary/20 text-primary border-primary/40'
              : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-600'
          }`}
        >
          All Rooms
        </button>
        {['VACANT_CLEAN', 'VACANT_DIRTY', 'OCCUPIED', 'OUT_OF_ORDER'].map(status => {
          const info = getStatusInfo(status);
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-sm border transition flex items-center gap-2 ${
                filter === status
                  ? 'bg-primary/20 text-primary border-primary/40'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-600'
              }`}
            >
              <span>{info.icon}</span>
              {info.text}
            </button>
          );
        })}
      </div>

      {/* Update Status Modal */}
      {showUpdateForm && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-cardBg border border-slate-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Update Room Status</h2>
              <button
                onClick={() => {
                  setShowUpdateForm(false);
                  setSelectedRoom(null);
                  setUpdateStatus('');
                }}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-slate-900/50 rounded-xl">
              <div className="font-semibold">Room {selectedRoom.number}</div>
              <div className="text-sm text-slate-400">
                {selectedRoom.type} • Floor {selectedRoom.floor}
              </div>
              <div className="text-sm mt-1">
                Current Status: <span className="font-medium">{getStatusInfo(selectedRoom.status).text}</span>
              </div>
            </div>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Update Status To:</label>
                <select
                  required
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">Select new status</option>
                  {getNextStatusOptions(selectedRoom.status).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {updateStatus && (
                  <div className="text-xs text-slate-400 mt-1">
                    {getNextStatusOptions(selectedRoom.status).find(opt => opt.value === updateStatus)?.description}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primaryDark text-white font-medium py-3 rounded-xl transition"
                >
                  Update Status
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateForm(false);
                    setSelectedRoom(null);
                    setUpdateStatus('');
                  }}
                  className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rooms Grid */}
      <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            Rooms ({filteredRooms.length})
          </h2>
          <button
            onClick={fetchRooms}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading rooms...</div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No rooms found matching the current filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRooms.map(room => {
              const statusInfo = getStatusInfo(room.status);
              const nextOptions = getNextStatusOptions(room.status);
              
              return (
                <div key={room._id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-lg">Room {room.number}</div>
                      <div className="text-sm text-slate-400 capitalize">
                        {room.type.toLowerCase()} • Floor {room.floor}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}/20 text-${statusInfo.color.split('-')[1]}-400 border-${statusInfo.color}/40`}>
                      {statusInfo.icon} {statusInfo.text}
                    </div>
                  </div>

                  <div className="text-sm text-slate-300 mb-4">
                    Rate: ₹{room.rate}/night
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedRoom(room);
                        setShowUpdateForm(true);
                      }}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-sm transition"
                    >
                      Update Status
                    </button>
                    
                    {nextOptions.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {nextOptions.slice(0, 2).map(option => (
                          <button
                            key={option.value}
                            onClick={() => handleQuickUpdate(room._id, option.value)}
                            className="bg-primary/20 hover:bg-primary/30 text-primary text-xs py-1 rounded transition"
                          >
                            {option.label.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Housekeeping Instructions */}
      <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Housekeeping Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-amber-400">🧹</span>
              <span>Vacant Dirty: Clean room thoroughly</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✅</span>
              <span>Vacant Clean: Room ready for guests</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-red-400">🚫</span>
              <span>Out of Order: Report to maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">👤</span>
              <span>Occupied: Do not disturb guests</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
