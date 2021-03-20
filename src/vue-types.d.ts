import Vue from 'vue';

declare module 'vue/types/vue' {

    interface Vue {
        $services: any;
    }

    interface VueConstructor {
        $services: any;
    }
}

declare module 'vue/types/options' {
    interface ComponentOptions<V extends Vue> {
        $services?: any;
    }
}
