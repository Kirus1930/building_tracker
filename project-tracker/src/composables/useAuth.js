// Композабл единого реактивного состояния авторизации.
// Хранит { isAuth, user, token } в localStorage, даёт методы login/logout.

import { ref, computed, watch } from 'vue';

const LS_KEY = 'auth';

// Глобальное (на модуль) реактивное состояние авторизации:
const authState = ref({
  isAuth: false,
  user: null,   // { username: '...' }
  token: null,  // демо-токен (строка)
});

// Инициализация из localStorage при загрузке модуля:
(function loadAuthFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Минимальная валидация структуры:
      authState.value = {
        isAuth: !!parsed.isAuth,
        user: parsed.user ?? null,
        token: parsed.token ?? null,
      };
    }
  } catch {
    // Игнорируем ошибки JSON
  }
})();

// Автосохранение состояния при любых изменениях:
watch(
  authState,
  (val) => {
    localStorage.setItem(LS_KEY, JSON.stringify(val));
  },
  { deep: true }
);

// Псевдо-логин: принимает непустые username+password, генерит демо-токен.
// В реале здесь запрос к API и получение реального JWT/сессии.
function login({ username, password }) {
  if (!username || !password) {
    throw new Error('Введите логин и пароль');
  }
  const token = btoa(`${username}:${Date.now()}`); // демо-токен
  authState.value = {
    isAuth: true,
    user: { username },
    token,
  };
  return true;
}

// Выход: очищаем состояние
function logout() {
  authState.value = { isAuth: false, user: null, token: null };
}

const isAuthenticated = computed(() => authState.value.isAuth);
const currentUser = computed(() => authState.value.user);

export function useAuth() {
  return {
    authState,
    isAuthenticated,
    currentUser,
    login,
    logout,
  };
}