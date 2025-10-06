<template>
  <div>
    <h2>Список проектов</h2>
    <button @click="goToAdd" class="add-button">Добавить новый проект</button>
    <table class="projects-table">
      <thead>
        <tr>
          <th>Название</th>
          <th>Дедлайн</th>
          <th>Статус</th>
          <th>Приоритет</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="project in projects" :key="project.id">
          <td>{{ project.title }}</td>
          <td>{{ project.deadline || '—' }}</td>
          <td>{{ project.done ? 'Выполнен' : 'Не выполнен' }}</td>
          <td>{{ project.priority }}</td>
          <td>
            <!-- Кнопка/ссылка просмотра -->
            <RouterLink :to="`/projects/${project.id}`" class="action-link">Просмотр</RouterLink>
            <!-- Кнопка/ссылка редактирования -->
            <RouterLink :to="`/projects/edit/${project.id}`" class="action-link">Редактировать</RouterLink>
            <!-- Кнопка удаления -->
            <button @click="deleteProject(project.id)" class="action-link delete-btn">Удалить</button>
          </td>
        </tr>
        <tr v-if="projects.length === 0">
          <td colspan="5" style="text-align:center; padding: 1em;">Проектов пока нет.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, RouterLink } from 'vue-router';

const projects = ref([]); // реактивный массив проектов
const router = useRouter();

// Функция для загрузки списка проектов из localStorage
function loadProjects() {
  const saved = localStorage.getItem('projects');
  projects.value = saved ? JSON.parse(saved) : [];
}

// При монтировании компонента загружаем проекты
onMounted(() => {
  loadProjects();
});

// Навигация к странице добавления
function goToAdd() {
  router.push('/projects/add');
}

// Удаление проекта по id
function deleteProject(id) {
  // Запрашиваем подтверждение от пользователя
  if (!confirm('Вы уверены, что хотите удалить этот проект?')) {
    return; // если отменил, выходим
  }
  // 1. Удаляем из реактивного массива
  projects.value = projects.value.filter(project => project.id !== id);
  // 2. Сохраняем обновлённый список в localStorage
  localStorage.setItem('projects', JSON.stringify(projects.value));
}
</script>

<style>
.projects-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1em;
}
.projects-table th, .projects-table td {
  border: 1px solid #ccc;
  padding: 0.5em;
}
.add-button {
  margin-bottom: 0.5em;
}
.action-link {
  margin-right: 0.5em;
  background: none;
  border: none;
  color: blue;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}
.delete-btn {
  color: red;
}
</style>
