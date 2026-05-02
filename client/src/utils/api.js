import axios from 'axios';

axios.defaults.withCredentials = true;

const api = {
  // Config
  saveConfig: (data) => axios.put('/api/user/config', data),
  getRepos:   ()     => axios.get('/api/user/repos'),

  // Push
  pushNow: () => axios.post('/api/user/push'),

  // Data
  getStats:   ()           => axios.get('/api/user/stats'),
  getCommits: (page = 1)   => axios.get(`/api/user/commits?page=${page}&limit=20`),
  getLogs:    (level='all') => axios.get(`/api/user/logs?level=${level}&limit=60`),

  // Account
  deleteAccount: () => axios.delete('/api/user/account'),
};

export default api;
