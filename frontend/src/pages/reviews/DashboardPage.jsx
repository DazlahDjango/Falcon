// src/pages/reviews/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCycles, useSelfAssessment, useSupervisorReview, useFinalRatings, usePIPs, useFeedback, useAnalytics, useInsights, usePredictions } from '../../hooks/reviews';
import { REVIEW_ROUTES } from '../../config/constants';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  Settings,
  Clock,
  Target,
  Zap,
  Award,
  ChevronRight,
  Loader,
  MessageSquare,
  Lightbulb,
  Activity,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  Calendar,
  Star,
  Plus,
} from 'lucide-react';

// Loading Component with Animated Spinner
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Loader className="w-16 h-16 text-blue-600 animate-spin" size={64} />
      </div>
      <p className="text-lg font-medium text-gray-700">Loading your performance dashboard...</p>
      <p className="text-sm text-gray-500">This should only take a moment</p>
    </div>
  </div>
);

// Cycle Progress Component
const CycleProgress = ({ activeCycle }) => {
  if (!activeCycle) return null;

  const startDate = new Date(activeCycle.start_date);
  const endDate = new Date(activeCycle.end_date);
  const now = new Date();

  const totalDays = Math.max(1, (endDate - startDate) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.max(0, (now - startDate) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.max(0, (endDate - now) / (1000 * 60 * 60 * 24));
  const progressPercent = Math.min(100, (elapsedDays / totalDays) * 100);
  const isCompleted = now > endDate;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg border border-blue-100 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{activeCycle.name}</h3>
          <p className="text-sm text-gray-600 mt-1">Review cycle progress</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
          <Clock size={18} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            {isCompleted ? 'Completed' : `${Math.ceil(remainingDays)} days left`}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span className="font-medium">{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span className="font-bold text-gray-900 text-lg">{Math.round(progressPercent)}%</span>
          <span className="font-medium">{endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
};

// Enhanced Stats Card Component
const StatCard = ({ icon: Icon, label, value, status, onClick, trend, trendColor, trendIcon }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 ${
        status === 'completed' ? 'bg-green-100' :
        status === 'pending' ? 'bg-yellow-100' :
        status === 'alert' ? 'bg-red-100' :
        'bg-blue-100'
      }`}>
        <Icon size={28} className={
          status === 'completed' ? 'text-green-600' :
          status === 'pending' ? 'text-yellow-600' :
          status === 'alert' ? 'text-red-600' :
          'text-blue-600'
        } />
      </div>
      {status === 'completed' && (
        <CheckCircle2 size={24} className="text-green-600" />
      )}
      {status === 'alert' && (
        <AlertCircle size={24} className="text-red-600" />
      )}
    </div>
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className="text-4xl font-bold text-gray-900 mb-3">{value}</p>
    {trend && (
      <div className={`flex items-center gap-2 text-sm font-semibold ${trendColor}`}>
        {trendIcon || <TrendingUp size={16} />}
        <span>{trend}</span>
      </div>
    )}
  </div>
);

// Traffic Light Rating Badge
const RatingBadge = ({ score }) => {
  let rating, color, bgColor, label;

  if (score >= 80) {
    rating = 'Excellent';
    color = 'text-green-700';
    bgColor = 'bg-green-100';
  } else if (score >= 60) {
    rating = 'Good';
    color = 'text-blue-700';
    bgColor = 'bg-blue-100';
  } else {
    rating = 'Needs Improvement';
    color = 'text-orange-700';
    bgColor = 'bg-orange-100';
  }

  return (
    <div className={`${bgColor} ${color} px-6 py-3 rounded-full text-base font-bold flex items-center gap-3`}>
      <span className={`w-4 h-4 rounded-full ${bgColor.replace('100', '600')}`}></span>
      {rating}
    </div>
  );
};

// Performance Trend Chart Component
const PerformanceTrendChart = ({ data }) => {
  const defaultData = [
    { month: 'Jan', score: 65 },
    { month: 'Feb', score: 70 },
    { month: 'Mar', score: 68 },
    { month: 'Apr', score: 75 },
    { month: 'May', score: 82 },
    { month: 'Jun', score: 78 },
  ];

  const chartData = data || defaultData;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Performance Trend</h3>
        <Activity size={24} className="text-blue-600" />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '13px', fontWeight: '500' }} />
          <YAxis stroke="#6b7280" domain={[0, 100]} style={{ fontSize: '13px', fontWeight: '500' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              padding: '16px'
            }}
            itemStyle={{ color: '#1f2937', fontWeight: 'bold' }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorScore)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Rating Distribution Chart
const RatingDistributionChart = () => {
  const data = [
    { name: 'Excellent', value: 35, color: '#10b981' },
    { name: 'Good', value: 40, color: '#3b82f6' },
    { name: 'Average', value: 18, color: '#f59e0b' },
    { name: 'Needs Improvement', value: 7, color: '#ef4444' },
  ];

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Rating Distribution</h3>
        <BarChart3 size={24} className="text-purple-600" />
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '13px', fontWeight: '500' }} />
          <YAxis stroke="#6b7280" style={{ fontSize: '13px', fontWeight: '500' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              padding: '16px'
            }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Next Steps Section Component
const NextStepsSection = ({ assessment, reviewQueue, pips, userRole, feedback }) => {
  const steps = [];

  if (assessment?.status !== 'submitted') {
    steps.push({
      id: 1,
      title: 'Complete Self Assessment',
      description: 'Share your perspective on your performance and achievements',
      icon: FileText,
      color: 'bg-blue-100 text-blue-600',
      bgLight: 'bg-blue-50',
      borderColor: 'border-blue-500',
    });
  }

  if ((userRole === 'manager' || userRole === 'admin' || userRole === 'hr') && reviewQueue?.length > 0) {
    steps.push({
      id: 2,
      title: 'Review Team Members',
      description: `${reviewQueue.length} team member(s) awaiting your review`,
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
      bgLight: 'bg-orange-50',
      borderColor: 'border-orange-500',
    });
  }

  if (feedback?.pending?.length > 0) {
    steps.push({
      id: 3,
      title: 'Respond to Feedback',
      description: `${feedback.pending.length} feedback request(s) waiting for your response`,
      icon: MessageSquare,
      color: 'bg-pink-100 text-pink-600',
      bgLight: 'bg-pink-50',
      borderColor: 'border-pink-500',
    });
  }

  if (pips && pips.length > 0) {
    steps.push({
      id: 4,
      title: 'Check PIPs',
      description: `${pips.length} active performance improvement plan(s)`,
      icon: Target,
      color: 'bg-red-100 text-red-600',
      bgLight: 'bg-red-50',
      borderColor: 'border-red-500',
    });
  }

  steps.push({
    id: 5,
    title: 'Review Settings',
    description: 'Configure your review preferences and notification settings',
    icon: Settings,
    color: 'bg-purple-100 text-purple-600',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-500',
  });

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Next Steps</h3>
        <Zap size={24} className="text-yellow-500" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className={`${step.bgLight} rounded-xl p-5 border-l-4 ${step.borderColor} hover:shadow-md transition-shadow duration-300`}>
              <div className="flex items-start gap-4">
                <div className={`${step.color} p-3 rounded-xl flex-shrink-0`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-base mb-1">{step.title}</h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Quick Actions Grid Component
const QuickActionsGrid = ({ assessment, reviewQueue, navigate, userRole }) => {
  const actions = [
    {
      label: assessment?.status === 'submitted' ? 'View Self Assessment' : 'Complete Self Assessment',
      icon: FileText,
      route: REVIEW_ROUTES.REVIEW_SELF_ASSESSMENT,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
    },
    ...(userRole === 'manager' || userRole === 'admin' || userRole === 'hr' ? [{
      label: `Review Team (${reviewQueue?.length || 0})`,
      icon: Users,
      route: REVIEW_ROUTES.REVIEW_QUEUE,
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700',
    }] : []),
    {
      label: 'View Analytics',
      icon: TrendingUp,
      route: '/reviews/analytics',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
    },
    {
      label: 'Explore Cycles',
      icon: Award,
      route: REVIEW_ROUTES.REVIEW_CYCLES,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
    },
    {
      label: 'Feedback Requests',
      icon: MessageSquare,
      route: REVIEW_ROUTES.REVIEW_FEEDBACK || '/reviews/feedback',
      color: 'from-pink-500 to-pink-600',
      hoverColor: 'hover:from-pink-600 hover:to-pink-700',
    },
    {
      label: 'Final Ratings',
      icon: Star,
      route: REVIEW_ROUTES.REVIEW_FINAL_RATINGS,
      color: 'from-yellow-500 to-yellow-600',
      hoverColor: 'hover:from-yellow-600 hover:to-yellow-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={index}
            onClick={() => navigate(action.route)}
            className={`bg-gradient-to-br ${action.color} ${action.hoverColor} rounded-2xl p-6 text-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 group`}
          >
            <div className="flex flex-col items-start justify-between h-full gap-5">
              <Icon size={32} className="group-hover:scale-110 transition-transform duration-300" />
              <div className="text-left">
                <p className="font-bold text-base group-hover:translate-x-1 transition-transform duration-300">{action.label}</p>
              </div>
              <ChevronRight size={24} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 self-end" />
            </div>
          </button>
        );
      })}
    </div>
  );
};

// Insights Component
const InsightsComponent = ({ insights }) => {
  const defaultInsights = [
    { id: 1, title: 'Your productivity has increased by 15% this quarter', type: 'positive', icon: TrendingUp },
    { id: 2, title: 'Consider scheduling a check-in with your manager', type: 'warning', icon: AlertTriangle },
    { id: 3, title: 'Great progress on your goals! Keep up the good work', type: 'positive', icon: Star },
  ];

  const displayInsights = insights?.length > 0 ? insights.slice(0, 3) : defaultInsights;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Insights</h3>
        <Lightbulb size={24} className="text-purple-600" />
      </div>
      <div className="space-y-4">
        {displayInsights.map((insight) => {
          const Icon = insight.icon || Lightbulb;
          const bgColor = insight.type === 'positive' ? 'bg-green-50' : insight.type === 'warning' ? 'bg-yellow-50' : 'bg-red-50';
          const textColor = insight.type === 'positive' ? 'text-green-700' : insight.type === 'warning' ? 'text-yellow-700' : 'text-red-700';
          const iconColor = insight.type === 'positive' ? 'text-green-600' : insight.type === 'warning' ? 'text-yellow-600' : 'text-red-600';
          
          return (
            <div key={insight.id} className={`${bgColor} rounded-xl p-4 flex items-start gap-3`}>
              <Icon size={20} className={`${iconColor} flex-shrink-0 mt-0.5`} />
              <p className={`text-sm font-medium ${textColor}`}>{insight.title}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Recent Activity Component
const RecentActivityComponent = () => {
  const activities = [
    { id: 1, title: 'Self-assessment started', date: '2 days ago', icon: FileText, color: 'text-blue-600' },
    { id: 2, title: 'Feedback received from John', date: '5 days ago', icon: MessageSquare, color: 'text-pink-600' },
    { id: 3, title: 'Review cycle Q2 2024 started', date: '1 week ago', icon: Calendar, color: 'text-green-600' },
  ];

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
        <Activity size={24} className="text-blue-600" />
      </div>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors duration-200">
              <div className={`p-2 rounded-lg bg-gray-100`}>
                <Icon size={18} className={activity.color} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.date}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Dashboard Component
const DashboardPage = () => {
  const navigate = useNavigate();
  const { activeCycle, fetchActiveCycle, loading: cyclesLoading } = useCycles();
  const { myAssessment, fetchMyAssessment, loading: assessmentLoading } = useSelfAssessment();
  const { reviewQueue, fetchReviewQueue, loading: queueLoading } = useSupervisorReview();
  const { myRating, fetchMyRating, loading: ratingLoading } = useFinalRatings();
  const { myPIPs, fetchMyPIPs, loading: pipsLoading } = usePIPs();
  const { loading: feedbackLoading } = useFeedback();
  const { loading: analyticsLoading } = useAnalytics({ autoFetch: false });
  const { loading: insightsLoading } = useInsights({ autoFetch: false });
  const { loading: predictionsLoading } = usePredictions({ autoFetch: false });

  const [userRole, setUserRole] = useState('staff');

  useEffect(() => {
    fetchActiveCycle();
    fetchMyAssessment();
    fetchReviewQueue();
    fetchMyRating();
    fetchMyPIPs();
    setUserRole(localStorage.getItem('user_role') || 'staff');
  }, []);

  const isLoading = cyclesLoading || assessmentLoading || queueLoading || ratingLoading || pipsLoading || feedbackLoading || analyticsLoading || insightsLoading || predictionsLoading;

  if (isLoading) {
    return <LoadingState />;
  }

  const activePIPs = myPIPs?.filter(p => p.status === 'active') || [];
  const mockFeedback = { pending: [] };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-5xl font-extrabold text-gray-900">Performance Dashboard</h1>
          </div>
          <p className="text-xl text-gray-600">Welcome back! Here's your complete performance overview</p>
        </div>

        {/* Cycle Progress */}
        <CycleProgress activeCycle={activeCycle} />

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            icon={FileText}
            label="Self Assessment"
            value={myAssessment?.status === 'submitted' ? '✓' : myAssessment?.status === 'draft' ? '...' : '○'}
            status={myAssessment?.status === 'submitted' ? 'completed' : myAssessment?.status === 'draft' ? 'pending' : 'pending'}
            onClick={() => navigate(REVIEW_ROUTES.REVIEW_SELF_ASSESSMENT)}
            trend={myAssessment?.status === 'submitted' ? 'Submitted' : 'In Progress'}
            trendColor={myAssessment?.status === 'submitted' ? 'text-green-600' : 'text-yellow-600'}
          />

          {(userRole === 'manager' || userRole === 'admin' || userRole === 'hr') && (
            <StatCard
              icon={Users}
              label="Pending Reviews"
              value={reviewQueue?.length || 0}
              status={reviewQueue?.length > 0 ? 'alert' : 'completed'}
              onClick={() => navigate(REVIEW_ROUTES.REVIEW_QUEUE)}
              trend={reviewQueue?.length > 0 ? `${reviewQueue.length} awaiting` : 'All caught up'}
              trendColor={reviewQueue?.length > 0 ? 'text-red-600' : 'text-green-600'}
              trendIcon={reviewQueue?.length > 0 ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            />
          )}

          {myRating && (
            <StatCard
              icon={Award}
              label="Final Rating"
              value={myRating.final_score ? `${myRating.final_score}%` : '-'}
              status={myRating.final_score >= 80 ? 'completed' : 'pending'}
              onClick={() => navigate(REVIEW_ROUTES.REVIEW_FINAL_RATINGS)}
              trend={myRating.final_score ? `${Math.round(myRating.final_score / 20)} / 5` : 'Pending'}
              trendColor={myRating.final_score >= 80 ? 'text-green-600' : 'text-gray-600'}
            />
          )}

          {activePIPs.length > 0 && (
            <StatCard
              icon={Target}
              label="Active PIPs"
              value={activePIPs.length}
              status="alert"
              onClick={() => navigate(REVIEW_ROUTES.REVIEW_PIPS)}
              trend={`${activePIPs.length} plan${activePIPs.length !== 1 ? 's' : ''} active`}
              trendColor="text-red-600"
            />
          )}
        </div>

        {/* Rating Badge, Trend Chart, and Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {myRating?.final_score && (
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Your Rating</h3>
                <Star size={24} className="text-yellow-500" />
              </div>
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="text-7xl font-extrabold text-gray-900">{myRating.final_score}</div>
                <RatingBadge score={myRating.final_score} />
                <p className="text-sm text-gray-600 text-center">Based on latest evaluation</p>
              </div>
            </div>
          )}

          <div className="lg:col-span-2">
            <PerformanceTrendChart data={null} />
          </div>
        </div>

        {/* Insights, Distribution, Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <InsightsComponent insights={null} />
          <RatingDistributionChart />
          <RecentActivityComponent />
        </div>

        {/* Next Steps Section */}
        <div className="mb-10">
          <NextStepsSection
            assessment={myAssessment}
            reviewQueue={reviewQueue}
            pips={activePIPs}
            userRole={userRole}
            feedback={mockFeedback}
          />
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Quick Actions</h2>
          <QuickActionsGrid
            assessment={myAssessment}
            reviewQueue={reviewQueue}
            navigate={navigate}
            userRole={userRole}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
