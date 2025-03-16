import { useUserStore } from '@/stores'
import { http } from './http'
import type { UserInfo } from '@/types/common'

export const isLogin = (): boolean => {
  const userStore = useUserStore()
  return !!userStore?.profile?.token
}

export const toLogin = async (): Promise<UserInfo | undefined> => {
  const res = await uni.showModal({
    title: '温馨提示',
    content: '授权微信登录后才能使用',
    confirmText: '登录',
    showCancel: false,
  })

  if (!res.confirm) {
    return
  }

  uni.showLoading({
    title: '登录中',
  })
  return await wxLogin()
}

export const wxLogin = async (): Promise<UserInfo | undefined> => {
  // 调用登录接口
  try {
    const res = await uni.login({
      provider: 'weixin',
    })
    if (res.code) {
      return await login(res.code)
    }
  } catch (error) {
    uni.showToast({
      title: '登录失败，请重试',
      icon: 'error',
    })
  } finally {
    uni.hideLoading()
  }
}

const login = async (code: string): Promise<UserInfo | undefined> => {
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
      icon: 'success',
    })

    // 如果没有昵称，弹出授权弹窗
    if (!data?.name) {
      // 隐藏底部导航栏
      uni.hideTabBar()
      return
    }

    return userStore.profile
  } catch (error) {
    uni.showToast({
      title: '登录失败，请重试',
      icon: 'error',
    })
    return
  }
}
