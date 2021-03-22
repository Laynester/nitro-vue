<template src="./index.html">
	<div v-colourizer="['frame|3']">
		<div
			v-colourizer="[
				'frame-header|3',
				'skin-3/ubuntu-frame-header.png',
				'#3E98B8',
			]"
		>
			hello 123
		</div>
		<div class="p-1">test</div>
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class HelloWorld extends Vue {
	@Prop() private msg!: string;
}
</script>
