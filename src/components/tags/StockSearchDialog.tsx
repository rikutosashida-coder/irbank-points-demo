import { useState, useEffect } from 'react';
import { FiX, FiSearch } from 'react-icons/fi';
import { StockData } from '../../features/notes/types/note.types';

interface StockSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (stock: StockData) => void;
}

export function StockSearchDialog({ isOpen, onClose, onSelect }: StockSearchDialogProps) {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStocks, setFilteredStocks] = useState<StockData[]>([]);

  useEffect(() => {
    // モックデータを読み込み
    fetch('/mock-data/stocks.json')
      .then(res => res.json())
      .then(data => setStocks(data))
      .catch(err => console.error('Failed to load stocks:', err));
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = stocks.filter(stock =>
        stock.code.includes(query) ||
        stock.name.toLowerCase().includes(query) ||
        stock.sector.toLowerCase().includes(query)
      );
      setFilteredStocks(filtered);
    } else {
      setFilteredStocks(stocks);
    }
  }, [searchQuery, stocks]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">銘柄を検索</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="銘柄コード、銘柄名、業種で検索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-auto p-4">
          {filteredStocks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              銘柄が見つかりません
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStocks.map((stock) => (
                <button
                  key={stock.code}
                  onClick={() => {
                    onSelect(stock);
                    onClose();
                  }}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {stock.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {stock.code} · {stock.sector}
                      </div>
                    </div>
                    <div className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {stock.market}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
