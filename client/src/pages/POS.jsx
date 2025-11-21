import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function POS() {
  const [activeTab, setActiveTab] = useState('menu');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Current order state
  const [currentOrder, setCurrentOrder] = useState({
    type: 'RESTAURANT',
    reservation: '',
    guest: '',
    room: '',
    items: [],
    paymentMethod: 'CASH',
    notes: ''
  });

  // Fetch data
  useEffect(() => {
    fetchProducts();
    fetchTodayOrders();
    fetchTodayReservations();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?available=true');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchTodayOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
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

  const addToOrder = (product) => {
    const existingItem = currentOrder.items.find(item => item.product._id === product._id);
    
    if (existingItem) {
      // Increase quantity
      setCurrentOrder(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }));
    } else {
      // Add new item
      setCurrentOrder(prev => ({
        ...prev,
        items: [...prev.items, {
          product,
          quantity: 1,
          price: product.price,
          notes: ''
        }]
      }));
    }
  };

  const removeFromOrder = (productId) => {
    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.filter(item => item.product._id !== productId)
    }));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromOrder(productId);
      return;
    }
    
    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.product._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    }));
  };

  const calculateTotals = () => {
    const subtotal = currentOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const handleCreateOrder = async () => {
    if (currentOrder.items.length === 0) {
      alert('Please add items to the order');
      return;
    }

    setLoading(true);
    try {
      const totals = calculateTotals();
      
      const orderData = {
        ...currentOrder,
        ...totals,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: currentOrder.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes
        }))
      };

      await api.post('/orders', orderData);
      
      // Reset order
      setCurrentOrder({
        type: 'RESTAURANT',
        reservation: '',
        guest: '',
        room: '',
        items: [],
        paymentMethod: 'CASH',
        notes: ''
      });
      
      // Refresh orders list
      await fetchTodayOrders();
      
      alert('Order created successfully!');
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (orderId, paymentMethod) => {
    try {
      await api.post(`/orders/${orderId}/payment`, {
        paymentStatus: 'PAID',
        paymentMethod
      });
      await fetchTodayOrders();
      alert('Payment processed successfully!');
    } catch (err) {
      console.error('Error processing payment:', err);
      alert('Failed to process payment.');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.post(`/orders/${orderId}/status`, { status: newStatus });
      await fetchTodayOrders();
      alert('Order status updated!');
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status.');
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  const categories = {
    FOOD: '🍽️ Food',
    BEVERAGE: '🥤 Beverages',
    SERVICE: '🔧 Services',
    AMENITY: '🏨 Amenities'
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">POS & Billing</h1>
          <p className="text-sm text-slate-400">
            Restaurant, room service, and additional charges
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
            activeTab === 'menu'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('menu')}
        >
          🍽️ Menu & Order
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'orders'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setActiveTab('orders')}
        >
          📋 Orders
        </button>
      </div>

      {/* Menu & Order Tab */}
      {activeTab === 'menu' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Menu */}
          <div className="lg:col-span-2">
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Menu</h2>
              
              {Object.entries(categories).map(([category, label]) => {
                const categoryProducts = products.filter(p => p.category === category);
                if (categoryProducts.length === 0) return null;
                
                return (
                  <div key={category} className="mb-6">
                    <h3 className="text-md font-semibold mb-3 text-slate-300">{label}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryProducts.map(product => (
                        <div
                          key={product._id}
                          className="bg-slate-900/50 border border-slate-700 rounded-xl p-3 hover:border-primary/60 transition cursor-pointer"
                          onClick={() => addToOrder(product)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm font-semibold">₹{product.price}</div>
                          </div>
                          {product.description && (
                            <div className="text-sm text-slate-400">{product.description}</div>
                          )}
                          <div className="text-xs text-primary mt-2 text-center">
                            Click to Add
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Order */}
          <div className="space-y-4">
            <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Current Order</h2>
              
              {/* Order Details */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Order Type</label>
                  <select
                    value={currentOrder.type}
                    onChange={(e) => setCurrentOrder(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="RESTAURANT">Restaurant</option>
                    <option value="ROOM_SERVICE">Room Service</option>
                    <option value="BAR">Bar</option>
                    <option value="SERVICE">Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Charge to Room (Optional)</label>
                  <select
                    value={currentOrder.reservation}
                    onChange={(e) => {
                      const reservation = reservations.find(r => r._id === e.target.value);
                      setCurrentOrder(prev => ({
                        ...prev,
                        reservation: e.target.value,
                        guest: reservation?.guest?._id || '',
                        room: reservation?.room?._id || ''
                      }));
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="">Select Room</option>
                    {reservations.filter(r => r.status === 'CHECKED_IN').map(reservation => (
                      <option key={reservation._id} value={reservation._id}>
                        Room {reservation.room?.number} - {reservation.guest?.firstName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2 mb-4">
                <h3 className="text-sm font-semibold text-slate-300">Order Items</h3>
                {currentOrder.items.length === 0 ? (
                  <div className="text-center text-slate-400 py-4 text-sm">
                    No items added to order
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-900/30 rounded-lg p-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.product.name}</div>
                          <div className="text-xs text-slate-400">₹{item.price} each</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                            className="w-6 h-6 bg-slate-700 rounded text-xs"
                          >
                            -
                          </button>
                          <span className="text-sm w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            className="w-6 h-6 bg-slate-700 rounded text-xs"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromOrder(item.product._id)}
                            className="w-6 h-6 bg-red-500/20 text-red-400 rounded text-xs ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totals */}
              {currentOrder.items.length > 0 && (
                <div className="border-t border-slate-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (5%):</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-slate-700 pt-2">
                    <span>Total:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={handleCreateOrder}
                  disabled={loading || currentOrder.items.length === 0}
                  className="w-full bg-primary hover:bg-primaryDark text-white font-medium py-3 rounded-xl transition disabled:opacity-50"
                >
                  {loading ? 'Creating Order...' : 'Create Order'}
                </button>
                
                {currentOrder.items.length > 0 && (
                  <button
                    onClick={() => setCurrentOrder(prev => ({ ...prev, items: [] }))}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl text-sm transition"
                  >
                    Clear Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-cardBg border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Today's Orders</h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No orders for today.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order._id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                    <div>
                      <div className="font-semibold">Order #{order.orderNumber}</div>
                      <div className="text-sm text-slate-400">
                        {order.type.replace('_', ' ')} • {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                      {order.reservation && (
                        <div className="text-sm text-slate-400">
                          Room {order.room?.number} • {order.guest?.firstName}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs border ${
                        order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400 border-green-500/40' :
                        order.status === 'PREPARING' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' :
                        order.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                        'bg-slate-500/20 text-slate-400 border-slate-500/40'
                      }`}>
                        {order.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs border ${
                        order.paymentStatus === 'PAID' ? 'bg-green-500/20 text-green-400 border-green-500/40' :
                        'bg-red-500/20 text-red-400 border-red-500/40'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm py-1">
                        <span>{item.quantity}x {item.product?.name}</span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="flex justify-between font-semibold border-t border-slate-700 pt-2">
                    <span>Total:</span>
                    <span>₹{order.total?.toFixed(2)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {order.paymentStatus !== 'PAID' && (
                      <button
                        onClick={() => handleProcessPayment(order._id, 'CASH')}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg transition"
                      >
                        Mark as Paid
                      </button>
                    )}
                    {order.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'COMPLETED')}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition"
                      >
                        Complete
                      </button>
                    )}
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'PREPARING')}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded-lg transition"
                      >
                        Start Prep
                      </button>
                    )}
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
