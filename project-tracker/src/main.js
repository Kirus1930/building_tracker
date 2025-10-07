import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { initializeStorage } from './utils/storage';
import { useAuth } from './composables/useAuth';

initializeStorage();

const app = createApp(App);

app.use(router);

const { initAuth } = useAuth();
initAuth();

app.mount('#app');
