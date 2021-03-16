import Vue from 'vue';
import App from './interface/app.vue';
import store from './interface/store';

Vue.config.productionTip = false;

new Vue({
    store,
    render: h => h(App)
}).$mount('#app');
