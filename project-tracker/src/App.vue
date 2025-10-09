<template>
  <div class="app-container">
    <header v-if="isAuthenticated" class="app-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="app-title">Система управления дефектами</h1>
        </div>
        <nav class="nav-menu">
          <RouterLink to="/projects" class="nav-link">
            <span class="nav-icon">📊</span>
            Проекты
          </RouterLink>
          <RouterLink to="/defects" class="nav-link" v-if="canViewDefects">
            <span class="nav-icon">🔧</span>
            Дефекты
          </RouterLink>
          <RouterLink to="/analytics" class="nav-link" v-if="canViewAnalytics">
            <span class="nav-icon">📈</span>
            Аналитика
          </RouterLink>
        </nav>
        <div class="header-right">
          <div class="user-info">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">{{ roleLabel }}</span>
          </div>
          <button @click="handleLogout" class="btn-logout">Выход</button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RouterView, RouterLink, useRouter } from 'vue-router';
import { useAuth } from './composables/useAuth';
import { PERMISSIONS, ROLE_NAMES } from './utils/roles';

const router = useRouter();
const { isAuthenticated, userName, userRole, signOut, canAccess } = useAuth();

const canViewDefects = computed(() => canAccess(PERMISSIONS.VIEW_DEFECTS));
const canViewAnalytics = computed(() => canAccess(PERMISSIONS.VIEW_ANALYTICS));

const roleLabel = computed(() => {
  return userRole.value ? ROLE_NAMES[userRole.value] : '';
});

async function handleLogout() {
  await signOut();
  router.push('/login');
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: var(--bg-secondary);
}

.app-header {
  background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.header-left {
  flex-shrink: 0;
}

.app-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-menu {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.1);
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: translateY(-2px);
}

.nav-link.router-link-active {
  background: white;
  color: #2563eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-icon {
  font-size: 1.125rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
}

.user-name {
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-role {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-logout {
  padding: 0.625rem 1.25rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
  transform: translateY(-2px);
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .app-title {
    font-size: 1.25rem;
  }

  .nav-menu {
    flex-direction: column;
  }

  .header-right {
    flex-direction: column;
    align-items: stretch;
  }

  .user-info {
    align-items: center;
  }

  .main-content {
    padding: 1rem;
  }
}
</style>
