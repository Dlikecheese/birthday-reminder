<script setup lang="ts">
import { useUserStore } from '@/stores'
import defaultAvatar from '@/static/images/default-avatar.jpeg'
import { ref } from 'vue'
import { wxLogin } from '@/utils/util'
import { http } from '@/utils/http'

const isLogin = ref(!!useUserStore()?.profile?.token)
// 默认为默认头像和默认名称
let displayedAvatarUrl = ref(defaultAvatar)
let displayedName = ref('微信用户')

const { name, avatar } = useUserStore()?.profile ?? {}

if (isLogin.value) {
  displayedAvatarUrl.value = avatar
  displayedName.value = name
}

// 监听用户信息变化
useUserStore().$subscribe((mutation, state) => {
  if (mutation.storeId === 'user') {
    const newVal = state.profile
    isLogin.value = !!newVal?.token
    displayedAvatarUrl.value = newVal?.avatar ?? defaultAvatar
    displayedName.value = newVal?.name ?? '微信用户'
  }
})

const authPopupRef = ref(null) as any
const login = async () => {
  // 弹出登录中的弹窗
  uni.showLoading({ title: '登录中' })
  const userInfo = await wxLogin()

  if (!userInfo) {
    authPopupRef.value?.openPopup?.()
  }
}

const logout = async () => {
  // 添加是否退出登录的确认
  const res = await uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
  })
  if (!res.confirm) {
    return
  }

  // 调用接口退出登录
  await http({
    url: '/user/logout',
    method: 'GET',
  })
  useUserStore().clearProfile()
  uni.showToast({
    title: '退出登录成功',
    icon: 'success',
  })
}

const operations = [
  {
    label: '我的信息',
    click: () => {
      // uni.navigateTo({
      //   url: '/pages/myInfo/myInfo',
      // })
    },
    id: 'info',
  },
  {
    label: '提个意见',
    click: () => {
      uni.navigateTo({
        url: '/pagesMy/feedback/feedback',
      })
    },
    id: 'feedback',
  },
]
</script>

<template>
  <uni-card class="header">
    <view class="flex items-center gap-2 p-2" v-if="!isLogin">
      <image :src="displayedAvatarUrl" class="avatar" />
      <view class="cursor-point text-light" @click="login">请点击登录</view>
    </view>

    <view v-else class="flex flex-col justify-between">
      <view class="flex items-center justify-between gap-2 p-2">
        <view class="flex items-center gap-2">
          <image :src="displayedAvatarUrl" class="avatar" />
          <view class="username">{{ displayedName }}</view>
        </view>

        <image src="@/static/images/logout.svg" class="logout" @click="logout" />
      </view>
    </view>
  </uni-card>

  <view class="operation-wrap" v-if="isLogin">
    <view v-for="item in operations" :key="item.id" class="operation-item-wrap" @click="item.click">
      <view class="flex items-center justify-between">
        <view class="left">{{ item.label }}</view>
        <view class="right" @click="item.click">></view>
      </view>
    </view>
  </view>

  <AuthPopup ref="authPopupRef" />
</template>

<style lang="scss">
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.username {
  color: #fff;
}

.cursor-point {
  cursor: pointer;
}

.logout {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.header {
  ::v-deep .uni-card {
    background-color: #ff4b78 !important;
  }
}

.operation-wrap {
  background-color: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  margin: 15px;
  .operation-item-wrap {
    padding: 15px 20px;
    border-bottom: 1px solid #f0f0f0;
    .left {
      color: #333;
    }
    .right {
      color: #999;
    }
  }
}

.mb-10 {
  margin-bottom: 10px;
}
</style>
