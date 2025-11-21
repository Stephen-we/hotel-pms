import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Guests() {
  const [guests, setGuests] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);

  // Guest form state
  const [guestForm, setGuestForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    idType: 'AADHAAR',
    idNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    dateOfBirth: '',
    gender: '',
    nationality: 'Indian',
    preferences: {
      smoking: false,
      newsletter: true,
      specialRequests: ''
    }
  });

  // Fetch guests
  useEffect(() => {
    fetchGuests();
  }, [searchTerm]);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      
      const res = await api.get('/guests', { params });
      setGuests(res.data.guests || res.data);
    } catch (err) {
      console.error('Error fetching guests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuestDetails = async (guestId) => {
    try {
      const res = await api.get(`/guests/${guestId}`);
      setSelectedGuest(res.data);
      setActiveTab('details');
    } catch (err) {
      console.error('Error fetching guest details:', err);
      alert('Failed to load guest details');
    }
  };

  const handleCreateGuest = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/guests', guestForm);
      setShowGuestForm(false);
      setGuestForm({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        idType: 'AADHAAR',
        idNumber: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        dateOfBirth: '',
        gender: '',
        nationality: 'Indian',
        preferences: {
          smoking: false,
          newsletter: true,
          specialRequests: ''
        }
      });
      await fetchGuests();
      alert('Guest created successfully!');
    } catch (err) {
      console.error('Error creating guest:', err);
      if (err.response?.data?.guest) {
        alert('Guest with this phone already exists');
        setSelectedGuest(err.response.data.guest);
        setActiveTab('details');
      } else {
        alert('Failed to create guest');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBlacklist = async (reason) => {
    try {
      await api.post(`/guests/${selectedGuest.guest._id}/blacklist`, { reason });
      await fetchGuestDetails(selectedGuest.guest._id);
      setShowBlacklistModal(false);
      alert('Guest blacklisted successfully');
    } catch (err) {
      console.error('Error blacklisting guest:', err);
      alert('Failed to blacklist guest');
    }
  };

  const handleRemoveBlacklist = async () => {
    try {
      await api.post(`/guests/${selectedGuest.guest._id}/remove-blacklist`);
      await fetchGuestDetails(selectedGuest.guest._id);
      alert('Guest removed from blacklist');
    } catch (err) {
      console.error('Error removing blacklist:', err);
      alert('Failed to remove blacklist');
    }
  };

  const getLoyaltyColor = (tier) => {
    switch (tier) {
      case 'PLATINUM': return 'text-purple-400 bg-purple-500/20 border-purple-500/40';
      case 'GOLD': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
      case 'SILVER': return 'text-gray-400 bg-gray-500/20 border-gray-500/40';
      default: return 'text-blue-400 bg-blue-500/20 border-blue-500/40';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Guest Management</h1>
          <p className="text-sm text-slate-400">
            Manage guest profiles, history, and preferences
          </p>
        </div>
        <button
          onClick={() => setShowGuestForm(true)}
          className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-xl font-medium transition"
        >
          + Add Guest
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-cardBg border border-slate-800 rounded-2xl p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search guests by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={fetchGuests}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
          >
            Search
          </button>
        </div>
      </div>

      {/* Guest List */}
      {activeTab === 'list' && (
        <div className="bg-cardBg border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading guests...</div>
          ) : guests.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              {searchTerm ? 'No guests found matching your search' : 'No guests found'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Guest</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Contact</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Loyalty</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Stays</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map(guest => (
                    <tr key={guest._id} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                      <td className="p-4">
                        <div className="font-medium">
                          {guest.firstName} {guest.lastName}
                        </div>
                        <div className="text-sm text-slate-400">
                          {guest.idType}: {guest.idNumber}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{guest.phone}</div>
                        <div className="text-sm text-slate-400">{guest.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs border ${getLoyaltyColor(guest.loyaltyTier)}`}>
                          {guest.loyaltyTier}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {guest.totalStays || 0} stays
                        </div>
                        <div className="text-xs text-slate-400">
                          {guest.totalNights || 0} nights
                        </div>
                      </td>
                      <td className="p-4">
                        {guest.isBlacklisted ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/40">
                            Blacklisted
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/40">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => fetchGuestDetails(guest._id)}
                          className="px-3 py-1 bg-primary hover:bg-primaryDark text-white text-xs rounded-lg transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Guest Details */}
      {activeTab === 'details' && selectedGuest && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('list')}
                className="text-slate-400 hover:text-slate-200"
              >
                ← Back to List
              </button>
              <h2 className="text-xl font-semibold">
                {selectedGuest.guest.firstName} {selectedGuest.guest.lastName}
              </h2>
            </div>
            <div className="flex gap-2">
              {selectedGuest.guest.isBlacklisted ? (
                <button
                  onClick={handleRemoveBlacklist}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition"
                >
                  Remove Blacklist
                </button>
              ) : (
                <button
                  onClick={() => setShowBlacklistModal(true)}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition"
                >
                  Blacklist
                </button>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-semibold text-primary">{selectedGuest.statistics.totalStays}</div>
              <div className="text-sm text-slate-400">Total Stays</div>
            </div>
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-semibold text-primary">{selectedGuest.statistics.totalNights}</div>
              <div className="text-sm text-slate-400">Total Nights</div>
            </div>
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-semibold text-primary">₹{selectedGuest.statistics.totalSpent}</div>
              <div className="text-sm text-slate-400">Total Spent</div>
            </div>
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-4 text-center">
              <div className="text-2xl font-semibold text-primary">{selectedGuest.statistics.averageStay}</div>
              <div className="text-sm text-slate-400">Avg. Stay (nights)</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Guest Information */}
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Guest Information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Phone</label>
                    <div className="font-medium">{selectedGuest.guest.phone}</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Email</label>
                    <div className="font-medium">{selectedGuest.guest.email || 'Not provided'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">ID Type</label>
                    <div className="font-medium">{selectedGuest.guest.idType}</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">ID Number</label>
                    <div className="font-medium">{selectedGuest.guest.idNumber}</div>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Address</label>
                  <div className="font-medium">
                    {selectedGuest.guest.address && `${selectedGuest.guest.address}, ${selectedGuest.guest.city}, ${selectedGuest.guest.state} - ${selectedGuest.guest.pincode}`}
                    {!selectedGuest.guest.address && 'Not provided'}
                  </div>
                </div>
                {selectedGuest.guest.isBlacklisted && (
                  <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-3">
                    <div className="text-red-400 font-semibold">Blacklisted</div>
                    <div className="text-sm text-red-300">{selectedGuest.guest.blacklistReason}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Stay History */}
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Stay History</h3>
              {selectedGuest.reservations.length === 0 ? (
                <div className="text-center text-slate-400 py-4">No stay history</div>
              ) : (
                <div className="space-y-3">
                  {selectedGuest.reservations.slice(0, 5).map(reservation => (
                    <div key={reservation._id} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                      <div>
                        <div className="font-medium">Room {reservation.room?.number}</div>
                        <div className="text-sm text-slate-400">
                          {new Date(reservation.checkInDate).toLocaleDateString()} - {new Date(reservation.checkOutDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{reservation.totalAmount || 0}</div>
                        <div className={`text-xs ${
                          reservation.status === 'CHECKED_OUT' ? 'text-green-400' :
                          reservation.status === 'CHECKED_IN' ? 'text-blue-400' :
                          'text-amber-400'
                        }`}>
                          {reservation.status.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {showGuestForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-cardBg border border-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add New Guest</h2>
              <button
                onClick={() => setShowGuestForm(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGuest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={guestForm.firstName}
                    onChange={(e) => setGuestForm({...guestForm, firstName: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={guestForm.lastName}
                    onChange={(e) => setGuestForm({...guestForm, lastName: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={guestForm.phone}
                    onChange={(e) => setGuestForm({...guestForm, phone: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={guestForm.email}
                    onChange={(e) => setGuestForm({...guestForm, email: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">ID Type</label>
                  <select
                    value={guestForm.idType}
                    onChange={(e) => setGuestForm({...guestForm, idType: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="AADHAAR">Aadhaar</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="DRIVING_LICENSE">Driving License</option>
                    <option value="VOTER_ID">Voter ID</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">ID Number</label>
                  <input
                    type="text"
                    value={guestForm.idNumber}
                    onChange={(e) => setGuestForm({...guestForm, idNumber: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primaryDark text-white font-medium py-3 rounded-xl transition disabled:opacity-50"
                >
                  {loading ? 'Creating Guest...' : 'Create Guest'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGuestForm(false)}
                  className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blacklist Modal */}
      {showBlacklistModal && selectedGuest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-cardBg border border-slate-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Blacklist Guest</h3>
            <p className="text-slate-400 mb-4">
              Are you sure you want to blacklist {selectedGuest.guest.firstName} {selectedGuest.guest.lastName}?
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Reason for blacklisting..."
                id="blacklistReason"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handleBlacklist(document.getElementById('blacklistReason').value)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-xl transition"
                >
                  Confirm Blacklist
                </button>
                <button
                  onClick={() => setShowBlacklistModal(false)}
                  className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
