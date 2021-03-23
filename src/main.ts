import Vue from 'vue';
import App from './interface/app.vue';
import NitroBorder from './interface/utils/components/Border/Border.vue';
import NitroFrame from './interface/utils/components/Frame/Frame.vue';
import directives from './interface/utils/directives';
import filters from './interface/utils/filters';

Vue.config.productionTip = false;

new Vue({
    filters: filters,
    directives: directives,
    render: h => h(App),
}).$mount('#app');

Vue.directive('draggable',directives.Draggable);

Vue.component('nitro-frame', NitroFrame);

Vue.component('nitro-border', NitroBorder);
