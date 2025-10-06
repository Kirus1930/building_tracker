<template>
  <div v-if="loaded">
    <h2>Редактировать проект</h2>
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
          Выполнен
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
      <button type="submit">Сохранить изменения</button>
      <RouterLink to="/projects" class="cancel-link">Отмена</RouterLink>
    </form>
  </div>
  <div v-else>
    <p>Загрузка...</p>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';

const route = useRoute();
const router = useRouter();
const form = reactive({
  title: '',
  description: '',
  deadline: '',
  done: false,
  priority: 'Средний'
});
const loaded = reactive(false); // флаг, показывающий, что данные загружены

onMounted(() => {
  const projectId = route.params.id;
  const saved = localStorage.getItem('projects');
  const projects = saved ? JSON.parse(saved) : [];
  const existing = projects.find(p => p.id === projectId);
  if (!existing) {
    // Если проект не найден, перенаправляем на список с сообщением или просто переходим
    alert('Проект не найден');
    router.push('/projects');
    return;
  }
  // Заполняем форму значениями проекта
  form.title = existing.title;
  form.description = existing.description;
  form.deadline = existing.deadline;
  form.done = !!existing.done;
  form.priority = existing.priority || 'Средний';
  loaded.value = true;
});

function handleSubmit() {
  const projectId = route.params.id;
  const saved = localStorage.getItem('projects');
  const projects = saved ? JSON.parse(saved) : [];
  // Обновляем объект в массиве
  const index = projects.findIndex(p => p.id === projectId);
  if (index !== -1) {
    projects[index].title = form.title;
    projects[index].description = form.description;
    projects[index].deadline = form.deadline;
    projects[index].done = form.done;
    projects[index].priority = form.priority;
    // Сохраняем в localStorage
    localStorage.setItem('projects', JSON.stringify(projects));
  }
  // Переходим обратно к просмотру или списку
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
.cancel-link {
  margin-left: 1em;
  text-decoration: none;
  color: #555;
}
</style>
