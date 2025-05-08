import { useUserStore } from '@/stores'
import { http } from './http'
import type { UserInfo } from '@/types/common'

export const isLogin = (): boolean => {
  const userStore = useUserStore()
  return !!userStore?.profile?.token
}

export const toLogin = async (): Promise<UserInfo | undefined> => {
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

    if (!data?.name) {
      // 获取用户信息
      const userInfo: UserInfo = await getWXUserInfo()
      const imgUrl = userInfo.avatarUrl
      const name = userInfo.nickName

      // 添加用户信息
      await http({
        url: `/user/${userStore.profile?.id}`,
        method: 'PUT',
        data: {
          avatar: imgUrl,
          name: name,
        },
      })

      userStore.setProfile({
        ...userStore.profile,
        avatarUrl: imgUrl,
        name: name,
      })

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

export const getWXUserInfo = (): Promise<UserInfo> => {
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

/** 计算生肖 */
export function calculateZodiac(birthday: string): string {
  const zodiacs: string[] = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
  const year: number = new Date(birthday).getFullYear()
  const baseYear: number = 1900
  const index: number = (year - baseYear) % 12
  return zodiacs[index]
}
