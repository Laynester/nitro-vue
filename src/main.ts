import Vue from 'vue';
import App from './interface/app.vue';
import NitroBorder from './interface/utils/components/Border/Border.vue';
import NitroFrame from './interface/utils/components/Frame/Frame.vue';
import Colourize from './interface/utils/directives/Colourize';

Vue.config.productionTip = false;

Vue.component('nitro-frame', NitroFrame);

Vue.component('nitro-border', NitroBorder);

new Vue({
    render: h => h(App),
    directives: { Colourize },
}).$mount('#app');
