// src/components/PosView.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Search, Plus, Minus, ShoppingBag, Printer, CheckCircle2, X, Trash2 } from 'lucide-react';

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

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
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

  const handlePrint = () => { window.print(); };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* BAGIAN KIRI: KATALOG PRODUK (Mengambil 7 kolom dari 12 di Desktop) */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-5">
        {/* Header POS & Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Pilih Pesanan</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">Klik item untuk menambahkan ke keranjang</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100/60 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Tab Kategori */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-rose-700 text-white shadow-md shadow-rose-700/30'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Produk */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[600px] overflow-y-auto pr-1 pb-4">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              className="group bg-white rounded-2xl p-3.5 shadow-sm hover:shadow-md border border-slate-200/80 cursor-pointer transition-all duration-300 flex flex-col justify-between h-36 hover:-translate-y-1"
            >
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[9px] font-bold tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    {product.category || 'UMUM'}
                  </span>
                  {product.stock <= 5 && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  )}
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-800 leading-tight group-hover:text-rose-700 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-400">Stok: {product.stock}</p>
                <p className="text-rose-700 font-extrabold text-sm sm:text-base">Rp {Number(product.price).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BAGIAN KANAN: KERANJANG / DETAIL PESANAN (Mengambil 5 kolom dari 12 di Desktop) */}
      <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col overflow-hidden">
        {/* Header Keranjang */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-rose-600" />
            <h2 className="font-extrabold text-base text-slate-800">Detail Pesanan</h2>
          </div>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
            {cart.reduce((sum, item) => sum + item.qty, 0)} Item
          </span>
        </div>

        {/* List Item di Keranjang (Diberi Batasan Tinggi Agar Proporsional) */}
        <div className="max-h-[280px] overflow-y-auto p-3.5 space-y-2.5 bg-slate-50/30 divide-y divide-slate-100">
          {cart.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-400">Keranjang masih kosong</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="pt-2.5 first:pt-0 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="pr-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 leading-snug">{item.name}</h4>
                    <p className="text-xs font-bold text-rose-600 mt-0.5">Rp {Number(item.price).toLocaleString()}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-xs pb-1">
                  <span className="text-slate-500 font-medium">Sub: <strong className="text-slate-700">Rp {(item.price * item.qty).toLocaleString()}</strong></span>
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                    <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-rose-600"><Minus className="w-3 h-3" /></button>
                    <span className="w-7 text-center text-xs font-bold text-slate-800">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-rose-600"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Panel Checkout Terpadu di Bawah */}
        <div className="bg-white p-4 sm:p-5 border-t border-slate-200 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-slate-700">Total Tagihan</span>
            <span className="font-black text-lg text-rose-700">Rp {subtotal.toLocaleString()}</span>
          </div>

          <div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
              <input
                type="number"
                value={cash || ''}
                onChange={(e) => setCash(Number(e.target.value))}
                placeholder="Nominal Uang Tunai"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center px-3.5 py-2 bg-rose-50/60 border border-rose-100 rounded-xl text-xs">
            <span className="font-bold text-rose-800/80 uppercase">Kembalian</span>
            <span className={`font-black ${change >= 0 ? 'text-rose-700' : 'text-red-500'}`}>
              Rp {change >= 0 ? change.toLocaleString() : '0'}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || cash < subtotal}
            className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex justify-center items-center gap-2 transition-all ${
              cart.length === 0 || cash < subtotal 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-rose-700 hover:bg-rose-800 text-white shadow-md shadow-rose-900/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Proses Pembayaran
          </button>
        </div>
      </div>

      {/* MODAL STRUK (SOLID OVERLAY) */}
      {showReceiptModal && completedTx && (
        <div className="modal-overlay-fixed animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative z-50">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-base text-slate-800">Transaksi Sukses</h3>
              <button onClick={() => setShowReceiptModal(false)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div id="printable-receipt" className="bg-slate-50 p-5 rounded-2xl font-mono text-xs text-slate-800 space-y-3 border border-slate-200">
              <div className="text-center space-y-1 mb-4">
                <h4 className="font-black text-sm">WARUNG SEMBAKO GAMANTHA</h4>
                <p className="text-[10px] text-slate-500">Jl. Sambong Girang, Mangkubumi</p>
                <p className="text-[10px] text-slate-500">{new Date().toLocaleString()}</p>
              </div>
              <div className="border-y border-dashed border-slate-300 py-3 space-y-2">
                {completedTx.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between leading-tight">
                    <span className="truncate pr-2">{item.name} <br/><span className="text-[9px] text-slate-500">{item.qty} x Rp {item.price.toLocaleString()}</span></span>
                    <span className="font-bold">Rp {(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between font-black text-sm">
                  <span>TOTAL</span>
                  <span>Rp {completedTx.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-semibold text-[11px]">
                  <span>TUNAI</span>
                  <span>Rp {completedTx.cashPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-semibold text-[11px]">
                  <span>KEMBALI</span>
                  <span>Rp {completedTx.change.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2.5 pt-4">
              <button onClick={handlePrint} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5">
                <Printer className="w-3.5 h-3.5" /> Cetak
              </button>
              <button onClick={() => setShowReceiptModal(false)} className="flex-1 bg-rose-700 hover:bg-rose-800 text-white py-2.5 rounded-xl font-bold text-xs transition-all">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}