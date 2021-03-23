import { Nitro } from 'nitro-renderer/src/nitro/Nitro';
import Vue from 'vue';

export default Vue.filter('translate', function (value: string)
{
    return Nitro.instance.getLocalization(value);
});
