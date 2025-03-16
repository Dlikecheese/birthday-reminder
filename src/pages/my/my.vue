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
</script>

<template>
  <view class="flex items-center gap-2 p-2" v-if="!isLogin">
    <!-- <view>会员信息：{{ userStore.profile }}</view>

    <button @tap="userStore.clearProfile()" size="mini" plain type="warn">清理用户信息</button> -->
    <image :src="displayedAvatarUrl" class="avatar" />
    <view class="cursor-point text-weanken" @click="login">请点击登录</view>
  </view>

  <view v-else class="flex flex-col justify-between h-full">
    <view class="flex items-center justify-between gap-2 p-2">
      <view class="flex items-center gap-2">
        <image :src="displayedAvatarUrl" class="avatar" />
        <view>{{ displayedName }}</view>
      </view>

      <image src="@/static/images/logout.svg" class="logout" @click="logout" />
    </view>
  </view>

  <AuthPopup ref="authPopupRef" />
</template>

<style lang="scss">
.avatar {
  width: 50px;
  height: 50px;
}

.cursor-point {
  cursor: pointer;
}

.logout {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}
</style>

function wxLogin(arg0: () => void) { throw new Error('Function not implemented.') }
