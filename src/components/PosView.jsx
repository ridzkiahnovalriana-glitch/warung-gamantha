// src/components/PosView.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Search, Plus, Minus, ShoppingBag, Printer, CheckCircle2, X } from 'lucide-react';

const CATEGORIES = ['Semua', 'Sembako', 'Minuman', 'Rokok', 'Kebutuhan Rumah Tangga'];

export default function PosView() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [cash, setCash] = useState(0);

  const [completedTx, setCompletedTx] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
    } catch (error) {}
  };

  useEffect(() => { fetchProducts(); }, []);

  const addToCart = (product) => {
    if (product.stock <= 0) return alert("Stok barang habis!");
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.qty >= product.stock) return alert("Jumlah melebihi stok yang tersedia!");
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        if (newQty > item.stock) { alert("Melebihi stok gudang!"); return item; }
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const change = cash - subtotal;

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Keranjang masih kosong!");
    if (cash < subtotal) return alert("Uang tunai kurang!");

    try {
      const txData = { items: cart, total: subtotal, cashPaid: cash, change: change, createdAt: new Date() };
      const docRef = await addDoc(collection(db, "transactions"), { ...txData, createdAt: serverTimestamp() });

      for (const item of cart) {
        const productRef = doc(db, "products", item.id);
        const newStock = item.stock - item.qty;
        await updateDoc(productRef, { stock: newStock });
      }

      setCompletedTx({ id: docRef.id, ...txData });
      setShowReceiptModal(true);
      setCart([]); setCash(0); fetchProducts();
    } catch (error) { alert("Terjadi kesalahan sistem."); }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Kolom Katalog Produk */}
      <div className="lg:col-span-2 space-y-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Terminal Kasir</h2>
          <p className="text-sm text-slate-500 mt-1">Sistem Point of Sales (POS)</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-rose-700 text-white shadow-md shadow-rose-900/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Produk dengan Efek Lift Hover */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2 pb-4">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-rose-300 cursor-pointer transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded-md mb-2 inline-block">
                  {product.category || 'Sembako'}
                </span>
                <h3 className="font-bold text-sm text-slate-800 line-clamp-2 mt-1 group-hover:text-rose-700 transition-colors">{product.name}</h3>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-rose-700 font-extrabold text-sm sm:text-base">Rp {Number(product.price).toLocaleString()}</span>
                <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${product.stock > 5 ? 'bg-slate-100 text-slate-600' : 'bg-rose-100 text-rose-700'}`}>
                  Stok: {product.stock}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kolom Keranjang Belanja */}
      <div className="bg-white border-t-4 border-t-rose-700 border-x border-b border-slate-200 rounded-2xl shadow-lg flex flex-col h-full max-h-[700px]">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-3 rounded-t-xl">
          <div className="p-2 bg-rose-100 text-rose-700 rounded-lg shadow-inner">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h2 className="font-extrabold text-base text-slate-800">Keranjang Belanja</h2>
        </div>

        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-400">Keranjang masih kosong</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex-1 pr-3">
                  <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-rose-600 font-semibold mt-0.5">Rp {Number(item.price).toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
                  <button onClick={() => updateQty(item.id, -1)} className="p-1 sm:p-1.5 bg-white shadow-sm rounded-md hover:bg-slate-100 text-slate-600 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="p-1 sm:p-1.5 bg-white shadow-sm rounded-md hover:bg-slate-100 text-slate-600 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-200 rounded-b-2xl space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold">Total Tagihan</span>
            <span className="text-xl font-extrabold text-rose-700">Rp {subtotal.toLocaleString()}</span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5">Uang Tunai (Rp)</label>
            <input
              type="number"
              value={cash || ''}
              onChange={(e) => setCash(Number(e.target.value))}
              placeholder="0"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-inner"
            />
          </div>

          <div className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-xl">
            <span className="text-sm font-semibold text-slate-500">Kembalian</span>
            <span className={`text-lg font-extrabold ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              Rp {change >= 0 ? change.toLocaleString() : '0'}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-rose-700 hover:bg-rose-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-rose-900/30 text-sm sm:text-base flex justify-center items-center space-x-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Selesaikan Pembayaran</span>
          </button>
        </div>
      </div>

      {/* MODAL STRUK (TANPA BLUR) */}
      {showReceiptModal && completedTx && (
        <div className="modal-overlay-fixed animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-800">Transaksi Sukses</h3>
              <button onClick={() => setShowReceiptModal(false)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div id="printable-receipt" className="bg-slate-50 p-5 rounded-xl font-mono text-xs text-slate-800 space-y-3 border border-slate-200">
              <div className="text-center space-y-1 mb-4">
                <h4 className="font-extrabold text-sm">WARUNG SEMBAKO GAMANTHA</h4>
                <p className="text-[10px] text-slate-500">Jl. Sambong Girang, Mangkubumi</p>
                <p className="text-[10px] text-slate-500">{new Date().toLocaleString()}</p>
              </div>
              <div className="border-y border-dashed border-slate-300 py-3 space-y-2">
                {completedTx.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate pr-2">{item.name} <br/><span className="text-[10px] text-slate-500">{item.qty} x Rp {item.price.toLocaleString()}</span></span>
                    <span className="font-semibold">Rp {(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between font-extrabold text-sm">
                  <span>TOTAL</span>
                  <span>Rp {completedTx.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>TUNAI</span>
                  <span>Rp {completedTx.cashPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>KEMBALI</span>
                  <span>Rp {completedTx.change.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button onClick={handlePrint} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2">
                <Printer className="w-4 h-4" />
                <span>Cetak Struk</span>
              </button>
              <button onClick={() => setShowReceiptModal(false)} className="flex-1 bg-rose-700 hover:bg-rose-800 text-white py-3 rounded-xl font-bold text-sm transition-all">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}