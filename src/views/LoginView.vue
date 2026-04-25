<!-- LoginView.vue — теперь просто оборачивает AuthForm -->
<template>
  <AuthForm mode="login" />
</template>

<script setup lang="ts">
import AuthForm from '@/components/AuthForm.vue'
</script>
