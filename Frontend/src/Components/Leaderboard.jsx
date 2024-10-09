import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Leaderboard = () => {
    const [data, setData] = useState({ issues: [], usersWithMostIssuesSolved: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const owner = 'juspay';
    const repo = 'hyperswitch';

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/auth/repo/${owner}/${repo}`);
                setData(response.data); // Set the entire response which includes issues and user counts
            } catch (err) {
                console.error('Error fetching issues:', err);
                setError('Failed to fetch issues');
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Leaderboard</h1>
            <h2>Users with Most Issues Solved</h2>
            {data.usersWithMostIssuesSolved.length > 0 ? (
                <ul>
                    {data.usersWithMostIssuesSolved.map(({ user, count }) => (
                        <li key={user}>
                            {user}: {count} issues solved
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No users found who solved issues.</p>
            )}
            <h2>Closed Issues</h2>
            {data.issues.length > 0 ? (
                <ul>
                    {data.issues.map(issue => (
                        <li key={issue.id}>
                            <a href={issue.url} target="_blank" rel="noopener noreferrer">{issue.title}</a> - {issue.state}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No closed issues found.</p>
            )}
        </div>
    );
};    

export default Leaderboard;
