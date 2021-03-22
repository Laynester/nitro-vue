import Vue from 'vue';
import { DynamicStyle } from '../DynamicStyle';

export default Vue.directive('colourizer', function (el, binding)
{
    DynamicStyle.getInstance().addElement(el, binding.value);
});
