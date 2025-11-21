import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [filter, setFilter] = useState('ALL');

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    guest: '',
    room: '',
    checkInDate: '',
    checkOutDate: '',
    source: 'DIRECT',
    totalAmount: '',
    notes: ''
  });

  // Fetch data
  useEffect(() => {
    fetchReservations();
    fetchAvailableRooms();
    fetchGuests();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reservations');
      setReservations(res.data);
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const res = await api.get('/rooms?status=VACANT_CLEAN');
      setRooms(res.data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const fetchGuests = async () => {
    try {
      const res = await api.get('/guests');
      setGuests(res.data);
    } catch (err) {
      console.error('Error fetching guests:', err);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate total amount based on room rate and nights
      const selectedRoom = rooms.find(r => r._id === bookingForm.room);
      const checkIn = new Date(bookingForm.checkInDate);
      const checkOut = new Date(bookingForm.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const totalAmount = selectedRoom ? selectedRoom.rate * nights : 0;

      await api.post('/reservations', {
        ...bookingForm,
        totalAmount,
        status: 'BOOKED'
      });

      // Refresh data
      await fetchReservations();
      await fetchAvailableRooms();
      
      // Reset form
      setBookingForm({
        guest: '',
        room: '',
        checkInDate: '',
        checkOutDate: '',
        source: 'DIRECT',
        totalAmount: '',
        notes: ''
      });
      setShowBookingForm(false);

      alert('Reservation created successfully!');
    } catch (err) {
      console.error('Error creating reservation:', err);
      alert('Failed to create reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async (reservationId) => {
    try {
      await api.post(`/reservations/${reservationId}/checkin`);
      await fetchReservations();
      await fetchAvailableRooms();
      alert('Guest checked in successfully!');
    } catch (err) {
      console.error('Error during check-in:', err);
      alert('Failed to check in guest.');
    }
  };

  const handleCheckout = async (reservationId) => {
    try {
      await api.post(`/reservations/${reservationId}/checkout`);
      await fetchReservations();
      await fetchAvailableRooms();
      alert('Guest checked out successfully!');
    } catch (err) {
      console.error('Error during check-out:', err);
      alert('Failed to check out guest.');
    }
  };

  const handleCancel = async (reservationId) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    
    try {
      // We'll need to add a cancel endpoint to backend
      // For now, we'll just show a message
      alert('Cancellation feature will be implemented in backend');
    } catch (err) {
      console.error('Error cancelling reservation:', err);
    }
  };

  const filteredReservations = reservations.filter(res => {
    if (filter === 'ALL') return true;
    return res.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'BOOKED': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'CHECKED_IN': return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'CHECKED_OUT': return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/40';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reservations</h1>
          <p className="text-sm text-slate-400">
            Manage bookings, check-ins, and guest reservations
          </p>
        </div>
        <button
          onClick={() => setShowBookingForm(true)}
          className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-xl font-medium transition"
        >
          + New Booking
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['ALL', 'BOOKED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded-full text-sm border transition ${
              filter === status
                ? 'bg-primary/20 text-primary border-primary/40'
                : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-600'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-cardBg border border-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Create New Booking</h2>
              <button
                onClick={() => setShowBookingForm(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Guest *</label>
                  <select
                    required
                    value={bookingForm.guest}
                    onChange={(e) => setBookingForm({...bookingForm, guest: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="">Select Guest</option>
                    {guests.map(guest => (
                      <option key={guest._id} value={guest._id}>
                        {guest.firstName} {guest.lastName} ({guest.phone})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Room *</label>
                  <select
                    required
                    value={bookingForm.room}
                    onChange={(e) => setBookingForm({...bookingForm, room: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="">Select Room</option>
                    {rooms.map(room => (
                      <option key={room._id} value={room._id}>
                        {room.number} - {room.type} (₹{room.rate}/night)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Check-in Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.checkInDate}
                    onChange={(e) => setBookingForm({...bookingForm, checkInDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Check-out Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.checkOutDate}
                    onChange={(e) => setBookingForm({...bookingForm, checkOutDate: e.target.value})}
                    min={bookingForm.checkInDate || new Date().toISOString().split('T')[0]}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Booking Source</label>
                  <select
                    value={bookingForm.source}
                    onChange={(e) => setBookingForm({...bookingForm, source: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="DIRECT">Direct</option>
                    <option value="OTA">Online Travel Agent</option>
                    <option value="CORPORATE">Corporate</option>
                    <option value="TRAVEL_AGENT">Travel Agent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Notes</label>
                  <input
                    type="text"
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="Special requests or notes"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primaryDark text-white font-medium py-3 rounded-xl transition disabled:opacity-50"
                >
                  {loading ? 'Creating Booking...' : 'Create Booking'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reservations List */}
      <div className="bg-cardBg border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading reservations...</div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No reservations found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Guest</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Room</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Dates</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Amount</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map(reservation => (
                  <tr key={reservation._id} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                    <td className="p-4">
                      <div className="font-medium">
                        {reservation.guest?.firstName} {reservation.guest?.lastName}
                      </div>
                      <div className="text-sm text-slate-400">{reservation.guest?.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">Room {reservation.room?.number}</div>
                      <div className="text-sm text-slate-400 capitalize">{reservation.room?.type.toLowerCase()}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {new Date(reservation.checkInDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-slate-400">
                        to {new Date(reservation.checkOutDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(reservation.status)}`}>
                        {reservation.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">₹{reservation.totalAmount}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {reservation.status === 'BOOKED' && (
                          <button
                            onClick={() => handleCheckin(reservation._id)}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg transition"
                          >
                            Check-in
                          </button>
                        )}
                        {reservation.status === 'CHECKED_IN' && (
                          <button
                            onClick={() => handleCheckout(reservation._id)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition"
                          >
                            Check-out
                          </button>
                        )}
                        {(reservation.status === 'BOOKED' || reservation.status === 'CHECKED_IN') && (
                          <button
                            onClick={() => handleCancel(reservation._id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition"
                          >
                            Cancel
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
  );
}
