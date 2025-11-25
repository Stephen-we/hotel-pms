import React from 'react';
import InvoiceTemplate from './InvoiceTemplate';
import usePrint from './usePrint';

const InvoiceModal = ({ order, hotelInfo, isOpen, onClose }) => {
  const { printableRef, handlePrint } = usePrint();

  if (!isOpen) return null;

  // Default hotel info if not provided
  const defaultHotelInfo = {
    hotelName: hotelInfo?.hotelName || 'Grand Hotel',
    address: hotelInfo?.address || '123 Hotel Street, City, State - 560001',
    phone: hotelInfo?.phone || '+91 9876543210',
    gstin: hotelInfo?.gstin || '29AABCU9603R1ZN',
    taxRate: hotelInfo?.taxRate || 5
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Invoice Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              🖨️ Print Invoice
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div ref={printableRef}>
          <InvoiceTemplate 
            order={order} 
            hotelInfo={defaultHotelInfo}
            onPrint={handlePrint}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
