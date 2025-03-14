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

<template>
  <view class="index">
    index
    <AuthPopup ref="authPopupRef" />
  </view>
</template>

<style lang="scss">
.popup-wrap {
  padding: 20px;
  background-color: #fff;
  border-radius: 10px 10px 0 0;
  .popup-wrap-header {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;
  }

  .row-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    .col {
      font-size: 14px;
      color: #a3a3a3;
    }
  }

  .btn-wrap {
    display: flex;
    padding: 20px 0;
    justify-content: center;
  }
  .btn {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    color: #fff;
    width: 40%;
  }
  .prevent {
    background-color: #efefef;
    color: #333;
    margin-right: 10px;
  }
  .ok {
    background-color: #499d32;
  }

  .avatar {
    width: 50px;
    height: 50px;
  }
}
</style>
