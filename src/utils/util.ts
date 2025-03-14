import { useUserStore } from '@/stores'
import { http } from './http'

export const checkIsLogin = (callback: () => void): void => {
  const userStore = useUserStore()

  if (userStore?.profile?.token) {
    return
  }

  uni.showModal({
    title: '温馨提示',
    content: '授权微信登录后才能使用',
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
            wxLogin(loginRes.code, callback)
          }
        },
        complete: () => {
          uni.hideLoading()
        },
      })
    },
  })
}

const wxLogin = async (code: string, callback?: () => void): Promise<void> => {
  try {
    const { data }: any = await http({
      url: '/user/login',
      method: 'POST',
      data: {
        code,
      },
    })

    const userStore = useUserStore()
    // 添加token
    userStore.setProfile({
      ...userStore.profile,
      token: data.token,
      id: data.id,
      name: data.name,
      avatar: data.avatar,
    })

    uni.showToast({
      title: '登录成功',
      icon: 'none',
    })

    // 如果没有昵称，弹出授权弹窗
    if (!data?.name) {
      // 隐藏底部导航栏
      uni.hideTabBar()
      callback()
    }
  } catch (error) {
    uni.showToast({
      title: '登录失败，请重试',
      icon: 'none',
    })
  }
}
