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

  if (birthday.birthdayType === BirthdayType.SOLAR) {
    const birthdayArr = birthday.birthday.split('-')
    return calendar.solar2lunar(
      Number(birthdayArr[0]),
      Number(birthdayArr[1]),
      Number(birthdayArr[2]),
    ).Animal
  }

  const year: number = Number(birthday.birthday.split('-')[0])

  const baseYear: number = 1900
  const index: number = (year - baseYear) % 12
  return zodiacs[index]
}

/**
 * 根据农历生日计算当年公历生日日期
 * @param date 格式yyyy-MM-dd
 */
export function calculateSolarBirthday(lunarBirthdayDate: string): string {
  const lunarDateArr = lunarBirthdayDate.split('-')
  const thisYear = dayjs().year()
  // 计算农历新年的公历日期
  const newYearDate = calendar.lunar2solar(thisYear, 1, 1).date

  let lunarYear = thisYear.toString()

  // 判断农历新年是否在当前日期之后
  if (dayjs(lunarBirthdayDate).set('year', thisYear).isBefore(dayjs(newYearDate))) {
    // 如果在新年之前，则需要减去一年
    lunarYear = (thisYear - 1).toString()
  }
  // 计算农历日期对应的公历日期
  const solarDate = calendar.lunar2solar(lunarYear, lunarDateArr[1], Number(lunarDateArr[2])).date

  return solarDate
}
