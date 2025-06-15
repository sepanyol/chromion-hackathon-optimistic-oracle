// app/dashboard/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import StatCard from '@/components/StatCard';
import ActivityFeed from '@/components/ActivityFeed';
import RequestsTable from '@/components/RequestsTable';
import QuickActions from '@/components/QuickActions';
import CrossChainStatus from '@/components/CrossChainStatus';
import RequestModal from '@/components/RequestModal';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export interface StatData {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ReactNode;
}

export interface ActivityItem {
  id: string;
  title: string;
  user: string;
  time: string;
  status: 'Proposed' | 'Challenged' | 'Resolved';
}

export interface ActiveRequest {
  id: string;
  request: string;
  type: string;
  reward: string;
  status: 'Open' | 'Proposed' | 'Challenged';
  timeLeft: string;
  requestedTime: string;
}

export interface CrossChainNetwork {
  network: string;
  status: 'Active' | 'Syncing';
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatData[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [requests, setRequests] = useState<ActiveRequest[]>([]);
  const [networks, setNetworks] = useState<CrossChainNetwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'open' | 'proposed' | 'challenged'>('all');

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats([
        {
          title: 'Total Requests',
          value: '12,847',
          change: '+12% from last week',
          changeType: 'positive',
          icon: <TrendingUp className="w-6 h-6 text-blue-600" />
        },
        {
          title: 'Active Disputes',
          value: '23',
          change: '-5% from yesterday',
          changeType: 'negative',
          icon: <AlertTriangle className="w-6 h-6 text-red-600" />
        },
        {
          title: 'Success Rate',
          value: '97.8%',
          change: '+0.3% this month',
          changeType: 'positive',
          icon: <CheckCircle className="w-6 h-6 text-green-600" />
        }
      ]);

      setActivities([
        {
          id: '1',
          title: 'New proposal submitted for "TSLA Q4 earnings beat estimate"',
          user: '0x7420...2eef',
          time: '2 minutes ago',
          status: 'Proposed'
        },
        {
          id: '2',
          title: 'Challenge raised on "BTC price above $50k"',
          user: '0x8b2c...3ef4',
          time: '18 minutes ago',
          status: 'Challenged'
        },
        {
          id: '3',
          title: 'Request resolved: "ETH merge completion date"',
          user: '0x1eef...7c8b',
          time: '1 hour ago',
          status: 'Resolved'
        }
      ]);

      setRequests([
        {
          id: '1',
          request: 'Will TSLA stock price exceed $300 by Q1 2024?',
          type: 'Boolean',
          reward: '500 USDC',
          status: 'Open',
          timeLeft: '22h 15m',
          requestedTime: '2 hours ago'
        },
        {
          id: '2',
          request: 'Current market value of 123 Main St, NYC',
          type: 'RWA Valuation',
          reward: '1,200 USDC',
          status: 'Proposed',
          timeLeft: '18h 42m',
          requestedTime: '5 hours ago'
        },
        {
          id: '3',
          request: 'BTC price on December 31, 2024',
          type: 'Price Feed',
          reward: '800 USDC',
          status: 'Challenged',
          timeLeft: '6h 30m',
          requestedTime: '1 day ago'
        }
      ]);

      setNetworks([
        { network: 'Avalanche', status: 'Active' },
        { network: 'Ethereum', status: 'Active' },
        { network: 'Base', status: 'Syncing' }
      ]);

      setIsLoading(false);
    };

    loadData();
  }, []);

  // Filter requests based on search and tab
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.request.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = selectedTab === 'all' || request.status.toLowerCase() === selectedTab;
    return matchesSearch && matchesTab;
  });

  const handlePropose = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'Proposed' as const }
        : req
    ));
    // In real app, would make API call
  };

  const handleChallenge = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'Challenged' as const }
        : req
    ));
    // In real app, would make API call
  };

  const handleNewRequest = (requestData: any) => {
    const newRequest: ActiveRequest = {
      id: Date.now().toString(),
      request: requestData.description,
      type: requestData.type,
      reward: `${requestData.reward} USDC`,
      status: 'Open',
      timeLeft: '24h 0m',
      requestedTime: 'Just now'
    };
    
    setRequests(prev => [newRequest, ...prev]);
    setShowRequestModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar showNavigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showNavigation />
      
      {/* Network Status Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Network:</span>
              <span className="font-medium text-gray-600">Avalanche</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Gas:</span>
              <span className="font-medium text-green-600">25 gwei</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Active Requests:</span>
              <span className="font-medium text-gray-600">847</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 mb-18 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            {/* Recent Activity */}
            <ActivityFeed activities={activities} />

            {/* Requests Section */}
           
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <CrossChainStatus networks={networks} />
            <QuickActions onNewRequest={() => setShowRequestModal(true)} />
          </div>
        </div>
        
         <div className="bg-white mt-5 rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <h2 className="text-lg font-semibold text-gray-900">Active Requests</h2>
                  
                  <div className="flex items-center space-x-4">
                    {/* Search */}
                    <input
                      type="text"
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    
                    {/* Filter Tabs */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      {(['all', 'open', 'proposed', 'challenged'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setSelectedTab(tab)}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                            selectedTab === tab
                              ? 'bg-white text-blue-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <RequestsTable
                requests={filteredRequests}
                onPropose={handlePropose}
                onChallenge={handleChallenge}
              />
            </div>
      </div>
      

      {/* Request Modal */}
      {/* {showRequestModal && (
        <RequestModal
          onSubmit={handleNewRequest}
          onClose={() => setShowRequestModal(false)}
        />
      )} */}
    </div>
  );
};

export default Dashboard;