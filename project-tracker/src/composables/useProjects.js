import { ref } from 'vue';
import { supabase } from '@/lib/supabase';

export function useProjects() {
  const projects = ref([]);
  const currentProject = ref(null);
  const loading = ref(false);
  const error = ref(null);

  async function fetchProjects(filters = {}) {
    loading.value = true;
    error.value = null;

    try {
      let query = supabase
        .from('projects')
        .select(`
          *,
          created_by_profile:profiles!created_by(full_name)
        `)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      projects.value = data;
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching projects:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchProjectById(id) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select(`
          *,
          created_by_profile:profiles!created_by(full_name),
          stages:project_stages(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      currentProject.value = data;
      return data;
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching project:', err);
    } finally {
      loading.value = false;
    }
  }

  async function createProject(projectData) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: createError } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (createError) throw createError;

      projects.value = [data, ...projects.value];
      return data;
    } catch (err) {
      error.value = err.message;
      console.error('Error creating project:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateProject(id, updates) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: updateError } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const index = projects.value.findIndex(p => p.id === id);
      if (index !== -1) {
        projects.value[index] = data;
      }

      if (currentProject.value?.id === id) {
        currentProject.value = { ...currentProject.value, ...data };
      }

      return data;
    } catch (err) {
      error.value = err.message;
      console.error('Error updating project:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteProject(id) {
    loading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      projects.value = projects.value.filter(p => p.id !== id);

      if (currentProject.value?.id === id) {
        currentProject.value = null;
      }
    } catch (err) {
      error.value = err.message;
      console.error('Error deleting project:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createStage(projectId, stageData) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: createError } = await supabase
        .from('project_stages')
        .insert({
          project_id: projectId,
          ...stageData
        })
        .select()
        .single();

      if (createError) throw createError;

      if (currentProject.value?.id === projectId) {
        currentProject.value.stages = [...(currentProject.value.stages || []), data];
      }

      return data;
    } catch (err) {
      error.value = err.message;
      console.error('Error creating stage:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateStage(stageId, updates) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: updateError } = await supabase
        .from('project_stages')
        .update(updates)
        .eq('id', stageId)
        .select()
        .single();

      if (updateError) throw updateError;

      if (currentProject.value?.stages) {
        const index = currentProject.value.stages.findIndex(s => s.id === stageId);
        if (index !== -1) {
          currentProject.value.stages[index] = data;
        }
      }

      return data;
    } catch (err) {
      error.value = err.message;
      console.error('Error updating stage:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteStage(stageId) {
    loading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from('project_stages')
        .delete()
        .eq('id', stageId);

      if (deleteError) throw deleteError;

      if (currentProject.value?.stages) {
        currentProject.value.stages = currentProject.value.stages.filter(s => s.id !== stageId);
      }
    } catch (err) {
      error.value = err.message;
      console.error('Error deleting stage:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    projects,
    currentProject,
    loading,
    error,
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    createStage,
    updateStage,
    deleteStage,
  };
}
