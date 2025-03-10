<script setup lang="ts">
import { useUserStore } from '@/stores'

const userStore = useUserStore()
</script>

<template>
  <view class="my">
    <view>会员信息：{{ userStore.profile }}</view>
    <button
      @tap="
        userStore.setProfile({
          nickname: '黑马先锋',
        })
      "
      size="mini"
      plain
      type="primary"
    >
      保存用户信息
    </button>
    <button @tap="userStore.clearProfile()" size="mini" plain type="warn">清理用户信息</button>
  </view>
</template>

<style lang="scss">
//
</style>
