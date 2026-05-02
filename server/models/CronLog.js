const supabase = require('../config/supabase');

class CronLog {
  static async create(logData) {
    const { data, error } = await supabase
      .from('cron_logs')
      .insert([{
        user_id: logData.userId,
        level: logData.level || 'info',
        message: logData.message,
        meta: logData.meta || {},
        source: logData.source || 'system'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findByUserId(userId, options = {}) {
    let query = supabase
      .from('cron_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.level && options.level !== 'all') {
      query = query.eq('level', options.level);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  static async deleteByUserId(userId) {
    const { error } = await supabase
      .from('cron_logs')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  }
}

module.exports = CronLog;
