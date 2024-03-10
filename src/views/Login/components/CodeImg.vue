<script setup lang="ts">
const condImgUrl = ref("");
</script>
<template>
  <div class="absolute top-[6px] right-0 w-[140px] h-[28px] text-center bg-[#1890ff]">
    <el-image :src="condImgUrl" fit="fill">
      <template #error>
        <Icon icon="ep:picture" />
      </template>
    </el-image>
  </div>
</template>
