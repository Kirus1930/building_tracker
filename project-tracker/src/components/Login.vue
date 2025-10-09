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
  background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
  padding: 1rem;
}

.auth-card {
  background: white;
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 440px;
}

.auth-card h2 {
  margin: 0 0 2rem 0;
  text-align: center;
  color: #1e293b;
  font-size: 1.875rem;
  font-weight: 700;
}

.auth-form .form-field {
  margin-bottom: 1.25rem;
}

.auth-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #334155;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.auth-form input,
.auth-form select {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  box-sizing: border-box;
  font-size: 1rem;
  transition: all 0.2s;
}

.auth-form input:focus,
.auth-form select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.role-hint {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
  font-style: italic;
  padding-left: 0.25rem;
}

.btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #2563eb;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-link {
  background: none;
  color: #2563eb;
  margin-top: 1.25rem;
  text-decoration: none;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s;
}

.btn-link:hover {
  color: #1d4ed8;
  border-bottom-color: #2563eb;
}

.error {
  color: #dc2626;
  background: #fef2f2;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.25rem;
  text-align: center;
  border-left: 4px solid #dc2626;
  font-weight: 500;
}

.success {
  color: #059669;
  background: #f0fdf4;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.25rem;
  text-align: center;
  border-left: 4px solid #059669;
  font-weight: 500;
}
</style>
