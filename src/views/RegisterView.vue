<!-- RegisterView.vue — теперь просто оборачивает AuthForm -->
<template>
  <AuthForm mode="register" />
</template>

<script setup lang="ts">
import AuthForm from '@/components/AuthForm.vue'
</script>
