import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminDevices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    try {
      const res = await api.get("/devices");
      setDevices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveDevice = async (deviceId) => {
    try {
      await api.post(`/devices/${deviceId}/approve`, {
        approvedBy: JSON.parse(localStorage.getItem("user"))._id
      });
      fetchDevices();
    } catch (err) {
      console.error(err);
    }
  };

  const blockDevice = async (deviceId) => {
    const reason = prompt("Enter reason for blocking device:");
    if (!reason) return;

    try {
      await api.post(`/devices/${deviceId}/block`, { reason });
      fetchDevices();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  if (loading) return <div className="p-6">Loading devices...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">All Registered Devices</h1>

      <div className="overflow-x-auto bg-slate-800 border border-slate-700 rounded-xl p-4">
        <table className="w-full text-sm text-slate-300">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="p-2 text-left">User</th>
              <th className="p-2">Device</th>
              <th className="p-2">OS</th>
              <th className="p-2">Browser</th>
              <th className="p-2">IP</th>
              <th className="p-2">Verified</th>
              <th className="p-2">Blocked</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {devices.map((d) => (
              <tr key={d.deviceId} className="border-b border-slate-700 hover:bg-slate-700/40">
                <td className="p-2">{d.userName} <br /> {d.userEmail}</td>
                <td className="p-2">{d.deviceName}</td>
                <td className="p-2">{d.os}</td>
                <td className="p-2">{d.browser}</td>
                <td className="p-2">{d.ipAddress}</td>
                <td className="p-2">{d.isVerified ? "✅" : "❌"}</td>
                <td className="p-2">{d.isBlocked ? "⛔" : "—"}</td>

                <td className="p-2 space-x-2">
                  {!d.isVerified && (
                    <button
                      className="px-3 py-1 bg-green-600 rounded"
                      onClick={() => approveDevice(d.deviceId)}
                    >
                      Approve
                    </button>
                  )}

                  {!d.isBlocked && (
                    <button
                      className="px-3 py-1 bg-red-600 rounded"
                      onClick={() => blockDevice(d.deviceId)}
                    >
                      Block
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
