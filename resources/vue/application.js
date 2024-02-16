import { createApp } from 'vue';
import App from './components/App.vue';
                             

const app = createApp(App)
app.config.devtools = true;
app.mount('#app')
