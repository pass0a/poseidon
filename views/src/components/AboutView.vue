<template>
    <div>
        <el-card class="box-card" shadow="never" style="margin:5px 10px 10px 10px;">
            <h1>当前版本号 : {{ this.$store.state.version }}</h1>
        </el-card>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
@Component
export default class AboutView extends Vue {
}
</script>