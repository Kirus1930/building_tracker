<template>
  <div class="app-container">
    <header>
      <h1>Мои проекты</h1>
      <nav>
        <!-- Навигационные ссылки с помощью RouterLink -->
        <RouterLink to="/projects" class="nav-link">Список проектов</RouterLink>
        <RouterLink to="/projects/add" class="nav-link">Добавить проект</RouterLink>
      </nav>
    </header>
    <!-- Основной вывод страницы -->
    <main>
      <RouterView /> <!-- здесь будет отображаться активный компонент страницы -->
    </main>
  </div>
</template>

<script setup>
import { RouterView, RouterLink } from 'vue-router';
</script>

<style>
/* Простейшие стили для наглядности */
header {
  background: #333; color: #fff; padding: 1em;
  display: flex; align-items: center; justify-content: space-between;
}
nav .nav-link {
  margin-right: 1em; color: #fff; text-decoration: none;
}
nav .nav-link:hover {
  text-decoration: underline;
}
main { padding: 1em; }
</style>
