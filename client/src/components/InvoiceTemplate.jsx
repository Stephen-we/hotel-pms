import React from 'react';

const InvoiceTemplate = ({ order, hotelInfo, onPrint }) => {
  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = hotelInfo?.taxRate || 5;
    const tax = (subtotal * taxRate) / 100;
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateTotals(order.items || []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white text-gray-800 p-8 max-w-4xl mx-auto shadow-lg" id="invoice-template">
      {/* Header */}
      <div className="border-b-2 border-gray-300 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{hotelInfo?.hotelName || 'Hotel PMS'}</h1>
            <p className="text-gray-600">{hotelInfo?.address || 'Hotel Address'}</p>
            <p className="text-gray-600">Phone: {hotelInfo?.phone || '+91 XXXXXXXXXX'}</p>
            <p className="text-gray-600">GSTIN: {hotelInfo?.gstin || 'XXAAAAA0000X1X2'}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-blue-600">TAX INVOICE</h2>
            <p className="text-gray-600">Invoice #: {order.invoiceNumber}</p>
            <p className="text-gray-600">Date: {formatDate(order.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Customer & Order Info */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="font-semibold text-lg mb-2">Bill To:</h3>
          <p className="font-medium">{order.guestName || 'Walk-in Customer'}</p>
          {order.roomNumber && (
            <p className="text-gray-600">Room: {order.roomNumber}</p>
          )}
          {order.guestPhone && (
            <p className="text-gray-600">Phone: {order.guestPhone}</p>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Order Details:</h3>
          <p><strong>Order ID:</strong> {order.orderNumber}</p>
          <p><strong>Service Type:</strong> {order.serviceType || 'Restaurant'}</p>
          <p><strong>Staff:</strong> {order.staffName || 'System'}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Item Description</th>
              <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Qty</th>
              <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Unit Price (₹)</th>
              <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  ₹{item.price.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b">
            <span className="font-semibold">Subtotal:</span>
            <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span>GST ({hotelInfo?.taxRate || 5}%):</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 text-lg font-bold border-t-2 border-gray-300">
            <span>Total Amount:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      {order.paymentMethod && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Payment Information:</h3>
          <p><strong>Method:</strong> {order.paymentMethod}</p>
          {order.transactionId && (
            <p><strong>Transaction ID:</strong> {order.transactionId}</p>
          )}
          <p><strong>Status:</strong> <span className="text-green-600 font-semibold">PAID</span></p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-6 text-center text-gray-600">
        <p className="font-semibold">Thank you for your business!</p>
        <p>For any queries, please contact {hotelInfo?.phone || 'our front desk'}</p>
        <p className="text-sm mt-2">This is a computer generated invoice</p>
      </div>

      {/* Print Button */}
      <div className="mt-6 text-center no-print">
        <button
          onClick={onPrint}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
        >
          🖨️ Print Invoice
        </button>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
