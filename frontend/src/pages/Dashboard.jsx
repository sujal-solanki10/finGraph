import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardData } from '../services/dashboard';
import { Activity, LogOut, BarChart3, PieChart, TrendingUp, User as UserIcon, DollarSign, Briefcase, AlertTriangle, List, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const StatCard = ({ title, value, icon: Icon, valueColor = "text-text" }) => (
  <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-text-secondary truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className={`text-2xl font-semibold ${valueColor}`}>{value}</div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { logout } = useAuth();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const formatCurrency = (value, currencyCode = 'INR') => {
    if (value === undefined || value === null) return '--';
    const code = currencyCode || 'INR';
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: code }).format(value);
    } catch (e) {
      return `${code} ${value.toFixed(2)}`;
    }
  };

  const formatPercent = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 2 }).format((value || 0) / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-4">
        <Activity className="h-10 w-10 text-primary animate-spin" />
        <p className="text-text-secondary font-medium">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-text mb-2">Error Loading Dashboard</h2>
        <p className="text-text-secondary">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const { portfolioValue, cashBalance, investedAmount, profitLoss, currentHoldings, recentTransactions, riskHighlights, finGraphHighlights, latestRecommendation } = dashboardData || {};

  const hasHoldings = currentHoldings && currentHoldings.length > 0;
  const hasTransactions = recentTransactions && recentTransactions.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Financial Dashboard</h1>
          <p className="text-text-secondary mt-1">Your portfolio overview and aggregated insights.</p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title="Portfolio Value" value={formatCurrency(portfolioValue)} icon={Briefcase} />
          <StatCard title="Cash Balance" value={formatCurrency(cashBalance)} icon={DollarSign} />
          <StatCard title="Invested Amount" value={formatCurrency(investedAmount)} icon={TrendingUp} />
          <StatCard 
            title="Total P&L" 
            value={formatCurrency(profitLoss)} 
            icon={Activity} 
            valueColor={profitLoss >= 0 ? (profitLoss === 0 ? 'text-text' : 'text-green-500') : 'text-red-500'} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Highlights Column */}
          <div className="space-y-6">
            {/* Risk Highlights */}
            <div className="bg-card rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-medium text-text mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" /> Risk Highlights
              </h3>
              {riskHighlights ? (
                <div>
                  <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-text ring-1 ring-inset ring-border mb-3">
                    Risk Level: {riskHighlights.riskLevel}
                  </span>
                  <p className="text-sm text-text-secondary">{riskHighlights.summary}</p>
                </div>
              ) : (
                <p className="text-sm text-text-secondary italic">No risk analysis available yet.</p>
              )}
            </div>

            {/* FinGraph Highlights */}
            <div className="bg-card rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-medium text-text mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" /> FinGraph Concentration
              </h3>
              {finGraphHighlights ? (
                <div>
                  <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-text ring-1 ring-inset ring-border mb-3">
                    Score: {finGraphHighlights.concentrationScore}
                  </span>
                  <p className="text-sm text-text-secondary">{finGraphHighlights.summary}</p>
                </div>
              ) : (
                <p className="text-sm text-text-secondary italic">No concentration analysis available yet.</p>
              )}
            </div>

            {/* Latest Recommendation */}
            <div className="bg-card rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-medium text-text mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" /> Latest Recommendation
              </h3>
              {latestRecommendation ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-text">{latestRecommendation.symbol}</span>
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      latestRecommendation.action === 'BUY' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                      latestRecommendation.action === 'SELL' ? 'bg-red-50 text-red-700 ring-red-600/20' : 
                      'bg-gray-50 text-gray-700 ring-gray-600/20'
                    }`}>
                      {latestRecommendation.action}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">{latestRecommendation.reasoning}</p>
                  <p className="text-xs text-text-secondary mt-3">Date: {new Date(latestRecommendation.recommendationDate).toLocaleDateString()}</p>
                </div>
              ) : (
                <p className="text-sm text-text-secondary italic">No recent recommendations available.</p>
              )}
            </div>
          </div>

          {/* Holdings & Transactions Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Holdings */}
            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border">
                <h3 className="text-lg font-medium text-text flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" /> Current Holdings
                </h3>
              </div>
              {hasHoldings ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-secondary">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Symbol</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Quantity</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Price</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Value</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">P&L</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Alloc</th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {currentHoldings.map((holding, idx) => (
                        <tr key={idx} className="hover:bg-secondary/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">{holding.symbol}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary text-right">{holding.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary text-right">{formatCurrency(holding.currentPrice, holding.currency)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text text-right font-medium">{formatCurrency(holding.value, holding.currency)}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${holding.profitLoss > 0 ? 'text-green-500' : holding.profitLoss < 0 ? 'text-red-500' : 'text-text-secondary'}`}>
                            {formatCurrency(holding.profitLoss, holding.currency)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary text-right">{formatPercent(holding.allocation)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <PieChart className="mx-auto h-12 w-12 text-border mb-4" />
                  <h3 className="text-sm font-medium text-text">No Holdings</h3>
                  <p className="mt-1 text-sm text-text-secondary">You don't have any stocks in your portfolio yet.</p>
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-border">
                <h3 className="text-lg font-medium text-text flex items-center gap-2">
                  <List className="h-5 w-5 text-primary" /> Recent Transactions
                </h3>
              </div>
              {hasTransactions ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-secondary">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Symbol</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Quantity</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Price</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {recentTransactions.map((tx, idx) => (
                        <tr key={idx} className="hover:bg-secondary/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                            {new Date(tx.transactionDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                              tx.type === 'BUY' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                              tx.type === 'SELL' ? 'bg-red-50 text-red-700 ring-red-600/20' : 
                              'bg-gray-50 text-gray-700 ring-gray-600/20'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">{tx.symbol}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary text-right">{tx.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary text-right">{formatCurrency(tx.price, tx.currency)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text text-right">{formatCurrency(tx.totalAmount, tx.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <List className="mx-auto h-12 w-12 text-border mb-4" />
                  <h3 className="text-sm font-medium text-text">No Transactions</h3>
                  <p className="mt-1 text-sm text-text-secondary">You haven't made any transactions recently.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
