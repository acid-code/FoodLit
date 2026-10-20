import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Store,
  Layers,
  Cpu,
  Bookmark,
} from 'lucide-react';
import { storeSyncService, SyncStats } from '../services/storeSyncService';
import { productMappingDb } from '../db/productMappingDb';
import { StoreProductMapping, StoreId } from '../types';
import { STORES } from '../data/mockData';

interface StoreMappingDbViewProps {
  onClose?: () => void;
}

export const StoreMappingDbView: React.FC<StoreMappingDbViewProps> = ({ onClose }) => {
  const [syncStats, setSyncStats] = useState<SyncStats>(storeSyncService.getStats());
  const [mappings, setMappings] = useState<StoreProductMapping[]>(productMappingDb.getAllMappings());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('all');
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = storeSyncService.subscribe((stats) => {
      setSyncStats(stats);
      setMappings(productMappingDb.getAllMappings());
    });
    return unsubscribe;
  }, []);

  const handleRunSync = async () => {
    setSyncSuccessMsg(null);
    const results = await storeSyncService.triggerSync();
    setMappings(productMappingDb.getAllMappings());
    setSyncSuccessMsg('סנכרון קטלוגים ומזהים פנימיים הושלם בהצלחה!');
    setTimeout(() => setSyncSuccessMsg(null), 4000);
  };

  const filteredMappings = mappings.filter((m) => {
    if (selectedStoreFilter !== 'all' && m.storeId !== selectedStoreFilter) {
      return false;
    }
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (m.storeProductNameHe && m.storeProductNameHe.toLowerCase().includes(term)) ||
      m.barcode.includes(term) ||
      m.storeInternalId.toLowerCase().includes(term) ||
      m.productId.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-right" dir="rtl">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-300">
              <Database className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black">מאגר מזהים פנימיים וסנכרון סופרמרקטים</h2>
          </div>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            מאגר Cross-Reference מקומי הממפה ברקודים גלובליים (EAN-13) למזהי הקטלוג הפנימיים של שופרסל, רמי לוי, קרפור, טיב טעם וויקטורי להזרקת סל אוטומטית.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={handleRunSync}
            disabled={syncStats.isSyncing}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md ${
              syncStats.isSyncing
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${syncStats.isSyncing ? 'animate-spin' : ''}`} />
            <span>{syncStats.isSyncing ? 'מסנכרן קטלוגים...' : 'בצע סנכרון עכשיו (Sync Now)'}</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              ✕ סגור
            </button>
          )}
        </div>
      </div>

      {syncSuccessMsg && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs text-emerald-800 font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* Store Sync Health Cards */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-indigo-600" />
          <span>סטטוס סנכרון ותמיכה בהזרקה אוטומטית לפי רשת</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {syncStats.results.map((res) => {
            const storeDef = STORES.find((s) => s.id === res.storeId);
            return (
              <div
                key={res.storeId}
                className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900">{res.storeNameHe.split(' ')[0]}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                  </div>
                  <div className="text-[11px] text-slate-500 mb-2">
                    {res.mappedCount} מוצרים ממופים
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1 text-[10px]">
                  {res.automationSupport.bookmarklet && (
                    <span className="px-1.5 py-0.5 bg-sky-50 text-sky-700 font-bold rounded">
                      Bookmarklet ✓
                    </span>
                  )}
                  {res.automationSupport.mcp && (
                    <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 font-bold rounded">
                      MCP ✓
                    </span>
                  )}
                  {res.automationSupport.directUrl && (
                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded">
                      URL ישיר ✓
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="חפש לפי שם מוצר, ברקוד EAN או קוד פנימי של סופר..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedStoreFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                selectedStoreFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              הכל ({mappings.length})
            </button>
            <button
              onClick={() => setSelectedStoreFilter('shufersal')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                selectedStoreFilter === 'shufersal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              שופרסל (Hybris P_)
            </button>
            <button
              onClick={() => setSelectedStoreFilter('ramilevy')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                selectedStoreFilter === 'ramilevy'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              רמי לוי (REST API)
            </button>
            <button
              onClick={() => setSelectedStoreFilter('carrefour')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                selectedStoreFilter === 'carrefour'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              קרפור (Stor.ai SKU)
            </button>
            <button
              onClick={() => setSelectedStoreFilter('tivtaam')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                selectedStoreFilter === 'tivtaam'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              טיב טעם
            </button>
          </div>
        </div>

        {/* Mappings Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-4">שם המוצר</th>
                <th className="py-3 px-4">ברקוד גלובלי (EAN-13)</th>
                <th className="py-3 px-4">רשת סופרמרקט</th>
                <th className="py-3 px-4">מזהה פנימי להזרקה (Store Code)</th>
                <th className="py-3 px-4">הזרקה אוטומטית</th>
                <th className="py-3 px-4">מקור סנכרון</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMappings.slice(0, 30).map((m, idx) => (
                <tr key={`${m.productId}-${m.storeId}-${idx}`} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-900">
                    {m.storeProductNameHe || m.productId}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-600">{m.barcode}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-700 capitalize">
                    {m.storeId === 'shufersal' && 'שופרסל אונליין'}
                    {m.storeId === 'ramilevy' && 'רמי לוי'}
                    {m.storeId === 'carrefour' && 'קרפור'}
                    {m.storeId === 'tivtaam' && 'טיב טעם'}
                    {m.storeId === 'victory' && 'ויקטורי'}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-1 bg-slate-100 text-indigo-700 rounded-md font-mono text-[11px] font-bold border border-slate-200">
                      {m.storeInternalId}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    {m.isDirectInjectSupported ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>נתמך</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">דרוש שקילה</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                    {m.syncSource === 'catalog-sync' && 'סנכרון קטלוג'}
                    {m.syncSource === 'official-api' && 'מאומת רשמית'}
                    {m.syncSource === 'inferred' && 'מיפוי מחושב'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>
            מציג {Math.min(30, filteredMappings.length)} מתוך {filteredMappings.length} מזהים ממופים
          </span>
          <span className="text-[11px]">
            סנכרון אחרון: {new Date(syncStats.lastSyncTimestamp).toLocaleTimeString('he-IL')}
          </span>
        </div>
      </div>
    </div>
  );
};
