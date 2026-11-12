// src/components/HistoryView.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { History, Eye, ShoppingCart, X } from 'lucide-react';

export default function HistoryView() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(list);
      } catch (error) {
        console.error("Gagal mengambil riwayat transaksi:", error);
      }
    };
    fetchTransactions();
  }, []);

  const filteredTx = transactions.filter(tx => 
    tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(tx.total).includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Riwayat Transaksi</h2>
          <p className="text-sm text-slate-500 mt-1">Audit dan daftar seluruh transaksi kasir Warung Gamantha</p>
        </div>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Cari ID Transaksi / Total Harga..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-600 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                <th className="p-4 sm:p-5">ID Transaksi</th>
                <th className="p-4 sm:p-5">Waktu</th>
                <th className="p-4 sm:p-5">Total Belanja</th>
                <th className="p-4 sm:p-5">Tunai / Kembali</th>
                <th className="p-4 sm:p-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-slate-400 font-medium">Belum ada riwayat transaksi tercatat.</td>
                </tr>
              ) : (
                filteredTx.map(tx => (
                  <tr key={tx.id} className="hover:bg-rose-50/50 transition-colors">
                    <td className="p-4 sm:p-5 font-mono text-xs text-slate-500 font-semibold">{tx.id.substring(0, 12)}...</td>
                    <td className="p-4 sm:p-5 text-xs text-slate-600 font-medium">
                      {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleString() : 'Baru saja'}
                    </td>
                    <td className="p-4 sm:p-5 text-rose-700 font-extrabold">Rp {Number(tx.total).toLocaleString()}</td>
                    <td className="p-4 sm:p-5 text-xs text-slate-600 font-medium">
                      Rp {Number(tx.cashPaid).toLocaleString()} / <span className="text-rose-600 font-bold">Rp {Number(tx.change).toLocaleString()}</span>
                    </td>
                    <td className="p-4 sm:p-5 text-center">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Transaksi - TANPA BLUR (Solid Overlay) */}
      {selectedTx && (
        <div className="modal-overlay-fixed animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative z-50">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3 text-rose-800">
                <div className="p-2 bg-rose-100 rounded-lg"><ShoppingCart className="w-5 h-5" /></div>
                <h3 className="font-extrabold text-lg text-slate-800">Detail Transaksi</h3>
              </div>
              <button onClick={() => setSelectedTx(null)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm space-y-1 text-slate-700">
                <p><span className="font-bold text-slate-900">ID:</span> <span className="font-mono text-xs">{selectedTx.id}</span></p>
                <p><span className="font-bold text-slate-900">Waktu:</span> {selectedTx.createdAt?.toDate ? selectedTx.createdAt.toDate().toLocaleString() : 'Baru saja'}</p>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Item Belanja</h4>
                <div className="divide-y divide-slate-200 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-white shadow-inner">
                  {selectedTx.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Qty: {item.qty} × Rp {Number(item.price).toLocaleString()}</p>
                      </div>
                      <span className="font-extrabold text-rose-700">Rp {(item.qty * item.price).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between font-extrabold text-base text-slate-900">
                  <span>Total Belanja:</span>
                  <span className="text-rose-700">Rp {Number(selectedTx.total).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-600 pt-2 border-t border-slate-200">
                  <span>Tunai Dibayar:</span>
                  <span>Rp {Number(selectedTx.cashPaid).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-600">
                  <span>Uang Kembali:</span>
                  <span>Rp {Number(selectedTx.change).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3.5 rounded-xl font-bold transition-all shadow-md"
            >
              Tutup Detail
            </button>
          </div>
        </div>
      )}
    </div>
  );
}