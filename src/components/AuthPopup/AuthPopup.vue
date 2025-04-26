<template>
  <uni-popup ref="popupRef" type="bottom" border-radius="10px 10px 0 0">
    <view class="popup-wrap">
      <view class="popup-wrap-header">申请权限</view>
      <view class="text-weanken"
        >使用本小程序需要授权微信名称、头像。其他权限包括照片，地址和手机号等。详情查看
        <a @click="toAggreementPage" class="aggreement">《隐私政策》</a></view
      >
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
        <view class="btn prevent" @click="closePopup">拒绝</view>
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
const userStore = useUserStore()
let imgUrl = ref('')
let name = ref('')

onMounted(async () => {
  // 获取用户信息
  const userInfo: UserInfo = await getWXUserInfo()
  imgUrl.value = userInfo.avatarUrl
  name.value = userInfo.nickName
})

const getWXUserInfo = (): Promise<UserInfo> => {
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
  // 添加用户信息
  await http({
    url: `/user/${userStore.profile?.id}`,
    method: 'PUT',
    data: {
      avatar: imgUrl.value,
      name: name.value,
    },
  })
  userStore.setProfile({
    ...userStore.profile,
    avatarUrl: imgUrl.value,
    name: name.value,
  })

  uni.showToast({
    title: '登录成功',
    icon: 'success',
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
  uni.showTabBar()
  // 弹出您已取消授权
  uni.showToast({
    title: '您已取消授权',
    icon: 'none',
  })
}

// 暴露方法给父组件
defineExpose({
  openPopup,
})

const toAggreementPage = () => {
  uni.navigateTo({ url: '/pagesMy/aggreement/aggreement' })
}
</script>

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

.aggreement {
  color: #ff4b78;
}
</style>
