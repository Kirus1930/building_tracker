import { ref } from 'vue';
import { getFromStorage, saveToStorage, STORAGE_KEYS, generateId } from '@/utils/storage';

export function useProjects() {
  const projects = ref([]);
  const currentProject = ref(null);
  const loading = ref(false);
  const error = ref(null);

  function fetchProjects() {
    loading.value = true;
    error.value = null;

    try {
      const data = getFromStorage(STORAGE_KEYS.PROJECTS) || [];
      projects.value = data.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching projects:', err);
    } finally {
      loading.value = false;
    }
  }

  function fetchProjectById(id) {
    loading.value = true;
    error.value = null;

    try {
      const data = getFromStorage(STORAGE_KEYS.PROJECTS) || [];
      const project = data.find(p => p.id === id);
      currentProject.value = project || null;
      return project;
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching project:', err);
    } finally {
      loading.value = false;
    }
  }

  function createProject(projectData) {
    loading.value = true;
    error.value = null;

    try {
      const data = getFromStorage(STORAGE_KEYS.PROJECTS) || [];

      const newProject = {
        id: generateId(),
        ...projectData,
        status: projectData.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      data.push(newProject);
      saveToStorage(STORAGE_KEYS.PROJECTS, data);

      projects.value = [newProject, ...projects.value];
      return newProject;
    } catch (err) {
      error.value = err.message;
      console.error('Error creating project:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function updateProject(id, updates) {
    loading.value = true;
    error.value = null;

    try {
      const data = getFromStorage(STORAGE_KEYS.PROJECTS) || [];
      const index = data.findIndex(p => p.id === id);

      if (index === -1) {
        throw new Error('Проект не найден');
      }

      data[index] = {
        ...data[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      saveToStorage(STORAGE_KEYS.PROJECTS, data);

      const projectIndex = projects.value.findIndex(p => p.id === id);
      if (projectIndex !== -1) {
        projects.value[projectIndex] = data[index];
      }

      if (currentProject.value?.id === id) {
        currentProject.value = data[index];
      }

      return data[index];
    } catch (err) {
      error.value = err.message;
      console.error('Error updating project:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function deleteProject(id) {
    loading.value = true;
    error.value = null;

    try {
      const data = getFromStorage(STORAGE_KEYS.PROJECTS) || [];
      const filteredData = data.filter(p => p.id !== id);

      saveToStorage(STORAGE_KEYS.PROJECTS, filteredData);

      projects.value = projects.value.filter(p => p.id !== id);

      if (currentProject.value?.id === id) {
        currentProject.value = null;
      }

      const defects = getFromStorage(STORAGE_KEYS.DEFECTS) || [];
      const updatedDefects = defects.filter(d => d.projectId !== id);
      saveToStorage(STORAGE_KEYS.DEFECTS, updatedDefects);
    } catch (err) {
      error.value = err.message;
      console.error('Error deleting project:', err);
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
  };
}
