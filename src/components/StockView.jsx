// src/components/StockView.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { Archive, PlusCircle } from 'lucide-react';

export default function StockView() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [restockQty, setRestockQty] = useState('');

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProducts(list);
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
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Manajemen Stok Masuk (Restock)</h2>
        <p className="text-sm text-slate-500">Tambah stok barang kulakan dari pemasok</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleRestock} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Pilih Barang Sembako</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              required
            >
              <option value="">-- Pilih Barang --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stok Saat Ini: {p.stock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Jumlah Stok Masuk (Qty)</label>
            <input
              type="number"
              min="1"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              placeholder="Contoh: 10"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm text-sm flex items-center justify-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Stok Barang</span>
          </button>
        </form>
      </div>
    </div>
  );
}