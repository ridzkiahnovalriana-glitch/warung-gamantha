// src/components/StockView.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { Archive, PlusCircle, CheckCircle2 } from 'lucide-react';

export default function StockView() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [restockQty, setRestockQty] = useState('');

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
    } catch (error) {}
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRestock = async (e) => {
    e.preventDefault();
    if (!selectedProductId || !restockQty || Number(restockQty) <= 0) {
      alert("Pilih barang dan masukkan jumlah restock yang valid!");
      return;
    }

    try {
      const productRef = doc(db, "products", selectedProductId);
      await updateDoc(productRef, {
        stock: increment(Number(restockQty))
      });

      await addDoc(collection(db, "stock_logs"), {
        productId: selectedProductId,
        addedStock: Number(restockQty),
        createdAt: serverTimestamp()
      });

      alert("Stok berhasil ditambah (Restock sukses)!");
      setSelectedProductId('');
      setRestockQty('');
      fetchProducts();
    } catch (error) {
      console.error("Gagal menambah stok:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-4">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800">Manajemen Stok Masuk (Restock)</h2>
        <p className="text-sm text-slate-500 mt-1">Tambah stok barang kulakan dari pemasok secara real-time</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
        <form onSubmit={handleRestock} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2">Pilih Barang Sembako</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-inner"
              required
            >
              <option value="">-- Pilih Barang Dagangan --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stok Saat Ini: {p.stock} Unit)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2">Jumlah Stok Masuk (Qty)</label>
            <input
              type="number"
              min="1"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              placeholder="Contoh: 10"
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-inner"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-rose-700 hover:bg-rose-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-rose-900/30 text-sm flex items-center justify-center space-x-2 hover:-translate-y-0.5"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Konfirmasi Tambah Stok</span>
          </button>
        </form>
      </div>
    </div>
  );
}