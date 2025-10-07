import { ref, computed } from 'vue';
import { getFromStorage, saveToStorage, STORAGE_KEYS, generateId } from '@/utils/storage';
import { ROLES, hasPermission } from '@/utils/roles';

const currentUser = ref(null);
const loading = ref(false);

function loadCurrentUser() {
  const user = getFromStorage(STORAGE_KEYS.CURRENT_USER);
  currentUser.value = user;
  return user;
}

function saveCurrentUser(user) {
  currentUser.value = user;
  saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
}

function clearCurrentUser() {
  currentUser.value = null;
  saveToStorage(STORAGE_KEYS.CURRENT_USER, null);
}

export function useAuth() {
  const isAuthenticated = computed(() => !!currentUser.value);
  const userRole = computed(() => currentUser.value?.role);
  const userName = computed(() => currentUser.value?.fullName);
  const userEmail = computed(() => currentUser.value?.email);

  const isEngineer = computed(() => userRole.value === ROLES.ENGINEER);
  const isManager = computed(() => userRole.value === ROLES.MANAGER);
  const isTeamLead = computed(() => userRole.value === ROLES.TEAM_LEAD);
  const isAdmin = computed(() => userRole.value === ROLES.ADMIN);

  function canAccess(permission) {
    return hasPermission(userRole.value, permission);
  }

  async function signUp({ email, password, fullName, role = ROLES.ENGINEER }) {
    loading.value = true;

    try {
      const users = getFromStorage(STORAGE_KEYS.USERS) || [];

      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        throw new Error('Пользователь с таким email уже существует');
      }

      if (password.length < 6) {
        throw new Error('Пароль должен содержать минимум 6 символов');
      }

      const newUser = {
        id: generateId(),
        email: email.toLowerCase(),
        password,
        fullName,
        role,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      saveToStorage(STORAGE_KEYS.USERS, users);

      return { success: true, user: newUser };
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function signIn({ email, password }) {
    loading.value = true;

    try {
      const users = getFromStorage(STORAGE_KEYS.USERS) || [];

      const user = users.find(
        u => u.email === email.toLowerCase() && u.password === password
      );

      if (!user) {
        throw new Error('Неверный email или пароль');
      }

      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;

      saveCurrentUser(userWithoutPassword);

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function signOut() {
    loading.value = true;

    try {
      clearCurrentUser();
      return { success: true };
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateProfile(updates) {
    loading.value = true;

    try {
      if (!currentUser.value) {
        throw new Error('Пользователь не авторизован');
      }

      const users = getFromStorage(STORAGE_KEYS.USERS) || [];
      const userIndex = users.findIndex(u => u.id === currentUser.value.id);

      if (userIndex === -1) {
        throw new Error('Пользователь не найден');
      }

      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      saveToStorage(STORAGE_KEYS.USERS, users);

      const updatedUser = { ...users[userIndex] };
      delete updatedUser.password;
      saveCurrentUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function changePassword({ oldPassword, newPassword }) {
    loading.value = true;

    try {
      if (!currentUser.value) {
        throw new Error('Пользователь не авторизован');
      }

      if (newPassword.length < 6) {
        throw new Error('Новый пароль должен содержать минимум 6 символов');
      }

      const users = getFromStorage(STORAGE_KEYS.USERS) || [];
      const userIndex = users.findIndex(u => u.id === currentUser.value.id);

      if (userIndex === -1) {
        throw new Error('Пользователь не найден');
      }

      if (users[userIndex].password !== oldPassword) {
        throw new Error('Неверный текущий пароль');
      }

      users[userIndex].password = newPassword;
      users[userIndex].updatedAt = new Date().toISOString();

      saveToStorage(STORAGE_KEYS.USERS, users);

      return { success: true };
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function getAllUsers() {
    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  function initAuth() {
    loadCurrentUser();
  }

  return {
    currentUser,
    loading,
    isAuthenticated,
    userRole,
    userName,
    userEmail,
    isEngineer,
    isManager,
    isTeamLead,
    isAdmin,
    canAccess,
    signUp,
    signIn,
    signOut,
    updateProfile,
    changePassword,
    getAllUsers,
    initAuth,
  };
}
