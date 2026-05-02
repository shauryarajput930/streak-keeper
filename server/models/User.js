const supabase = require('../config/supabase');

class User {
  static async findByGithubId(githubId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('github_id', githubId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async create(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        github_id: userData.githubId,
        username: userData.username,
        display_name: userData.displayName,
        avatar_url: userData.avatarUrl,
        email: userData.email,
        profile_url: userData.profileUrl,
        access_token: userData.accessToken,
        repo_config: userData.repoConfig || {},
        scheduler_config: userData.schedulerConfig || {},
        stats: userData.stats || {}
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateById(id, updateData) {
    const updateFields = {};
    
    if (updateData.username) updateFields.username = updateData.username;
    if (updateData.displayName) updateFields.display_name = updateData.displayName;
    if (updateData.avatarUrl) updateFields.avatar_url = updateData.avatarUrl;
    if (updateData.email) updateFields.email = updateData.email;
    if (updateData.profileUrl) updateFields.profile_url = updateData.profileUrl;
    if (updateData.accessToken) updateFields.access_token = updateData.accessToken;
    if (updateData.repoConfig) updateFields.repo_config = updateData.repoConfig;
    if (updateData.schedulerConfig) updateFields.scheduler_config = updateData.schedulerConfig;
    if (updateData.stats) updateFields.stats = updateData.stats;

    const { data, error } = await supabase
      .from('users')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateByGithubId(githubId, updateData) {
    const user = await this.findByGithubId(githubId);
    if (!user) return null;
    
    return await this.updateById(user.id, updateData);
  }

  static async deleteById(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
}

module.exports = User;
