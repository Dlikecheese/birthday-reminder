<script setup lang="ts">
import { useUserStore } from '@/stores'
import defaultAvatar from '@/static/images/default-avatar.jpeg'
import { ref } from 'vue'
import { wxLogin } from '@/utils/util'
import { http } from '@/utils/http'
import { onLoad } from '@dcloudio/uni-app'
import { TEMPLATE_ID } from '@/utils/common'

onLoad(() => {
  uni.getSetting({
    withSubscriptions: true,
    success(res) {
      const status = res.subscriptionsSetting.itemSettings?.[TEMPLATE_ID]
      if (status === 'accept') {
        setSubscribeStatus(true, '已订阅')
      }
    },
  })
})

const setSubscribeStatus = (disabled: boolean, text: string) => {
  const subscribeOps = operations.value.find((ele) => ele.id === 'subscribe')
  if (subscribeOps) {
    subscribeOps.disabled = disabled
    subscribeOps.disabledTip = text
  }
}

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

const login = async () => {
  // 弹出登录中的弹窗
  uni.showLoading({ title: '登录中' })
  await wxLogin()
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

let isSubscribing = false // 全局标记是否正在订阅
const operations = ref([
  {
    label: '订阅生日提醒',
    click: (item?: any) => {
      if (item.disabled) {
        return
      }

      if (isSubscribing) {
        uni.showToast({
          title: '正在订阅中，请稍后',
          icon: 'none',
        })
        return
      }

      isSubscribing = true

      uni.requestSubscribeMessage({
        tmplIds: [TEMPLATE_ID],
        success(res: any) {
          uni.hideLoading()
          if (res[TEMPLATE_ID] === 'accept') {
            setSubscribeStatus(true, '已订阅')
            uni.showToast({
              title: '订阅成功',
              icon: 'success',
            })
          }
        },
        fail() {
          uni.showToast({
            title: '订阅失败',
            icon: 'error',
          })
        },
        complete: () => {
          isSubscribing = false
        },
      })
    },
    id: 'subscribe',
    disabled: false,
    disabledTip: '',
  },
  {
    label: '我的生日',
    click: (item?: any) => {
      if (item.disabled) {
        return
      }
      uni.navigateTo({
        url: '/pagesMy/edit-info/edit-info',
      })
    },
    id: 'info',
    disabled: false,
    disabledTip: '',
  },
  {
    label: '提个意见',
    click: () => {
      uni.navigateTo({
        url: '/pagesMy/feedback/feedback',
      })
    },
    id: 'feedback',
    disabled: false,
    disabledTip: '',
  },
])
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
    <view v-for="item in operations" :key="item.id" class="operation-item-wrap">
      <view @click="item.click(item)" class="flex items-center justify-between">
        <view class="left">{{ item.label }}</view>
        <view class="right">
          <text v-if="!item.disabled" @click="item.click">></text>
          <text v-else>{{ item.disabledTip }}</text>
        </view>
      </view>
    </view>
  </view>
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
