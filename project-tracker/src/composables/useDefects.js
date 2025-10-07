import { ref } from 'vue';
import { getFromStorage, saveToStorage, STORAGE_KEYS, generateId } from '@/utils/storage';

export function useDefects() {
  const defects = ref([]);
  const currentDefect = ref(null);
  const loading = ref(false);
  const error = ref(null);

  function fetchDefects(filters = {}) {
    loading.value = true;
    error.value = null;

    try {
      let data = getFromStorage(STORAGE_KEYS.DEFECTS) || [];

      if (filters.projectId) {
        data = data.filter(d => d.projectId === filters.projectId);
      }

      if (filters.status) {
        data = data.filter(d => d.status === filters.status);
      }

      if (filters.priority) {
        data = data.filter(d => d.priority === filters.priority);
      }

      if (filters.assignedTo) {
        data = data.filter(d => d.assignedTo === filters.assignedTo);
      }

      if (filters.search) {
        const search = filters.search.toLowerCase();
        data = data.filter(d =>
          d.title.toLowerCase().includes(search) ||
          (d.description && d.description.toLowerCase().includes(search))
        );
      }

      defects.value = data.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      return data;
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching defects:', err);
    } finally {
      loading.value = false;
    }
  }

  function fetchDefectById(id) {
    loading.value = true;
    error.value = null;

    try {
      const data = getFromStorage(STORAGE_KEYS.DEFECTS) || [];
      const defect = data.find(d => d.id === id);
      currentDefect.value = defect || null;
      return defect;
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching defect:', err);
    } finally {
      loading.value = false;
    }
  }

  function createDefect(defectData) {
    loading.value = true;
    error.value = null;

    try {
      const data = getFromStorage(STORAGE_KEYS.DEFECTS) || [];

      const newDefect = {
        id: generateId(),
        ...defectData,
        status: defectData.status || 'new',
        priority: defectData.priority || 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      data.push(newDefect);
      saveToStorage(STORAGE_KEYS.DEFECTS, data);

      defects.value = [newDefect, ...defects.value];
      return newDefect;
    } catch (err) {
      error.value = err.message;
      console.error('Error creating defect:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function updateDefect(id, updates, userId = null) {
    loading.value = true;
    error.value = null;

    try {
      const data = getFromStorage(STORAGE_KEYS.DEFECTS) || [];
      const index = data.findIndex(d => d.id === id);

      if (index === -1) {
        throw new Error('Дефект не найден');
      }

      const oldDefect = { ...data[index] };

      data[index] = {
        ...data[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      saveToStorage(STORAGE_KEYS.DEFECTS, data);

      if (userId) {
        const history = getFromStorage(STORAGE_KEYS.HISTORY) || [];
        for (const [key, value] of Object.entries(updates)) {
          if (oldDefect[key] !== value) {
            history.push({
              id: generateId(),
              defectId: id,
              userId,
              fieldName: key,
              oldValue: String(oldDefect[key] || ''),
              newValue: String(value || ''),
              createdAt: new Date().toISOString(),
            });
          }
        }
        saveToStorage(STORAGE_KEYS.HISTORY, history);
      }

      const defectIndex = defects.value.findIndex(d => d.id === id);
      if (defectIndex !== -1) {
        defects.value[defectIndex] = data[index];
      }

      if (currentDefect.value?.id === id) {
        currentDefect.value = data[index];
      }

      return data[index];
    } catch (err) {
      error.value = err.message;
      console.error('Error updating defect:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function deleteDefect(id) {
    loading.value = true;
    error.value = null;

    try {
      const data = getFromStorage(STORAGE_KEYS.DEFECTS) || [];
      const filteredData = data.filter(d => d.id !== id);

      saveToStorage(STORAGE_KEYS.DEFECTS, filteredData);

      defects.value = defects.value.filter(d => d.id !== id);

      if (currentDefect.value?.id === id) {
        currentDefect.value = null;
      }

      const comments = getFromStorage(STORAGE_KEYS.COMMENTS) || [];
      const filteredComments = comments.filter(c => c.defectId !== id);
      saveToStorage(STORAGE_KEYS.COMMENTS, filteredComments);

      const history = getFromStorage(STORAGE_KEYS.HISTORY) || [];
      const filteredHistory = history.filter(h => h.defectId !== id);
      saveToStorage(STORAGE_KEYS.HISTORY, filteredHistory);
    } catch (err) {
      error.value = err.message;
      console.error('Error deleting defect:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function fetchDefectHistory(defectId) {
    try {
      const history = getFromStorage(STORAGE_KEYS.HISTORY) || [];
      return history
        .filter(h => h.defectId === defectId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      console.error('Error fetching defect history:', err);
      throw err;
    }
  }

  function fetchDefectComments(defectId) {
    try {
      const comments = getFromStorage(STORAGE_KEYS.COMMENTS) || [];
      return comments
        .filter(c => c.defectId === defectId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } catch (err) {
      console.error('Error fetching comments:', err);
      throw err;
    }
  }

  function addComment(defectId, userId, content) {
    try {
      const comments = getFromStorage(STORAGE_KEYS.COMMENTS) || [];

      const newComment = {
        id: generateId(),
        defectId,
        userId,
        content,
        createdAt: new Date().toISOString(),
      };

      comments.push(newComment);
      saveToStorage(STORAGE_KEYS.COMMENTS, comments);

      return newComment;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  }

  function deleteComment(commentId) {
    try {
      const comments = getFromStorage(STORAGE_KEYS.COMMENTS) || [];
      const filteredComments = comments.filter(c => c.id !== commentId);
      saveToStorage(STORAGE_KEYS.COMMENTS, filteredComments);
    } catch (err) {
      console.error('Error deleting comment:', err);
      throw err;
    }
  }

  function getStatistics(projectId = null) {
    try {
      let data = getFromStorage(STORAGE_KEYS.DEFECTS) || [];

      if (projectId) {
        data = data.filter(d => d.projectId === projectId);
      }

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
    getStatistics,
  };
}
