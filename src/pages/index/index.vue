<script setup lang="ts">
import { onMounted, ref } from 'vue'

import p1 from '@/static/images/avatar.png'
import { useUserStore } from '@/stores'
import { http } from '@/utils/http'

const popupRef = ref(null) as any

onMounted(() => {
  checkIsLogin()
})

const userStore = useUserStore()

const checkIsLogin = () => {
  if (userStore?.profile?.token) {
    return
  }

  uni.showModal({
    title: '温馨提示',
    content: '授权微信登录后才能点餐',
    confirmText: '登录',
    showCancel: false,
    success: (res) => {
      if (!res.confirm) {
        return
      }

      uni.showLoading({
        title: '登录中',
      })
      // 调用登录接口
      uni.login({
        provider: 'weixin',
        success: (loginRes) => {
          if (loginRes.code) {
            // 获取用户信息
            console.log('loginRes', loginRes)

            wxLogin(loginRes.code)
          }
        },
        complete: (complete) => {
          uni.hideLoading()
        },
      })
    },
  })
}

const wxLogin = async (code: string) => {
  try {
    const { data }: any = await http({
      url: 'http://localhost:8080/user/login',
      method: 'POST',
      data: {
        code,
      },
    })
    console.log(data, data.token)
    const userStore = useUserStore()
    // 添加token
    userStore.setProfile({
      ...userStore.profile,
      token: data.token,
      id: data.id,
      name: data.name,
      avatar: data.avatar,
    })

    // 如果没有昵称，弹出授权弹窗
    if (!data?.name) {
      // 隐藏底部导航栏
      uni.hideTabBar()
      // 打开微信授权登录弹窗
      setTimeout(() => {
        popupRef.value?.open?.('bottom')
      }, 500)
    }
  } catch (error) {
    uni.showToast({
      title: '登录失败',
      icon: 'none',
    })
  }
}

const getUserInfo = () => {
  // 获取用户信息
  uni.getUserInfo({
    provider: 'weixin',
    success: async (infoRes) => {
      console.log('infoRes', infoRes)

      userStore.setProfile({
        ...userStore.profile,
        avatar: infoRes.userInfo.avatarUrl,
        nickname: infoRes.userInfo.nickName,
      })

      // 添加用户信息
      await http({
        url: `http://localhost:8080/user/${userStore.profile.id}`,
        method: 'PUT',
        data: {
          avatar: userStore.profile.avatar,
          nickname: userStore.profile.nickname,
        },
      })
    },
  })

  uni.showToast({
    title: '登录成功',
    icon: 'none',
  })

  // 隐藏底部导航栏
  uni.showTabBar()

  // 关闭弹窗
  popupRef.value?.close?.()
}
</script>

<template>
  <view class="index">
    index
    <uni-popup ref="popupRef" type="bottom" border-radius="10px 10px 0 0">
      <view class="popup-wrap">
        <view class="popup-wrap-header">申请获取您的头像、昵称</view>
        <!-- 头像 -->
        <view class="row-item">
          <view class="col">头像：</view>
          <view class="col">
            <image :src="p1" class="avatar" />
          </view>
        </view>

        <!-- 昵称 -->
        <view class="row-item">
          <view class="col">昵称：</view>
          <view class="col">test</view>
        </view>

        <view class="btn-wrap">
          <view class="btn prevent">拒绝</view>
          <view class="btn ok" @click="getUserInfo">允许</view>
        </view>
      </view>
    </uni-popup>
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
