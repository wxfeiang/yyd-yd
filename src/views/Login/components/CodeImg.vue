<script setup lang="ts">
import { useCode } from "./useLogin";
const { getCodeImg, url } = useCode();
</script>
<template>
  <div
    class="absolute top-[6px] right-0 w-[140px] h-[28px] text-center bg-[#1890ff] cursor-pointer"
    @click="getCodeImg"
  >
    <el-image :src="url" fit="fill">
      <template #error>
        <Icon icon="ep:picture" />
      </template>
    </el-image>
  </div>
</template>
