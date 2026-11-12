// src/App.jsx
import React, { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Package, Archive, History, Store, Sparkles } from 'lucide-react';

import DashboardView from './components/DashboardView';
import PosView from './components/PosView';
import InventoryView from './components/InventoryView';
import StockView from './components/StockView';
import HistoryView from './components/HistoryView';

export default function App() {
  const [activeTab, setActiveTab] = useState('pos');

  return (
    <div className="min-h-screen bg-mesh-pattern bg-slate-50 flex flex-col text-slate-800 relative selection:bg-rose-600 selection:text-white">
      {/* Dekorasi Cahaya Ambient Maroon Halus */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-300/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-300/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Header / Navbar Nuansa Maroon Minimalist */}
      <header className="bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 text-white shadow-lg sticky top-0 z-40 backdrop-blur-md bg-opacity-95 border-b border-rose-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 shadow-inner">
              <Store className="w-7 h-7 text-rose-100" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="font-extrabold text-base sm:text-lg tracking-wide">Warung Sembako Gamantha</h1>
                <Sparkles className="w-4 h-4 text-rose-300 animate-pulse" />
              </div>
              <p className="text-xs text-rose-100/80 font-medium">Jl. Sambong Girang, Mangkubumi</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-xs bg-rose-950/60 border border-rose-500/30 px-3 py-1.5 rounded-full font-medium shadow-inner">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
            <span>Developer: Ridzki Ahnovalrian Arifin (2503010031)</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/80 p-3 lg:h-fit sticky lg:top-24 z-30">
          <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'dashboard' ? 'bg-gradient-to-r from-rose-800 to-red-700 text-white shadow-md shadow-rose-900/25' : 'text-slate-600 hover:bg-slate-100/80'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'pos' ? 'bg-gradient-to-r from-rose-800 to-red-700 text-white shadow-md shadow-rose-900/25' : 'text-slate-600 hover:bg-slate-100/80'
              }`}
            >
              <ShoppingCart className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Kasir (POS)</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'history' ? 'bg-gradient-to-r from-rose-800 to-red-700 text-white shadow-md shadow-rose-900/25' : 'text-slate-600 hover:bg-slate-100/80'
              }`}
            >
              <History className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Riwayat Transaksi</span>
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'inventory' ? 'bg-gradient-to-r from-rose-800 to-red-700 text-white shadow-md shadow-rose-900/25' : 'text-slate-600 hover:bg-slate-100/80'
              }`}
            >
              <Package className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Data Barang</span>
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === 'stock' ? 'bg-gradient-to-r from-rose-800 to-red-700 text-white shadow-md shadow-rose-900/25' : 'text-slate-600 hover:bg-slate-100/80'
              }`}
            >
              <Archive className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Manajemen Stok</span>
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'pos' && <PosView />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'stock' && <StockView />}
        </main>
      </div>
    </div>
  );
}