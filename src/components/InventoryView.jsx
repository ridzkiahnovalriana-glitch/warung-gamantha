// src/components/InventoryView.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';

// Kategori disamakan persis dengan yang ada di Kasir POS
const CATEGORIES = ['Sembako', 'Minuman', 'Rokok', 'Kebutuhan Rumah Tangga'];

export default function InventoryView() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Sembako',
    price: '',
    stock: ''
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      if (isEditing) {
        await updateDoc(doc(db, "products", currentId), payload);
        alert("Data barang berhasil diperbarui!");
      } else {
        await addDoc(collection(db, "products"), payload);
        alert("Barang baru berhasil ditambahkan!");
      }
      setIsOpenModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
    }
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentId(product.id);
    setFormData({
      code: product.code,
      name: product.name,
      category: product.category || 'Sembako',
      price: product.price,
      stock: product.stock
    });
    setIsOpenModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus barang ini?")) {
      await deleteDoc(doc(db, "products", id));
      fetchProducts();
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ code: '', name: '', category: 'Sembako', price: '', stock: '' });
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Manajemen Data Barang</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola katalog inventaris & kategori sembako Warung Gamantha</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsOpenModal(true); }}
          className="bg-rose-700 hover:bg-rose-800 text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center space-x-2 shadow-lg shadow-rose-900/20 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Barang Baru</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari barang berdasarkan nama..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm font-medium"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                <th className="p-4 sm:p-5">Kode</th>
                <th className="p-4 sm:p-5">Nama Barang</th>
                <th className="p-4 sm:p-5">Kategori</th>
                <th className="p-4 sm:p-5">Harga Jual</th>
                <th className="p-4 sm:p-5">Stok</th>
                <th className="p-4 sm:p-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-400 font-medium">Belum ada data barang.</td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-rose-50/40 transition-colors">
                    <td className="p-4 sm:p-5 font-mono text-xs text-slate-500 font-bold">{product.code}</td>
                    <td className="p-4 sm:p-5 font-bold text-slate-800">{product.name}</td>
                    <td className="p-4 sm:p-5">
                      <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg text-xs font-bold border border-rose-100">
                        {product.category || 'Sembako'}
                      </span>
                    </td>
                    <td className="p-4 sm:p-5 text-rose-700 font-black">Rp {Number(product.price).toLocaleString()}</td>
                    <td className="p-4 sm:p-5">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${product.stock > 5 ? 'bg-slate-100 text-slate-700' : 'bg-rose-100 text-rose-700'}`}>
                        {product.stock} Unit
                      </span>
                    </td>
                    <td className="p-4 sm:p-5 flex justify-center space-x-2">
                      <button onClick={() => handleEdit(product)} className="p-2 bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors shadow-sm">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors shadow-sm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOpenModal && (
        <div className="modal-overlay-fixed animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-5 relative z-50">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-xl text-slate-800">{isEditing ? 'Ubah Data Barang' : 'Tambah Barang Baru'}</h3>
              <button onClick={() => setIsOpenModal(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Kode Barang</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-inner"
                  placeholder="Contoh: BRG001"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Nama Barang</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-inner"
                  placeholder="Contoh: Beras Ramos 5kg"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Kategori Barang</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-inner"
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Harga Jual (Rp)</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-inner"
                  placeholder="Contoh: 65000"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Jumlah Stok Awal</label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-inner"
                  placeholder="Contoh: 20"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-xl font-bold text-sm transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-700 hover:bg-rose-800 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-rose-900/20"
                >
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}