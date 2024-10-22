const passport = require('passport');
const table = require('../config/airtableConfig');
const axios = require('axios');

// Redirects the user to GitHub for authentication
exports.githubLogin = (req, res, next) => {
    passport.authenticate('github', { 
        scope: ['user:email', 'repo'] // Added repo scope to access repositories
    })(req, res, next);
};

// Helper function to fetch GitHub user details
async function fetchGitHubUserDetails(accessToken) {
    if (!accessToken) {
        throw new Error('No access token provided');
    }

    const headers = {
        Authorization: `token ${accessToken}`, // Changed from Bearer to token
        Accept: 'application/vnd.github.v3+json'
    };

    try {
        // Fetch user profile
        const userResponse = await axios.get('https://api.github.com/user', { headers });
        
        // Fetch repositories
        const reposResponse = await axios.get(`https://api.github.com/user/repos?per_page=100`, { headers });
        
        // Fetch issues
        const issuesResponse = await axios.get(`https://api.github.com/issues?filter=all&state=all&per_page=100`, { headers });
        
        // Calculate repository statistics
        const repos = reposResponse.data;
        const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
        
        return {
            avatar_url: userResponse.data.avatar_url,
            name: userResponse.data.name,
            bio: userResponse.data.bio,
            location: userResponse.data.location,
            public_repos: userResponse.data.public_repos,
            followers: userResponse.data.followers,
            following: userResponse.data.following,
            total_stars: totalStars,
            total_forks: totalForks,
            repositories: repos.map(repo => ({
                name: repo.name,
                description: repo.description,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                language: repo.language,
                url: repo.html_url
            })),
            recent_issues: issuesResponse.data.slice(0, 10).map(issue => ({
                title: issue.title,
                state: issue.state,
                created_at: issue.created_at,
                url: issue.html_url
            }))
        };
    } catch (error) {
        console.error('Error fetching GitHub details:', error);
        throw error;
    }
}

// Modified GitHub callback function
exports.githubCallback = (req, res, next) => {
    passport.authenticate('github', async (err, profile, info) => {
        if (err) {
            console.error('Authentication error:', err);
            return next(err);
        }
        
        if (!profile) {
            console.error('No profile received');
            return res.redirect('http://localhost:5173/');
        }

        try {
            // Make sure we have the access token
            if (!info || !info.accessToken) {
                throw new Error('No access token received from GitHub');
            }

            // Fetch detailed GitHub information
            const githubDetails = await fetchGitHubUserDetails(info.accessToken);
            
            // Check if user exists in Airtable
            const records = await table.select({
                filterByFormula: `{githubid} = '${profile.id}'`
            }).firstPage();

            let user;
            const userData = {
                fields: {
                    githubid: profile.id,
                    username: profile.username,
                    email: profile.emails?.[0]?.value || 'N/A',
                    avatar_url: githubDetails.avatar_url,
                    name: githubDetails.name,
                    bio: githubDetails.bio,
                    location: githubDetails.location,
                    public_repos: githubDetails.public_repos,
                    followers: githubDetails.followers,
                    following: githubDetails.following,
                    total_stars: githubDetails.total_stars,
                    total_forks: githubDetails.total_forks,
                    repositories: JSON.stringify(githubDetails.repositories),
                    recent_issues: JSON.stringify(githubDetails.recent_issues),
                    last_updated: new Date().toISOString(),
                    access_token: info.accessToken // Store the access token
                }
            };

            if (records.length > 0) {
                // Update existing user
                user = await table.update(records[0].id, userData);
            } else {
                // Create new user
                const createdRecords = await table.create([userData]);
                user = createdRecords[0];
            }

            // Store user data in session
            req.logIn(user, (err) => {
                if (err) {
                    console.error('Login error:', err);
                    return next(err);
                }
                return res.redirect('http://localhost:5173/HomePage');
            });
        } catch (error) {
            console.error('Error in GitHub callback:', error);
            return res.redirect('http://localhost:5173/HomePage');
        }
    })(req, res, next);
};

exports.getProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const record = await table.find(req.user.id);
        res.json(record.fields);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error });
    }
};

exports.updateUsername = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    try {
        const updated = await table.update(req.user.id, {
            fields: { username }
        });
        res.json(updated.fields);
    } catch (error) {
        res.status(500).json({ message: 'Error updating username', error });
    }
};

exports.updateProfileImage = async (req, res) => {
    if (!req.user || !req.file) {
        return res.status(401).json({ message: 'Not authenticated or no file provided' });
    }

    try {
        // Implementation depends on your image storage solution
        // This is a placeholder - you'll need to implement actual image upload
        const imageUrl = await uploadImageToStorage(req.file);
        
        const updated = await table.update(req.user.id, {
            fields: { avatar_url: imageUrl }
        });
        
        res.json({ imageUrl });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile image', error });
    }
};

exports.logout = (req, res) => {
    req.logout();
    res.json({ message: 'Logged out successfully' });
};