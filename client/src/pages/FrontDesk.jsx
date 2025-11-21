import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function FrontDesk() {
  const [activeTab, setActiveTab] = useState('checkin');
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showCheckinForm, setShowCheckinForm] = useState(false);

  // Check-in Form State
  const [checkinForm, setCheckinForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    idType: 'AADHAAR',
    idNumber: '',
    checkOutDate: '',
    notes: ''
  });

  // Fetch data
  useEffect(() => {
    fetchAvailableRooms();
    fetchTodayReservations();
  }, []);

  const fetchAvailableRooms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rooms?status=VACANT_CLEAN');
      setRooms(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load available rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayReservations = async () => {
    try {
      const res = await api.get('/reservations');
      const today = new Date().toISOString().split('T')[0];
      const todayReservations = res.data.filter(res => 
        res.checkInDate.split('T')[0] === today || 
        res.checkOutDate.split('T')[0] === today
      );
      setReservations(todayReservations);
    } catch (err) {
      console.error('Error fetching reservations:', err);
    }
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setShowCheckinForm(true);
    
    // Set default check-out date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCheckinForm(prev => ({
      ...prev,
      checkOutDate: tomorrow.toISOString().split('T')[0]
    }));
  };

  const handleCheckinSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Create guest
      const guestRes = await api.post('/guests', {
        firstName: checkinForm.firstName,
        lastName: checkinForm.lastName,
        phone: checkinForm.phone,
        email: checkinForm.email,
        idType: checkinForm.idType,
        idNumber: checkinForm.idNumber
      });

      // 2. Create reservation with CHECKED_IN status
      await api.post('/reservations', {
        guest: guestRes.data._id,
        room: selectedRoom._id,
        checkInDate: new Date().toISOString(),
        checkOutDate: checkinForm.checkOutDate,
        status: 'CHECKED_IN',
        notes: checkinForm.notes
      });

      // 3. Refresh data
      await fetchAvailableRooms();
      await fetchTodayReservations();
      
      // 4. Reset form
      setCheckinForm({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        idType: 'AADHAAR',
        idNumber: '',
        checkOutDate: '',
        notes: ''
      });
      setSelectedRoom(null);
      setShowCheckinForm(false);

      alert('Guest checked in successfully!');

    } catch (err) {
      console.error('Error during check-in:', err);
      alert('Failed to check in guest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Front Desk</h1>
          <p className="text-sm text-slate-400">
            Guest check-in, check-out, and folio management
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
            Today: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'checkin'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('checkin')}
        >
          Check-in Guest
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'today'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('today')}
        >
          Today's Activity
        </button>
      </div>

      {/* Check-in Tab */}
      {activeTab === 'checkin' && (
        <div className="space-y-6">
          {!showCheckinForm ? (
            /* Room Selection */
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Select Room for Check-in</h2>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl p-4 mb-4">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="text-center py-8 text-slate-400">Loading available rooms...</div>
              ) : rooms.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No available rooms found. All rooms are occupied or under maintenance.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rooms.map(room => (
                    <div 
                      key={room._id} 
                      className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-primary/60 transition cursor-pointer"
                      onClick={() => handleRoomSelect(room)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-lg">Room {room.number}</div>
                          <div className="text-sm text-slate-400 capitalize">{room.type.toLowerCase()} Room</div>
                        </div>
                        <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                          Available
                        </div>
                      </div>
                      <div className="text-sm text-slate-300 mb-3">
                        Floor {room.floor} • ₹{room.rate}/night
                      </div>
                      <div className="text-center text-primary text-sm font-medium">
                        Click to Check-in
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Check-in Form */
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">
                  Check-in Guest - Room {selectedRoom?.number}
                </h2>
                <button
                  onClick={() => {
                    setShowCheckinForm(false);
                    setSelectedRoom(null);
                  }}
                  className="text-slate-400 hover:text-slate-200"
                >
                  ← Back to Rooms
                </button>
              </div>

              <form onSubmit={handleCheckinSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={checkinForm.firstName}
                      onChange={(e) => setCheckinForm({...checkinForm, firstName: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={checkinForm.lastName}
                      onChange={(e) => setCheckinForm({...checkinForm, lastName: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={checkinForm.phone}
                      onChange={(e) => setCheckinForm({...checkinForm, phone: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={checkinForm.email}
                      onChange={(e) => setCheckinForm({...checkinForm, email: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">ID Type</label>
                    <select
                      value={checkinForm.idType}
                      onChange={(e) => setCheckinForm({...checkinForm, idType: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                      <option value="AADHAAR">Aadhaar</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="DRIVING_LICENSE">Driving License</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">ID Number</label>
                    <input
                      type="text"
                      value={checkinForm.idNumber}
                      onChange={(e) => setCheckinForm({...checkinForm, idNumber: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                      placeholder="Enter ID number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Check-out Date *</label>
                    <input
                      type="date"
                      required
                      value={checkinForm.checkOutDate}
                      onChange={(e) => setCheckinForm({...checkinForm, checkOutDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Room Details</label>
                    <div className="bg-slate-800/50 rounded-xl px-3 py-2 text-sm">
                      {selectedRoom?.number} - {selectedRoom?.type} (₹{selectedRoom?.rate}/night)
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Notes</label>
                  <textarea
                    value={checkinForm.notes}
                    onChange={(e) => setCheckinForm({...checkinForm, notes: e.target.value})}
                    rows="3"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="Any special requests or notes..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primaryDark text-white font-medium py-3 rounded-xl transition disabled:opacity-50"
                >
                  {loading ? 'Processing Check-in...' : 'Complete Check-in'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Today's Activity Tab */}
      {activeTab === 'today' && (
        <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Today's Activity</h2>
          
          {reservations.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No check-ins or check-outs for today.
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.map(reservation => (
                <div key={reservation._id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      reservation.status === 'CHECKED_IN' ? 'bg-green-500' : 
                      reservation.status === 'CHECKED_OUT' ? 'bg-blue-500' : 'bg-amber-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">
                        {reservation.guest?.firstName} {reservation.guest?.lastName}
                      </div>
                      <div className="text-sm text-slate-400">
                        Room {reservation.room?.number} • {reservation.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-400">
                    Check-out: {new Date(reservation.checkOutDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
