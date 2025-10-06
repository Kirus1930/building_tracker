<template>
  <div v-if="project">
    <h2>{{ project.title }}</h2>
    <p><strong>Описание:</strong> {{ project.description || '—' }}</p>
    <p><strong>Дедлайн:</strong> {{ project.deadline || '—' }}</p>
    <p><strong>Статус:</strong> {{ project.done ? 'Выполнен' : 'Не выполнен' }}</p>
    <p><strong>Приоритет:</strong> {{ project.priority }}</p>

    <div class="actions">
      <RouterLink :to="`/projects/edit/${project.id}`" class="action-link">✏️ Редактировать</RouterLink>
      <button @click="deleteProject" class="action-link delete-btn">🗑️ Удалить</button>
      <RouterLink to="/projects" class="action-link">← Назад к списку</RouterLink>
    </div>
  </div>
  <div v-else>
    <p>Проект не найден.</p>
    <RouterLink to="/projects">Вернуться к списку</RouterLink>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';

const route = useRoute();
const router = useRouter();
const project = ref(null); // объект проекта (или null, если не найден)

// При монтировании компонента загрузим проект по ID
onMounted(() => {
  const projectId = route.params.id;
  const saved = localStorage.getItem('projects');
  const projects = saved ? JSON.parse(saved) : [];
  // Найдем проект с нужным id
  const found = projects.find(p => p.id === projectId);
  project.value = found || null;
});

// Функция удаления проекта
function deleteProject() {
  if (!project.value) return;
  if (!confirm('Удалить этот проект?')) {
    return;
  }
  // Удаляем проект из localStorage
  const saved = localStorage.getItem('projects');
  const projects = saved ? JSON.parse(saved) : [];
  const updatedProjects = projects.filter(p => p.id !== project.value.id);
  localStorage.setItem('projects', JSON.stringify(updatedProjects));
  // После удаления перенаправляем к списку
  router.push('/projects');
}
</script>

<style>
.actions {
  margin-top: 1em;
}
.action-link {
  margin-right: 1em;
  background: none;
  border: none;
  color: blue;
  cursor: pointer;
  text-decoration: underline;
}
.delete-btn {
  color: red;
}
</style>
