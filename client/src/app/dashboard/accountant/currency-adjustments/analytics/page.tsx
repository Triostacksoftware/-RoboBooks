"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  AlertTriangle,
  Settings,
  RefreshCw,
  Loader2,
  DollarSign,
  Activity,
  Target,
  Zap,
  Bell
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface CurrencyPerformance {
  pair: string;
  totalChange: number;
  avgRate: number;
  volatility: number;
  highRate: number;
  lowRate: number;
  currentRate: number;
  dataPoints: number;
  trend: 'up' | 'down' | 'stable';
}

interface CurrencyExposure {
  currency: string;
  total: number;
  adjustments: number;
  avgAmount: number;
  percentage: number;
}

interface AnalyticsData {
  period: string;
  baseCurrency: string;
  summary: {
    totalPairs: number;
    avgVolatility: number;
    topPerformer: { pair: string; change: number } | null;
    worstPerformer: { pair: string; change: number } | null;
  };
  performance: Record<string, CurrencyPerformance>;
  topPerformers: CurrencyPerformance[];
  worstPerformers: CurrencyPerformance[];
  dailyRates: Record<string, Record<string, number>>;
  currencyPairs: Record<string, any[]>;
}

const CurrencyAnalyticsPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [exposureData, setExposureData] = useState<CurrencyExposure[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [baseCurrency, setBaseCurrency] = useState('USD');

  // Load analytics data
  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api<{ success: boolean; data: AnalyticsData }>(
        `/api/currency-analytics/performance?period=${selectedPeriod}&baseCurrency=${baseCurrency}`
      );
      
      if (response.success) {
        setAnalyticsData(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Load exposure data
  const loadExposureData = async () => {
    try {
      const response = await api<{ success: boolean; data: { currencyExposure: CurrencyExposure[] } }>(
        '/api/currency-analytics/exposure'
      );
      
      if (response.success) {
        setExposureData(response.data.currencyExposure);
      }
    } catch (error) {
      console.error('Error loading exposure data:', error);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      loadAnalyticsData();
      loadExposureData();
    }
  }, [user, authLoading, selectedPeriod, baseCurrency]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard/accountant/currency-adjustments")}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                ← Back to Currency Adjustments
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  Currency Analytics
                </h1>
                <p className="text-sm text-gray-600">
                  Advanced analytics and insights for currency performance
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
                <option value="JPY">JPY</option>
              </select>
              <button
                onClick={() => router.push('/dashboard/accountant/currency-adjustments/alerts')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Bell className="h-4 w-4 mr-2" />
                Rate Alerts
              </button>
              <button
                onClick={loadAnalyticsData}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {analyticsData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Pairs</dt>
                      <dd className="text-lg font-medium text-gray-900">{analyticsData.summary.totalPairs}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Activity className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Avg Volatility</dt>
                      <dd className="text-lg font-medium text-gray-900">{analyticsData.summary.avgVolatility}%</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Top Performer</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {analyticsData.summary.topPerformer ? (
                          <div>
                            <div className="text-sm">{analyticsData.summary.topPerformer.pair}</div>
                            <div className="text-green-600 text-sm">
                              {formatPercentage(analyticsData.summary.topPerformer.change)}
                            </div>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Worst Performer</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {analyticsData.summary.worstPerformer ? (
                          <div>
                            <div className="text-sm">{analyticsData.summary.worstPerformer.pair}</div>
                            <div className="text-red-600 text-sm">
                              {formatPercentage(analyticsData.summary.worstPerformer.change)}
                            </div>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Performers */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Top Performers
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Currency Pair
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volatility
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData?.topPerformers.slice(0, 5).map((performer) => (
                    <tr key={performer.pair} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTrendIcon(performer.trend)}
                          <span className="ml-2 text-sm font-medium text-gray-900">{performer.pair}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getTrendColor(performer.totalChange)}`}>
                          {formatPercentage(performer.totalChange)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {performer.volatility.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Worst Performers */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Worst Performers
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Currency Pair
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volatility
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData?.worstPerformers.slice(0, 5).map((performer) => (
                    <tr key={performer.pair} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTrendIcon(performer.trend)}
                          <span className="ml-2 text-sm font-medium text-gray-900">{performer.pair}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getTrendColor(performer.totalChange)}`}>
                          {formatPercentage(performer.totalChange)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {performer.volatility.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Currency Exposure */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-600" />
              Currency Exposure
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Exposure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adjustments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exposureData.slice(0, 10).map((exposure) => (
                  <tr key={exposure.currency} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{exposure.currency}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(exposure.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${exposure.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{exposure.percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exposure.adjustments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(exposure.avgAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyAnalyticsPage;
