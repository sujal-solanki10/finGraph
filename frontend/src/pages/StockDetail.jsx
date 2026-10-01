import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Activity, ArrowLeft, TrendingUp, TrendingDown, Building, Globe, DollarSign, AlertTriangle } from 'lucide-react';
import { getStockDetails, getStockHistory } from '../services/stocks';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';

const formatPrice = (price, currencyCode = 'INR') => {
  if (price === undefined || price === null) return '--';
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

export default function StockDetail() {
  const { symbol } = useParams();
  
  const [details, setDetails] = useState(null);
  const [history, setHistory] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const detailsData = await getStockDetails(symbol, { signal: controller.signal });
        
        // Alpha Vantage free tier has a 1 request/second limit.
        // We add a delay before fetching history to avoid the rate limit error.
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (controller.signal.aborted) return;
        
        const historyData = await getStockHistory(symbol, { signal: controller.signal });
        
        if (!controller.signal.aborted) {
          setDetails(detailsData);
          setHistory(historyData);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    
    if (symbol) {
      fetchData();
    }
    
    return () => {
      controller.abort();
    };
  }, [symbol]);

  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];
    // Sort chronologically for chart (oldest to newest)
    const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.map(item => ({
      date: item.date,
      price: item.close,
      open: item.open,
      high: item.high,
      low: item.low,
      volume: item.volume
    }));
  }, [history]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Activity className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-text-secondary text-lg">Loading stock data for {symbol}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-4xl mb-8">
          <Link to="/explore" className="flex items-center gap-2 text-text-secondary hover:text-text transition-colors">
            <ArrowLeft size={20} />
            <span>Back to Explore</span>
          </Link>
        </div>
        <div className="sm:mx-auto sm:w-full sm:max-w-4xl bg-card p-12 rounded-xl border border-border text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text mb-2">Error Loading Stock</h2>
          <p className="text-text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  if (!details) return null;

  const quote = details.quote || {};
  const isPositive = (quote.change || 0) >= 0;

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-text">{details.companyName || symbol}</h1>
                <p className="text-text-secondary text-lg flex items-center gap-2 mt-1">
                  <span className="bg-secondary px-2 py-1 rounded text-sm font-medium">{symbol}</span>
                  <span>•</span>
                  <span>{details.exchange}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="text-left md:text-right">
            <div className="text-4xl font-bold text-text mb-1">
              {formatPrice(quote.price, details.currency)}
            </div>
            {quote.change !== undefined && (
              <div className={`text-lg font-medium flex items-center md:justify-end gap-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                <span>{isPositive ? '+' : ''}{quote.change.toFixed(2)}</span>
                <span>({quote.changePercent})</span>
              </div>
            )}
            <p className="text-text-secondary text-sm mt-1">
              Latest Trading Day: {quote.latestTradingDay || '--'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl p-6 h-full">
              <h2 className="text-xl font-bold text-text mb-6">Price History</h2>
              
              {chartData.length > 0 ? (
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#666" 
                        tickFormatter={(val) => {
                          const d = new Date(val);
                          return `${d.getMonth()+1}/${d.getDate()}`;
                        }}
                      />
                      <YAxis 
                        domain={['auto', 'auto']} 
                        stroke="#666"
                        tickFormatter={(val) => formatPrice(val, details.currency)}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#aaa', marginBottom: '4px' }}
                        formatter={(value, name) => {
                          if (name === 'price') return [formatPrice(value, details.currency), 'Close'];
                          return [value, name];
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6, fill: '#3b82f6' }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-text-secondary border border-dashed border-border rounded-lg">
                  No historical data available for chart.
                </div>
              )}
            </div>
          </div>

          {/* Key Stats Section */}
          <div className="space-y-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-text mb-4">Company Profile</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Globe size={18} />
                    <span>Region</span>
                  </div>
                  <span className="font-medium text-text">{details.region || '--'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <DollarSign size={18} />
                    <span>Currency</span>
                  </div>
                  <span className="font-medium text-text">{details.currency || '--'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Building size={18} />
                    <span>Exchange</span>
                  </div>
                  <span className="font-medium text-text">{details.exchange || '--'}</span>
                </div>
                {details.sector && (
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-text-secondary">Sector</span>
                    <span className="font-medium text-text">{details.sector}</span>
                  </div>
                )}
                {details.industry && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-text-secondary">Industry</span>
                    <span className="font-medium text-text">{details.industry}</span>
                  </div>
                )}
              </div>
            </div>

            {quote.volume && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-text mb-4">Market Stats</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-text-secondary">Volume</span>
                    <span className="font-medium text-text">{quote.volume.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
