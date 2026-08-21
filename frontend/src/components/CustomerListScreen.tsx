import React, { useState, useMemo } from 'react';
import { Search, Plus, UserPlus, CheckCircle2, ArrowUpDown, X } from 'lucide-react';
import { Customer } from '../types';
import { formatCurrency, getInitials, formatRelativeTime } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface CustomerListScreenProps {
  customers: Customer[];
  onSelectCustomer: (customerId: string) => void;
  onOpenAddCustomer: () => void;
}

type FilterType = 'all' | 'has_balance' | 'settled' | 'advance';
type SortType = 'recent' | 'balance_desc' | 'balance_asc' | 'name_asc';

export const CustomerListScreen: React.FC<CustomerListScreenProps> = ({
  customers,
  onSelectCustomer,
  onOpenAddCustomer,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeSort, setActiveSort] = useState<SortType>('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filteredAndSortedCustomers = useMemo(() => {
    const cleanQuery = searchQuery.trim().toLowerCase();
    const cleanDigitsQuery = searchQuery.replace(/\D/g, '');

    return customers
      .filter((customer) => {
        // Real-time search filter by Name or Phone Number
        if (cleanQuery) {
          const matchName = customer.name.toLowerCase().includes(cleanQuery);
          const matchPhoneRaw = customer.phone.toLowerCase().includes(cleanQuery);
          const matchPhoneDigits =
            cleanDigitsQuery.length > 0 &&
            customer.phone.replace(/\D/g, '').includes(cleanDigitsQuery);

          if (!matchName && !matchPhoneRaw && !matchPhoneDigits) {
            return false;
          }
        }

        // Category filter
        if (activeFilter === 'has_balance') {
          return customer.balance > 0;
        }
        if (activeFilter === 'settled') {
          return customer.balance === 0;
        }
        if (activeFilter === 'advance') {
          return customer.balance < 0;
        }
        return true;
      })
      .sort((a, b) => {
        if (activeSort === 'balance_desc') {
          return b.balance - a.balance;
        }
        if (activeSort === 'balance_asc') {
          return a.balance - b.balance;
        }
        if (activeSort === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        // default recent
        return new Date(b.lastTransactionDate).getTime() - new Date(a.lastTransactionDate).getTime();
      });
  }, [customers, searchQuery, activeFilter, activeSort]);

  return (
    <main className="flex-1 px-4 pt-3 flex flex-col gap-3.5 pb-28 max-w-md mx-auto w-full relative">
      {/* Search and Sort Toolbar */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-grow h-11">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#767683]">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-search-customers"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full h-full pl-9 pr-9 rounded-xl border border-[#c6c5d4]/60 bg-white focus:border-[#000666] focus:ring-1 focus:ring-[#000666] outline-none transition-all text-sm text-[#191c1e] placeholder:text-[#767683] shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#767683] hover:text-[#191c1e] transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <div className="w-5 h-5 rounded-full bg-[#eceef1] hover:bg-[#e0e3e6] flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-[#454652]" />
              </div>
            </button>
          )}
        </div>

        {/* Sort Button */}
        <div className="relative">
          <button
            id="btn-sort-customers"
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="w-11 h-11 flex-shrink-0 rounded-xl border border-[#c6c5d4]/60 bg-white flex items-center justify-center text-[#454652] hover:bg-[#eceef1] transition-colors shadow-sm cursor-pointer"
            aria-label="Sort options"
          >
            <ArrowUpDown className="w-4 h-4 text-[#000666]" />
          </button>

          {showSortMenu && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-[#c6c5d4]/50 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
              <p className="px-3 py-1 text-[11px] font-bold text-[#767683] uppercase tracking-wider">
                {t.sortRecent}
              </p>
              <button
                onClick={() => { setActiveSort('recent'); setShowSortMenu(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between cursor-pointer ${activeSort === 'recent' ? 'bg-[#f2f4f7] font-bold text-[#000666]' : 'text-[#191c1e]'}`}
              >
                <span>{t.sortRecent}</span>
                {activeSort === 'recent' && <CheckCircle2 className="w-3.5 h-3.5 text-[#000666]" />}
              </button>
              <button
                onClick={() => { setActiveSort('balance_desc'); setShowSortMenu(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between cursor-pointer ${activeSort === 'balance_desc' ? 'bg-[#f2f4f7] font-bold text-[#000666]' : 'text-[#191c1e]'}`}
              >
                <span>{t.sortHighestDue}</span>
                {activeSort === 'balance_desc' && <CheckCircle2 className="w-3.5 h-3.5 text-[#000666]" />}
              </button>
              <button
                onClick={() => { setActiveSort('name_asc'); setShowSortMenu(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between cursor-pointer ${activeSort === 'name_asc' ? 'bg-[#f2f4f7] font-bold text-[#000666]' : 'text-[#191c1e]'}`}
              >
                <span>{t.sortNameAZ}</span>
                {activeSort === 'name_asc' && <CheckCircle2 className="w-3.5 h-3.5 text-[#000666]" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
        <button
          id="filter-chip-all"
          onClick={() => setActiveFilter('all')}
          className={`h-8 px-4 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#1a237e] text-white shadow-sm'
              : 'bg-white text-[#454652] border border-[#c6c5d4]/60 hover:bg-[#eceef1]'
          }`}
        >
          {t.filterAll} ({customers.length})
        </button>

        <button
          id="filter-chip-has-balance"
          onClick={() => setActiveFilter('has_balance')}
          className={`h-8 px-4 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeFilter === 'has_balance'
              ? 'bg-[#1a237e] text-white shadow-sm'
              : 'bg-white text-[#454652] border border-[#c6c5d4]/60 hover:bg-[#eceef1]'
          }`}
        >
          {t.filterHasBalance} ({customers.filter((c) => c.balance > 0).length})
        </button>

        <button
          id="filter-chip-settled"
          onClick={() => setActiveFilter('settled')}
          className={`h-8 px-4 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeFilter === 'settled'
              ? 'bg-[#1a237e] text-white shadow-sm'
              : 'bg-white text-[#454652] border border-[#c6c5d4]/60 hover:bg-[#eceef1]'
          }`}
        >
          {t.filterSettled} ({customers.filter((c) => c.balance === 0).length})
        </button>

        <button
          id="filter-chip-advance"
          onClick={() => setActiveFilter('advance')}
          className={`h-8 px-4 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeFilter === 'advance'
              ? 'bg-[#1a237e] text-white shadow-sm'
              : 'bg-white text-[#454652] border border-[#c6c5d4]/60 hover:bg-[#eceef1]'
          }`}
        >
          {t.filterAdvance} ({customers.filter((c) => c.balance < 0).length})
        </button>
      </div>

      {/* Results summary when search is active */}
      {searchQuery && (
        <div className="flex justify-between items-center px-1 text-xs text-[#767683]">
          <span>{t.foundCustomers}: {filteredAndSortedCustomers.length}</span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-[11px] font-bold text-[#000666] hover:underline cursor-pointer"
          >
            {t.clearSearch}
          </button>
        </div>
      )}

      {/* Customer List */}
      <div className="flex flex-col gap-2.5">
        {filteredAndSortedCustomers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-[#c6c5d4]/40 text-center flex flex-col items-center justify-center my-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#eceef1] flex items-center justify-center text-[#767683] mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#191c1e]">{t.noCustomersFound}</h4>
            <p className="text-xs text-[#767683] mt-1 max-w-[240px]">
              {searchQuery ? `${t.noCustomersFound} "${searchQuery}"` : t.tryDifferentSearch}
            </p>
            <button
              onClick={onOpenAddCustomer}
              className="mt-4 px-4 py-2 bg-[#000666] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t.addNewCustomer}</span>
            </button>
          </div>
        ) : (
          filteredAndSortedCustomers.map((customer) => {
            const isOwed = customer.balance > 0;
            const isAdvance = customer.balance < 0;

            return (
              <div
                key={customer.id}
                id={`customer-card-${customer.id}`}
                onClick={() => onSelectCustomer(customer.id)}
                className="bg-white rounded-xl border border-[#c6c5d4]/50 p-3.5 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)] min-h-[68px] hover:bg-[#f7f9fc] active:bg-[#eceef1] transition-all cursor-pointer group"
              >
                {/* Left: Avatar + Name + Phone + Last active */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-11 h-11 rounded-full bg-[#e0e3e6] flex items-center justify-center text-[#191c1e] font-bold text-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                    {getInitials(customer.name)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-[#191c1e] truncate leading-snug">
                      {customer.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-[#767683] mt-0.5">
                      <span className="truncate">{customer.phone}</span>
                      <span>•</span>
                      <span className="truncate">{formatRelativeTime(customer.lastTransactionDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Balance + Status */}
                <div className="flex flex-col items-end flex-shrink-0 pl-2">
                  <span
                    className={`text-sm font-bold font-display ${
                      isOwed
                        ? 'text-[#ba1a1a]'
                        : isAdvance
                        ? 'text-[#006b5f]'
                        : 'text-[#454652]'
                    }`}
                  >
                    ₹ {formatCurrency(customer.balance)}
                  </span>
                  <span className="text-[11px] font-medium text-[#767683]">
                    {isOwed
                      ? t.youWillGet
                      : isAdvance
                      ? t.youWillGive
                      : t.settled}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button (FAB) for Add Customer */}
      <button
        id="btn-fab-add-customer"
        onClick={onOpenAddCustomer}
        className="fixed right-5 bottom-20 w-14 h-14 bg-[#000666] text-white rounded-2xl shadow-[0_6px_20px_rgba(0,6,102,0.3)] flex items-center justify-center hover:bg-[#1a237e] active:scale-95 transition-all z-40 cursor-pointer"
        aria-label="Add customer"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </main>
  );
};

