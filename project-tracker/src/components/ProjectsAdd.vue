<template>
  <div>
    <h2>Добавить новый проект</h2>
    <form @submit.prevent="handleSubmit" class="project-form">
      <div class="form-field">
        <label for="title">Название:</label>
        <input id="title" v-model="form.title" type="text" required />
      </div>
      <div class="form-field">
        <label for="description">Описание:</label>
        <textarea id="description" v-model="form.description" rows="3"></textarea>
      </div>
      <div class="form-field">
        <label for="deadline">Дедлайн:</label>
        <input id="deadline" v-model="form.deadline" type="date" />
      </div>
      <div class="form-field">
        <label>
          <input type="checkbox" v-model="form.done" />
          Выполнен (завершён)
        </label>
      </div>
      <div class="form-field">
        <label for="priority">Приоритет:</label>
        <select id="priority" v-model="form.priority">
          <option>Высокий</option>
          <option>Средний</option>
          <option>Низкий</option>
        </select>
      </div>
      <button type="submit">Создать проект</button>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
// Объект формы с полями проекта (reactive для удобства)
const form = reactive({
  title: '',
  description: '',
  deadline: '',
  done: false,
  priority: 'Средний' // по умолчанию средний приоритет
});

// Обработка отправки формы
function handleSubmit() {
  // Создаем новый объект проекта
  const newProject = {
    id: Date.now().toString(), // генерируем уникальный ID (текущим временем)
    title: form.title,
    description: form.description,
    deadline: form.deadline,
    done: form.done,
    priority: form.priority
  };
  // Получаем текущий список проектов из localStorage
  const saved = localStorage.getItem('projects');
  const projects = saved ? JSON.parse(saved) : [];
  // Добавляем новый проект в массив
  projects.push(newProject);
  // Сохраняем обратно в localStorage
  localStorage.setItem('projects', JSON.stringify(projects));
  // Перенаправляем на список проектов
  router.push('/projects');
}
</script>

<style>
.project-form {
  max-width: 400px;
}
.form-field {
  margin-bottom: 1em;
}
.form-field label {
  display: block;
  margin-bottom: 0.3em;
  font-weight: bold;
}
.form-field input[type="text"],
.form-field textarea,
.form-field select,
.form-field input[type="date"] {
  width: 100%;
  padding: 0.3em;
  box-sizing: border-box;
}
</style>
