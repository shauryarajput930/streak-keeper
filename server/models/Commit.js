const supabase = require('../config/supabase');

class Commit {
  static async create(commitData) {
    const { data, error } = await supabase
      .from('commits')
      .insert([{
        user_id: commitData.userId,
        github_sha: commitData.githubSha,
        date: commitData.date,
        message: commitData.message,
        repo: commitData.repo,
        branch: commitData.branch,
        triggered_by: commitData.triggeredBy || 'manual',
        status: commitData.status || 'success',
        error_msg: commitData.errorMsg
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findByUserId(userId, options = {}) {
    let query = supabase
      .from('commits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  static async findByUserIdAndDate(userId, date) {
    const { data, error } = await supabase
      .from('commits')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('commits')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateById(id, updateData) {
    const updateFields = {};
    
    if (updateData.githubSha) updateFields.github_sha = updateData.githubSha;
    if (updateData.message) updateFields.message = updateData.message;
    if (updateData.repo) updateFields.repo = updateData.repo;
    if (updateData.branch) updateFields.branch = updateData.branch;
    if (updateData.triggeredBy) updateFields.triggered_by = updateData.triggeredBy;
    if (updateData.status) updateFields.status = updateData.status;
    if (updateData.errorMsg) updateFields.error_msg = updateData.errorMsg;

    const { data, error } = await supabase
      .from('commits')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteById(id) {
    const { error } = await supabase
      .from('commits')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  static async findByUserIdAndDateRange(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('commits')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}

module.exports = Commit;
