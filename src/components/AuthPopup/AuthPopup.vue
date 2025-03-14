<template>
  <uni-popup ref="popupRef" type="bottom" border-radius="10px 10px 0 0">
    <view class="popup-wrap">
      <view class="popup-wrap-header">申请获取您的头像、昵称</view>
      <!-- 头像 -->
      <view class="row-item">
        <view class="col">头像：</view>
        <view class="col">
          <image :src="imgUrl" class="avatar" />
        </view>
      </view>

      <!-- 昵称 -->
      <view class="row-item">
        <view class="col">昵称：</view>
        <view class="col">{{ name }}</view>
      </view>

      <view class="btn-wrap">
        <view class="btn prevent">拒绝</view>
        <view class="btn ok" @click="permit">允许</view>
      </view>
    </view>
  </uni-popup>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/index'
import { http } from '@/utils/http'
import { onMounted, ref } from 'vue'

import type { UserInfo } from '@/types/common'

const popupRef = ref(null) as any
let imgUrl = ref('')
let name = ref('')
const userStore = useUserStore()

onMounted(async () => {
  // 获取用户信息
  const userInfo: UserInfo = await getWXUserInfo()
  imgUrl.value = userInfo.avatarUrl
  name.value = userInfo.nickName
})

function getWXUserInfo(): Promise<UserInfo> {
  return new Promise((resolve, reject) => {
    uni.getUserInfo({
      provider: 'weixin',
      success: (res: any) => {
        resolve(res.userInfo) // 成功时返回结果
      },
      fail: (err) => {
        uni.showToast({
          title: err?.errMsg ?? '获取用户信息失败',
          icon: 'none',
        })
      },
    })
  })
}

// 允许授权
const permit = async (): Promise<void> => {
  userStore.setProfile({
    ...userStore.profile,
    avatarUrl: imgUrl.value,
    name: name.value,
  })

  // 添加用户信息
  await http({
    url: `/user/${userStore.profile.id}`,
    method: 'PUT',
    data: {
      avatar: userStore.profile.avatarUrl,
      name: userStore.profile.name,
    },
  })

  uni.showToast({
    title: '登录成功',
    icon: 'none',
  })

  // 隐藏底部导航栏
  uni.showTabBar()

  // 关闭弹窗
  closePopup()
}

// 打开弹窗
const openPopup = (): void => {
  popupRef.value?.open?.('bottom')
}

// 关闭弹窗
const closePopup = (): void => {
  popupRef.value?.close?.()
}

// 暴露方法给父组件
defineExpose({
  openPopup,
})
</script>

<style lang="scss"></style>
