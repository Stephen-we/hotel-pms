import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function UserDevices() {
  const [devices, setDevices] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  const load = async () => {
    const res = await api.get("/devices");
    setDevices(res.data.filter((d) => d.userEmail === user.email));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">My Devices</h1>

      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        {devices.map((d) => (
          <div
            key={d.deviceId}
            className="p-4 mb-3 bg-slate-700/40 rounded-xl border border-slate-600"
          >
            <div className="text-lg">{d.deviceName}</div>
            <div className="text-sm text-slate-400">
              {d.os} — {d.browser}
            </div>

            <div className="text-sm mt-2">IP: {d.ipAddress}</div>
            <div className="text-sm">Last Login: {new Date(d.lastLogin).toLocaleString()}</div>

            <div className="mt-3">
              {d.isVerified ? (
                <span className="text-green-400">Verified</span>
              ) : (
                <span className="text-yellow-400">Pending Verification</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
