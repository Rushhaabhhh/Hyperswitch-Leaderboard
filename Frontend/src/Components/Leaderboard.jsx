import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState('weekly');

  const owner = 'juspay';
  const repo = 'hyperswitch';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/leaderboard/repo/${owner}/${repo}?timeFrame=${timeFrame}`);
        setLeaderboardData(response.data.leaderboard || []);
        setTotalItems(response.data.totalItems || 0);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, [timeFrame]);

  if (loading) return <div className="mt-4 text-center">Loading...</div>;
  if (error) return <div className="mt-4 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto mt-10 px-6 py-8">
      <h2 className="text-3xl font-semibold">Contributor Leaderboard</h2>
      <p className="text-gray-600 mt-2">Contributors for {owner}/{repo}</p>

      <select
        value={timeFrame}
        onChange={(e) => setTimeFrame(e.target.value)}
        className="mt-4 p-2 border rounded"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>

      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contributions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboardData.map((contributor, index) => (
              <tr key={contributor.username}>
                <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap">{contributor.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">{contributor.contributions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xl">Total Items: {totalItems}</p>
    </div>
  );
};

export default Leaderboard;