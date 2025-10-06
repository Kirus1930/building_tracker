import { ref } from 'vue';
import { supabase } from '@/lib/supabase';

export function useDefects() {
  const defects = ref([]);
  const currentDefect = ref(null);
  const loading = ref(false);
  const error = ref(null);

  async function fetchDefects(filters = {}) {
    loading.value = true;
    error.value = null;

    try {
      let query = supabase
        .from('defects')
        .select(`
          *,
          project:projects(id, title),
          stage:project_stages(id, title),
          assigned_user:profiles!assigned_to(id, full_name),
          created_user:profiles!created_by(id, full_name)
        `)
        .order('created_at', { ascending: false });

      if (filters.project_id) {
        query = query.eq('project_id', filters.project_id);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      defects.value = data;
      return data;
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching defects:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchDefectById(id) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('defects')
        .select(`
          *,
          project:projects(id, title),
          stage:project_stages(id, title),
          assigned_user:profiles!assigned_to(id, full_name, role),
          created_user:profiles!created_by(id, full_name, role)
        `)
        .eq('id', id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      currentDefect.value = data;
      return data;
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching defect:', err);
    } finally {
      loading.value = false;
    }
  }

  async function createDefect(defectData) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: createError } = await supabase
        .from('defects')
        .insert(defectData)
        .select(`
          *,
          project:projects(id, title),
          stage:project_stages(id, title),
          assigned_user:profiles!assigned_to(id, full_name),
          created_user:profiles!created_by(id, full_name)
        `)
        .single();

      if (createError) throw createError;

      defects.value = [data, ...defects.value];
      return data;
    } catch (err) {
      error.value = err.message;
      console.error('Error creating defect:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateDefect(id, updates, userId) {
    loading.value = true;
    error.value = null;

    try {
      const oldDefect = currentDefect.value || defects.value.find(d => d.id === id);

      const { data, error: updateError } = await supabase
        .from('defects')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          project:projects(id, title),
          stage:project_stages(id, title),
          assigned_user:profiles!assigned_to(id, full_name),
          created_user:profiles!created_by(id, full_name)
        `)
        .single();

      if (updateError) throw updateError;

      if (oldDefect && userId) {
        const changes = [];
        for (const [key, value] of Object.entries(updates)) {
          if (oldDefect[key] !== value) {
            changes.push({
              defect_id: id,
              user_id: userId,
              field_name: key,
              old_value: String(oldDefect[key] || ''),
              new_value: String(value || ''),
            });
          }
        }

        if (changes.length > 0) {
          await supabase.from('defect_history').insert(changes);
        }
      }

      const index = defects.value.findIndex(d => d.id === id);
      if (index !== -1) {
        defects.value[index] = data;
      }

      if (currentDefect.value?.id === id) {
        currentDefect.value = data;
      }

      return data;
    } catch (err) {
      error.value = err.message;
      console.error('Error updating defect:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteDefect(id) {
    loading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from('defects')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      defects.value = defects.value.filter(d => d.id !== id);

      if (currentDefect.value?.id === id) {
        currentDefect.value = null;
      }
    } catch (err) {
      error.value = err.message;
      console.error('Error deleting defect:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchDefectHistory(defectId) {
    try {
      const { data, error: fetchError } = await supabase
        .from('defect_history')
        .select(`
          *,
          user:profiles(full_name)
        `)
        .eq('defect_id', defectId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      return data;
    } catch (err) {
      console.error('Error fetching defect history:', err);
      throw err;
    }
  }

  async function fetchDefectComments(defectId) {
    try {
      const { data, error: fetchError } = await supabase
        .from('defect_comments')
        .select(`
          *,
          user:profiles(full_name, avatar_url)
        `)
        .eq('defect_id', defectId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      return data;
    } catch (err) {
      console.error('Error fetching comments:', err);
      throw err;
    }
  }

  async function addComment(defectId, userId, content) {
    try {
      const { data, error: insertError } = await supabase
        .from('defect_comments')
        .insert({
          defect_id: defectId,
          user_id: userId,
          content,
        })
        .select(`
          *,
          user:profiles(full_name, avatar_url)
        `)
        .single();

      if (insertError) throw insertError;

      return data;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  }

  async function deleteComment(commentId) {
    try {
      const { error: deleteError } = await supabase
        .from('defect_comments')
        .delete()
        .eq('id', commentId);

      if (deleteError) throw deleteError;
    } catch (err) {
      console.error('Error deleting comment:', err);
      throw err;
    }
  }

  async function fetchDefectAttachments(defectId) {
    try {
      const { data, error: fetchError } = await supabase
        .from('defect_attachments')
        .select(`
          *,
          uploader:profiles!uploaded_by(full_name)
        `)
        .eq('defect_id', defectId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      return data;
    } catch (err) {
      console.error('Error fetching attachments:', err);
      throw err;
    }
  }

  async function uploadAttachment(defectId, file, userId) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `defects/${defectId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('defect-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data, error: insertError } = await supabase
        .from('defect_attachments')
        .insert({
          defect_id: defectId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: userId,
        })
        .select(`
          *,
          uploader:profiles!uploaded_by(full_name)
        `)
        .single();

      if (insertError) throw insertError;

      return data;
    } catch (err) {
      console.error('Error uploading attachment:', err);
      throw err;
    }
  }

  async function deleteAttachment(attachmentId, filePath) {
    try {
      await supabase.storage
        .from('defect-attachments')
        .remove([filePath]);

      const { error: deleteError } = await supabase
        .from('defect_attachments')
        .delete()
        .eq('id', attachmentId);

      if (deleteError) throw deleteError;
    } catch (err) {
      console.error('Error deleting attachment:', err);
      throw err;
    }
  }

  async function getStatistics(projectId = null) {
    try {
      let query = supabase
        .from('defects')
        .select('status, priority');

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const stats = {
        total: data.length,
        byStatus: {},
        byPriority: {},
      };

      data.forEach(defect => {
        stats.byStatus[defect.status] = (stats.byStatus[defect.status] || 0) + 1;
        stats.byPriority[defect.priority] = (stats.byPriority[defect.priority] || 0) + 1;
      });

      return stats;
    } catch (err) {
      console.error('Error fetching statistics:', err);
      throw err;
    }
  }

  return {
    defects,
    currentDefect,
    loading,
    error,
    fetchDefects,
    fetchDefectById,
    createDefect,
    updateDefect,
    deleteDefect,
    fetchDefectHistory,
    fetchDefectComments,
    addComment,
    deleteComment,
    fetchDefectAttachments,
    uploadAttachment,
    deleteAttachment,
    getStatistics,
  };
}
