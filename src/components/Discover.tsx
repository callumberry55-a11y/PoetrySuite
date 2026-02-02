import { useState, useEffect } from 'react';
import { Shield, Sparkles, Brain, Zap, Target } from 'lucide-react';
import { runSecurityChecks } from '../utils/security';

export default function Discover() {
  const [securityStatus, setSecurityStatus] = useState<'active' | 'inactive' | 'checking'>('checking');

  useEffect(() => {
    const performCheck = async () => {
      setSecurityStatus('checking');
      const result = await runSecurityChecks('some-user-input');
      setSecurityStatus(result ? 'active' : 'inactive');
    };

    performCheck();
    const interval = setInterval(performCheck, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderSecurityStatus = () => {
    switch (securityStatus) {
      case 'active':
        return (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Shield size={18} />
            <span className="hidden sm:inline">AI Security Guard: Active</span>
            <span className="sm:hidden">Security Active</span>
          </div>
        );
      case 'inactive':
        return (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <Shield size={18} />
            <span className="hidden sm:inline">AI Security Guard: Inactive</span>
            <span className="sm:hidden">Security Inactive</span>
          </div>
        );
      case 'checking':
        return (
          <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
            <Shield size={18} className="animate-pulse" />
            <span className="hidden sm:inline">AI Security Guard: Checking...</span>
            <span className="sm:hidden">Checking...</span>
          </div>
        );
      default:
        return null;
    }
  };

  const aiTools = [
    {
      icon: Sparkles,
      title: 'AI Poetry Assistant',
      description: 'Get intelligent suggestions and improvements for your poetry',
      color: 'from-blue-500 to-cyan-500',
      status: 'Available'
    },
    {
      icon: Brain,
      title: 'Style Analysis',
      description: 'Analyze your writing style and get personalized insights',
      color: 'from-purple-500 to-pink-500',
      status: 'Available'
    },
    {
      icon: Zap,
      title: 'Quick Generate',
      description: 'Generate poem ideas based on themes and emotions',
      color: 'from-yellow-500 to-orange-500',
      status: 'Available'
    },
    {
      icon: Target,
      title: 'Form Validator',
      description: 'Check if your poem matches specific poetic forms',
      color: 'from-green-500 to-emerald-500',
      status: 'Available'
    }
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-background to-secondary-container/20">
      <div className="p-4 sm:p-6 border-b border-outline">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-on-background">AI Hub</h1>
          {renderSecurityStatus()}
        </div>
        <p className="text-on-surface-variant text-sm sm:text-base">
          Enhance your poetry with AI-powered tools and insights
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-primary/10 to-tertiary/10 rounded-2xl p-4 sm:p-6 border border-outline">
              <div className="flex items-start gap-3 sm:gap-4">
                <Shield className="text-primary flex-shrink-0" size={32} />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-2">AI Security Guard</h2>
                  <p className="text-sm sm:text-base text-on-surface-variant mb-3">
                    Our AI-powered security system monitors all content in real-time to ensure a safe and respectful community.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-surface border border-outline">
                    {renderSecurityStatus()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-on-surface mb-4 sm:mb-6">AI-Powered Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-20">
            {aiTools.map((tool, index) => (
              <div
                key={index}
                className="bg-surface rounded-xl shadow-sm border border-outline overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className={`h-2 bg-gradient-to-r ${tool.color}`}></div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-br ${tool.color} bg-opacity-10`}>
                      <tool.icon className="text-on-surface" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-on-surface mb-2">{tool.title}</h3>
                      <p className="text-sm sm:text-base text-on-surface-variant mb-4">
                        {tool.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 font-medium">
                          {tool.status}
                        </span>
                        <button className="px-3 sm:px-4 py-2 bg-primary text-on-primary rounded-lg font-medium transition-all group-hover:shadow-md text-sm sm:text-base">
                          Try Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface rounded-xl shadow-sm border border-outline p-4 sm:p-6 mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-on-surface mb-3">Coming Soon</h3>
            <ul className="space-y-2 text-sm sm:text-base text-on-surface-variant">
              <li className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span>Advanced rhyme and meter analysis</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span>Collaborative AI co-writing sessions</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span>Personalized poetry recommendations</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <span>Multi-language translation and adaptation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
