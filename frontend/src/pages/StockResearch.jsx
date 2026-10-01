import { useState, useEffect } from 'react';
// Removed useAuth import
import { searchStocks, getExploreData } from '../services/stocks';
import { Activity, Search, AlertTriangle, TrendingUp, TrendingDown, Building2, Globe, ArrowRight, BarChart3, PieChart, Target, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const formatPrice = (price, currencyCode = 'INR') => {
  if (price === undefined || price === null) return 'N/A';
  const code = currencyCode || 'INR';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } catch (e) {
    return `${code} ${price.toFixed(2)}`;
  }
};

const StockCard = ({ stock, onClick }) => {
  const isPositive = (stock.changePercent || 0) >= 0;
  return (
    <div 
      onClick={() => onClick(stock.symbol)}
      className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all flex flex-col justify-between h-full group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">{stock.symbol}</h3>
          <p className="text-sm text-text-secondary truncate max-w-[120px]" title={stock.companyName}>{stock.companyName}</p>
        </div>
        <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
        </div>
      </div>
      <div>
        <div className="text-xl font-bold text-text">
          {formatPrice(stock.currentPrice, stock.currency)}
        </div>
        <div className={`text-sm font-medium flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          <span>{isPositive ? '+' : ''}{stock.change?.toFixed(2) || '0.00'}</span>
          <span>({isPositive ? '+' : ''}{stock.changePercent?.toFixed(2) || '0.00'}%)</span>
        </div>
      </div>
    </div>
  );
};

const MarketIndexCard = ({ name, value, change, changePercent }) => {
  const isPositive = (changePercent || 0) >= 0;
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="text-text-secondary font-medium mb-1">{name}</div>
      <div className="text-2xl font-bold text-text mb-2">{formatPrice(value, 'INR')}</div>
      <div className={`text-sm font-medium flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span>{isPositive ? '+' : ''}{change?.toFixed(2) || '0.00'}</span>
        <span>({isPositive ? '+' : ''}{changePercent?.toFixed(2) || '0.00'}%)</span>
      </div>
    </div>
  );
};

const ResearchToolCard = ({ title, description, icon: Icon, to }) => (
  <Link to={to} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-lg transition-all group block h-full flex flex-col justify-between">
    <div>
      <div className="bg-secondary/50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="text-primary" size={24} />
      </div>
      <h3 className="font-bold text-text mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-text-secondary">{description}</p>
    </div>
    <div className="mt-4 flex items-center text-primary text-sm font-medium">
      <span>Get started</span>
      <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
    </div>
  </Link>
);

const MarketSectorCard = ({ name, changePercent }) => {
  const isPositive = (changePercent || 0) >= 0;
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex justify-between items-center hover:bg-secondary/30 transition-colors cursor-pointer">
      <span className="font-medium text-text">{name}</span>
      <span className={`text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? '+' : ''}{changePercent?.toFixed(2) || '0.00'}%
      </span>
    </div>
  );
};


export default function StockResearch() {
  const navigate = useNavigate();
  
  const [keyword, setKeyword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [exploreData, setExploreData] = useState(null);
  const [exploreLoading, setExploreLoading] = useState(true);
  const [exploreError, setExploreError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    
    const loadExploreData = async () => {
      setExploreLoading(true);
      try {
        const data = await getExploreData({ signal: controller.signal });
        if (!controller.signal.aborted) {
          setExploreData(data);
        }
      } catch (err) {
        if (err.name !== 'AbortError' && !controller.signal.aborted) {
          setExploreError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setExploreLoading(false);
        }
      }
    };
    
    loadExploreData();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      setSearchError(null);
      try {
        const data = await searchStocks(searchQuery, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setSearchResults(data);
        }
      } catch (err) {
        if (err.name !== 'AbortError' && !controller.signal.aborted) {
          setSearchError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    };
    
    fetchResults();
    return () => controller.abort();
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(keyword);
  };

  const handleStockClick = (symbol) => {
    navigate(`/stocks/${encodeURIComponent(symbol)}`);
  };

  const renderSection = (title, stocks) => {
    if (!stocks || stocks.length === 0) return null;
    return (
      <div className="mb-10">
        <h2 className="text-xl font-bold text-text mb-6 flex items-center">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {stocks.map(stock => (
            <StockCard key={stock.symbol} stock={stock} onClick={handleStockClick} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-12 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Market Overview */}
        <div className="mb-10 animate-fade-in">
          <h2 className="text-2xl font-bold text-text mb-6">Market Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MarketIndexCard 
              name="NIFTY 50" 
              value={exploreData?.marketIndices?.nifty?.value || 22514.65} 
              change={exploreData?.marketIndices?.nifty?.change || 150.25} 
              changePercent={exploreData?.marketIndices?.nifty?.changePercent || 0.67} 
            />
            <MarketIndexCard 
              name="SENSEX" 
              value={exploreData?.marketIndices?.sensex?.value || 74227.63} 
              change={exploreData?.marketIndices?.sensex?.change || 555.45} 
              changePercent={exploreData?.marketIndices?.sensex?.changePercent || 0.75} 
            />
          </div>
        </div>

        {/* Large Search Input */}
        <div className="mb-10">
          <form onSubmit={handleSearchSubmit} className="relative shadow-lg rounded-2xl overflow-hidden group border border-border focus-within:border-primary transition-colors flex bg-card">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-text-secondary group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-14 pr-4 py-6 bg-transparent text-text placeholder-text-secondary focus:outline-none text-xl"
              placeholder="Search stocks by symbol or company name... (Press Enter to search)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit" className="px-8 py-6 bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
              Search
            </button>
          </form>
        </div>

        {/* Search Results */}
        {searchQuery.trim() && (
          <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden mb-12">
            <div className="p-5 bg-secondary/20 border-b border-border flex justify-between items-center">
              <h2 className="font-semibold text-text text-lg">Search Results</h2>
              <span className="text-sm text-text-secondary">"{searchQuery}"</span>
            </div>
            
            {isSearching && (
              <div className="flex flex-col items-center justify-center p-12">
                <Activity className="h-8 w-8 text-primary animate-spin mb-3" />
                <p className="text-text-secondary">Searching the markets...</p>
              </div>
            )}

            {!isSearching && searchError && (
              <div className="p-12 text-center">
                <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                <p className="text-red-500 font-medium">{searchError}</p>
              </div>
            )}

            {!isSearching && !searchError && searchResults.length === 0 && (
              <div className="p-12 text-center text-text-secondary">
                No stocks found matching your query. Try a different symbol or name.
              </div>
            )}

            {!isSearching && !searchError && searchResults.length > 0 && (
              <ul className="divide-y divide-border">
                {searchResults.map((stock, idx) => (
                  <li 
                    key={`${stock.symbol}-${idx}`}
                    className="hover:bg-secondary/40 transition-colors cursor-pointer p-5 flex items-center justify-between group"
                    onClick={() => handleStockClick(stock.symbol)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-text text-lg group-hover:text-primary transition-colors">{stock.symbol}</h3>
                        <p className="text-text-secondary">{stock.companyName}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1 rounded-full text-xs font-medium text-text-secondary mb-1">
                        <Globe className="h-3 w-3" /> {stock.exchange || 'Market'}
                      </div>
                      <span className="text-sm text-text-secondary">{stock.currency || 'USD'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Explore Sections */}
        {!searchQuery.trim() && (
          <>
            {exploreLoading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Activity className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-text-secondary text-xl font-medium">Discovering opportunities...</p>
              </div>
            ) : exploreError ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-border">
                <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-text font-bold text-xl mb-2">Failed to load market data</p>
                <p className="text-text-secondary max-w-md">{exploreError}</p>
              </div>
            ) : exploreData ? (
              <div className="animate-fade-in space-y-12">
                
                {renderSection('Popular Stocks', exploreData.popularStocks)}
                
                {renderSection('Top Gainers', exploreData.topGainers)}
                {renderSection('Top Losers', exploreData.topLosers)}
                
                {renderSection('Most Active', exploreData.mostActive)}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                  <div className="lg:col-span-1">
                    <h2 className="text-xl font-bold text-text mb-6">Market Sectors</h2>
                    <div className="grid grid-cols-1 gap-3">
                      {(exploreData.sectors || [
                        { name: 'Technology', changePercent: 1.24 },
                        { name: 'Financial Services', changePercent: -0.45 },
                        { name: 'Healthcare', changePercent: 0.85 },
                        { name: 'Consumer Cyclical', changePercent: 2.10 },
                        { name: 'Energy', changePercent: -1.20 },
                      ]).map((sector, i) => (
                        <MarketSectorCard key={i} name={sector.name} changePercent={sector.changePercent} />
                      ))}
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-text mb-6">Research Tools</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <ResearchToolCard 
                        title="Stock Research" 
                        description="Deep dive into financial statements, ratios, and historical performance."
                        icon={BarChart3}
                        to="/explore"
                      />
                      <ResearchToolCard 
                        title="Portfolio Analysis" 
                        description="Analyze your holdings, diversification, and overall performance."
                        icon={PieChart}
                        to="/dashboard"
                      />
                      <ResearchToolCard 
                        title="Risk Analysis" 
                        description="Assess the risk profile and volatility of your investments."
                        icon={ShieldAlert}
                        to="/dashboard"
                      />
                      <ResearchToolCard 
                        title="FinGraph Analysis" 
                        description="Identify hidden correlations and systemic risks in your portfolio."
                        icon={Target}
                        to="/dashboard"
                      />
                    </div>
                  </div>
                </div>

              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
