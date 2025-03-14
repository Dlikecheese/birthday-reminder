<template>
  <view class="index">
    index
    <AuthPopup ref="authPopupRef" />
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onTabItemTap } from '@dcloudio/uni-app'
import { checkIsLogin } from '@/utils/util'

const authPopupRef = ref(null) as any

onMounted(() => {
  checkIsLogin(() => {
    authPopupRef.value?.openPopup?.()
  })
})

onTabItemTap(() => {
  checkIsLogin(() => {
    authPopupRef.value?.openPopup?.()
  })
})
</script>

<style lang="scss"></style>
