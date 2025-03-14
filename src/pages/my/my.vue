<script setup lang="ts">
import { useUserStore } from '@/stores'

const userStore = useUserStore()
</script>

<template>
  <view class="my">
    <view>会员信息：{{ userStore.profile }}</view>

    <button @tap="userStore.clearProfile()" size="mini" plain type="warn">清理用户信息</button>
  </view>
</template>

<style lang="scss">
//
</style>
