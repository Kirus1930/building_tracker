<template>
  <div class="login-wrap">
    <h2>Вход</h2>

    <!-- Сообщение об ошибке -->
    <p v-if="error" class="error">{{ error }}</p>

    <!-- Форма авторизации -->
    <form @submit.prevent="onSubmit" class="login-form">
      <div class="form-field">
        <label for="username">Логин (или e-mail)</label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="user@email.com"
          autocomplete="username"
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
          autocomplete="current-password"
          required
        />
      </div>

      <button type="submit" class="btn">Войти</button>
    </form>

    <p class="hint">
      Подсказка: для демо подойдут любые непустые логин/пароль.
    </p>
  </div>
</template>

<script setup>
// Простой экран авторизации.
// Логика: берём username/password, зовём useAuth().login(), редиректим
// на redirect (если был), иначе — на /projects.

import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const route = useRoute();
const router = useRouter();
const { login, isAuthenticated } = useAuth();

const username = ref('');
const password = ref('');
const error = ref('');

// Сабмит формы:
async function onSubmit() {
  error.value = '';
  try {
    await login({ username: username.value.trim(), password: password.value.trim() });
    // Если до логина пользователь шёл на защищённый маршрут — вернём его туда:
    const redirect = (route.query.redirect && String(route.query.redirect)) || '/projects';
    // Если уже авторизован — просто переход:
    if (isAuthenticated.value) {
      router.push(redirect);
    }
  } catch (e) {
    // В нашем примере login бросает ошибку, если поля пустые.
    error.value = e?.message || 'Не удалось войти';
  }
}
</script>

<style>
.login-wrap { max-width: 420px; margin: 2rem auto; }
.login-form .form-field { margin-bottom: 1rem; }
.login-form label { display: block; margin-bottom: .25rem; font-weight: 600; }
.login-form input { width: 100%; padding: .5rem; box-sizing: border-box; }
.btn { padding: .5rem 1rem; }
.error { color: #c00; margin-bottom: .5rem; }
.hint { color: #666; font-size: .9rem; margin-top: .75rem; }
</style>
