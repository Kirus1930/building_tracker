<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>{{ isRegistering ? 'Регистрация' : 'Вход' }}</h2>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>

      <form @submit.prevent="onSubmit" class="auth-form">
        <div v-if="isRegistering" class="form-field">
          <label for="fullName">Полное имя</label>
          <input
            id="fullName"
            v-model="fullName"
            type="text"
            placeholder="Иван Иванов"
            required
          />
        </div>

        <div class="form-field">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="user@example.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-field">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            :autocomplete="isRegistering ? 'new-password' : 'current-password'"
            required
          />
        </div>

        <div v-if="isRegistering" class="form-field">
          <label for="role">Роль</label>
          <select id="role" v-model="role" required>
            <option value="engineer">Инженер</option>
            <option value="manager">Менеджер</option>
            <option value="team_lead">Руководитель бригады</option>
            <option value="admin">Администратор</option>
          </select>
          <p class="role-hint">{{ roleDescriptions[role] }}</p>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Загрузка...' : (isRegistering ? 'Зарегистрироваться' : 'Войти') }}
        </button>
      </form>

      <button @click="toggleMode" class="btn-link">
        {{ isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const route = useRoute();
const router = useRouter();
const { signIn, signUp, isAuthenticated } = useAuth();

const isRegistering = ref(false);
const email = ref('');
const password = ref('');
const fullName = ref('');
const role = ref('engineer');
const error = ref('');
const success = ref('');
const loading = ref(false);

const roleDescriptions = {
  engineer: 'Просмотр дефектов и проектов',
  manager: 'Создание и координация работ',
  team_lead: 'Оценка прогресса и закрытие задач',
  admin: 'Полный доступ к системе'
};

function toggleMode() {
  isRegistering.value = !isRegistering.value;
  error.value = '';
  success.value = '';
}

async function onSubmit() {
  error.value = '';
  success.value = '';
  loading.value = true;

  try {
    if (isRegistering.value) {
      await signUp({
        email: email.value.trim(),
        password: password.value,
        fullName: fullName.value.trim(),
        role: role.value,
      });
      success.value = 'Регистрация успешна! Войдите в систему.';
      isRegistering.value = false;
      email.value = '';
      password.value = '';
      fullName.value = '';
    } else {
      await signIn({
        email: email.value.trim(),
        password: password.value,
      });

      const redirect = (route.query.redirect && String(route.query.redirect)) || '/projects';
      if (isAuthenticated.value) {
        router.push(redirect);
      }
    }
  } catch (e) {
    error.value = e?.message || (isRegistering.value ? 'Ошибка регистрации' : 'Ошибка входа');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.auth-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
}

.auth-card h2 {
  margin: 0 0 1.5rem 0;
  text-align: center;
  color: #333;
}

.auth-form .form-field {
  margin-bottom: 1rem;
}

.auth-form label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
  color: #555;
}

.auth-form input,
.auth-form select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem;
}

.auth-form input:focus,
.auth-form select:focus {
  outline: none;
  border-color: #667eea;
}

.role-hint {
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #666;
  font-style: italic;
}

.btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-link {
  background: none;
  color: #667eea;
  margin-top: 1rem;
  text-decoration: underline;
}

.btn-link:hover {
  color: #5568d3;
}

.error {
  color: #e53e3e;
  background: #fff5f5;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
}

.success {
  color: #38a169;
  background: #f0fff4;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
}
</style>
