import { useUserStore } from '@/stores'
import { http } from './http'
import { BirthdayType, type UserInfo } from '@/types/common'
import calendar from 'js-calendar-converter'
import dayjs from 'dayjs'

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

/*
 * 根据农历
 * 计算生肖
 * */
export function calculateZodiac(birthday: any): string {
  const zodiacs: string[] = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

  let birthdayDate: string = birthday.birthday
  if (birthday.birthdayType === BirthdayType.SOLAR) {
    const birthdayArr = birthday.birthday.split('-')
    birthdayDate = calendar.solar2lunar(birthdayArr[0], birthdayArr[1], birthdayArr[2]).lunarDate
  }

  const year: number = new Date(birthdayDate).getFullYear()
  const baseYear: number = 1900
  const index: number = (year - baseYear) % 12
  return zodiacs[index]
}

/**
 * 根据公历日期计算当年农历日期
 * @param date 格式yyyy-MM-dd
 */
export function calculateSolarBirthday(lunarBirthdayDate: string): string {
  const lunarDateArr = lunarBirthdayDate.split('-')
  // 计算农历新年的公历日期
  const newYearDate = calendar.lunar2solar(dayjs().year(), 1, 1).date
  let lunarYear = dayjs().year().toString()

  // 判断农历新年是否在当前日期之前
  if (dayjs(lunarBirthdayDate).isBefore(newYearDate)) {
    // 如果在新年之前，则需要减去一年
    lunarYear = (Number(lunarYear) - 1).toString()
  }
  // 计算农历日期对应的公历日期
  const solarDate = calendar.lunar2solar(lunarYear, lunarDateArr[1], Number(lunarDateArr[2])).date

  return solarDate
}
