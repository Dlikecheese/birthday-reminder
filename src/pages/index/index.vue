<template>
  <view class="index">
    index
    <AuthPopup ref="authPopupRef" />
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { onTabItemTap } from '@dcloudio/uni-app'
import { isLogin, toLogin } from '@/utils/util'

const authPopupRef = ref(null) as any

onMounted(async () => {
  await checkLogin()
})

onTabItemTap(async () => {
  await checkLogin()
})

const checkLogin = async () => {
  if (!isLogin()) {
    try {
      const userInfo = await toLogin()

      if (!userInfo) {
        authPopupRef.value?.openPopup?.()
      }
    } catch (error) {
      console.error(error)
    }
  }
}
</script>

<style lang="scss"></style>
