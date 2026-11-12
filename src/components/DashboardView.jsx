// src/components/DashboardView.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { TrendingUp, ShoppingCart, AlertTriangle, PackageCheck } from 'lucide-react';

export default function DashboardView() {
  const [totalSalesToday, setTotalSalesToday] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const txQuery = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
        const txSnapshot = await getDocs(txQuery);
        const txList = txSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setTotalTransactions(txList.length);
        const sumSales = txList.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
        setTotalSalesToday(sumSales);
        setRecentTransactions(txList.slice(0, 5));

        const prodSnapshot = await getDocs(collection(db, "products"));
        const prodList = prodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const lowStock = prodList.filter(p => Number(p.stock) <= 5);
        setLowStockProducts(lowStock);
      } catch (error) {}
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Overview Bisnis</h2>
          <p className="text-sm text-slate-500 mt-1">Pantau performa Warung Sembako Gamantha hari ini</p>
        </div>
      </div>

      {/* Kartu Statistik yang Lebih Hidup (Tidak Monoton) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Pendapatan (Maroon/Rose) */}
        <div className="bg-gradient-to-br from-rose-600 to-rose-800 rounded-2xl p-5 shadow-lg shadow-rose-900/20 text-white transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-rose-100 text-sm font-medium mb-1">Total Pendapatan</p>
              <h3 className="text-2xl sm:text-3xl font-bold">Rp {totalSalesToday.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-xl"><TrendingUp className="w-6 h-6 text-white" /></div>
          </div>
        </div>

        {/* Card 2: Transaksi (Teal/Emerald) */}
        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-2xl p-5 shadow-lg shadow-teal-900/20 text-white transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-teal-100 text-sm font-medium mb-1">Total Transaksi</p>
              <h3 className="text-2xl sm:text-3xl font-bold">{totalTransactions}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-xl"><ShoppingCart className="w-6 h-6 text-white" /></div>
          </div>
        </div>

        {/* Card 3: Peringatan Stok (Orange/Amber) */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 shadow-lg shadow-orange-900/20 text-white transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-amber-100 text-sm font-medium mb-1">Stok Menipis (&le; 5)</p>
              <h3 className="text-2xl sm:text-3xl font-bold">{lowStockProducts.length}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-xl"><AlertTriangle className="w-6 h-6 text-white" /></div>
          </div>
        </div>
      </div>

      {/* Grid Tabel Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Peringatan Stok */}
        <div className="bg-white border-t-4 border-t-orange-500 rounded-xl shadow-md p-0 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-slate-800">Butuh Restock Segera</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto px-4 sm:px-5">
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center font-medium">Kondisi stok barang aman.</p>
            ) : (
              lowStockProducts.map(p => (
                <div key={p.id} className="py-3.5 flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-700">{p.name}</span>
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                    Sisa: {p.stock}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Riwayat Transaksi */}
        <div className="bg-white border-t-4 border-t-teal-500 rounded-xl shadow-md p-0 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-2">
            <PackageCheck className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-800">Transaksi Terbaru</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto px-4 sm:px-5">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center font-medium">Belum ada transaksi hari ini.</p>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="py-3.5 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-bold text-slate-800">Rp {Number(tx.total || 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Bayar: Rp {Number(tx.cashPaid || 0).toLocaleString()}
                    </p>
                  </div>
                  <span className="bg-teal-50 border border-teal-200 text-teal-700 px-2.5 py-1 rounded-md text-xs font-bold">
                    Sukses
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}