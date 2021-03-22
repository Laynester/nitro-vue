import Vue from 'vue';
import App from './interface/app.vue';
import Colourize from './interface/utils/directives/Colourize';

Vue.config.productionTip = false;

new Vue({
    render: h => h(App),
    directives: { Colourize },
}).$mount('#app');
