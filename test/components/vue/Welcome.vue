<template>
  <div class="max-w-screen-sm p-12 mx-auto bg-gray-50 rounded-md shadow-lg">
    <h1 class="text-2xl">Welcome {{ username }}!</h1>
  </div>
</template>

<script setup lang="ts">

defineProps({
  username: String,
});

</script>
