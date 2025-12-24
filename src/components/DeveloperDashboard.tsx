import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { useAuth } from '../contexts/AuthContext';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function DeveloperDashboard() {
  const [stats, setStats] = useState({ users: 0, poems: 0, submissions: 0, feedback: 0 });
  const [feedbackByCategory, setFeedbackByCategory] = useState({});
  const [newDeveloperId, setNewDeveloperId] = useState('');
  const [promotionStatus, setPromotionStatus] = useState('');
  const { promoteToDeveloper } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      const { data: users, error: userError } = await supabase.from('user_profiles').select('user_id', { count: 'exact' });
      if (userError) console.error('Error fetching users', userError);

      const { data: poems, error: poemError } = await supabase.from('poems').select('id', { count: 'exact' });
      if (poemError) console.error('Error fetching poems', poemError);

      const { data: submissions, error: submissionError } = await supabase.from('community_submissions').select('id', { count: 'exact' });
      if (submissionError) console.error('Error fetching submissions', submissionError);

      const { data: feedback, error: feedbackError } = await supabase.from('feedback').select('id', { count: 'exact' });
      if (feedbackError) console.error('Error fetching feedback', feedbackError);

      setStats({ users: users?.length || 0, poems: poems?.length || 0, submissions: submissions?.length || 0, feedback: feedback?.length || 0 });
    };

    const fetchFeedbackByCategory = async () => {
        const { data, error } = await supabase.from('feedback').select('category');
        if (error) {
            console.error('Error fetching feedback by category', error);
            return;
        }

        const counts = data.reduce((acc, { category }) => {
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
        setFeedbackByCategory(counts);
    };

    fetchStats();
    fetchFeedbackByCategory();

    const subscription = supabase
      .channel('developer-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        fetchStats();
        fetchFeedbackByCategory();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handlePromoteDeveloper = async () => {
    if (!newDeveloperId) return;
    const { error } = await promoteToDeveloper(newDeveloperId);
    if (error) {
      setPromotionStatus(`Error promoting user: ${error.message}`);
    } else {
      setPromotionStatus(`User ${newDeveloperId} has been promoted to developer.`);
      setNewDeveloperId('');
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Developer Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Total Users</h3>
          <p className="text-3xl">{stats.users}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Total Poems</h3>
          <p className="text-3xl">{stats.poems}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Total Submissions</h3>
          <p className="text-3xl">{stats.submissions}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Total Feedback</h3>
          <p className="text-3xl">{stats.feedback}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Feedback by Category</h3>
            <Pie data={{
                labels: Object.keys(feedbackByCategory),
                datasets: [{
                    data: Object.values(feedbackByCategory),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
                }]
            }} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Promote User to Developer</h3>
          <div className="flex flex-col space-y-2">
            <input
              type="text"
              placeholder="Enter User ID"
              value={newDeveloperId}
              onChange={(e) => setNewDeveloperId(e.target.value)}
              className="p-2 border rounded"
            />
            <button
              onClick={handlePromoteDeveloper}
              className="p-2 bg-blue-500 text-white rounded"
            >
              Promote
            </button>
          </div>
          {promotionStatus && <p className="mt-4 text-sm">{promotionStatus}</p>}
        </div>
      </div>
    </div>
  );
}