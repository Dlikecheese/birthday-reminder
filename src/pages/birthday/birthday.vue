<template>
  <view v-if="!loading && birthdayList.length">
    <uni-section title="一个月内生日" type="line" v-if="birthdayLatestList.length">
      <view>
        <birthday-item :list="birthdayLatestList" @delete="getBirthdayList"></birthday-item>
      </view>
    </uni-section>

    <uni-section title="一个月后生日" type="line" v-if="birthdayAfterOneMonthList.length">
      <view>
        <birthday-item :list="birthdayAfterOneMonthList" @delete="getBirthdayList"></birthday-item>
      </view>
    </uni-section>
  </view>

  <view v-else-if="!loading && !birthdayList.length" class="no-data text-weaken">
    快去添加生日吧~ <text class="text-link link" @click="addBirthday">去添加</text>
  </view>

  <uni-icons type="plus" color="#ff6e95" size="40" class="icon" @click="addBirthday" />
</template>

<script lang="ts" setup>
import { BirthdayType } from '@/types/common'
import { lunarDayOptions, lunarMonthOptions } from '@/utils/common'
import { http } from '@/utils/http'
import { calculateSolarBirthday, calculateZodiac, isLogin, toLogin } from '@/utils/util'
import { onShow } from '@dcloudio/uni-app'
import dayjs from 'dayjs'
import { onMounted, ref } from 'vue'

const checkLogin = async () => {
  if (!isLogin()) {
    try {
      await toLogin()
    } catch (error) {
      console.error(error)
    }
  }
}
const addBirthday = () => {
  uni.navigateTo({
    url: '/pagesBirthday/add-birthday/add-birthday',
  })
}

const birthdayList = ref([]) as any
const birthdayLatestList = ref([]) as any
const birthdayAfterOneMonthList = ref([]) as any
const swipeAction = [
  {
    id: 'delete',
    text: '删除',
    style: {
      backgroundColor: '#F56C6C',
    },
  },
]
const loading = ref(false)

onMounted(async () => {
  await checkLogin()

  refreshData()
})

onShow(() => {
  if (uni.getStorageSync('refresh')) {
    refreshData()
    uni.removeStorageSync('refresh')
  }
})

const refreshData = async () => {
  loading.value = true
  uni.showLoading({
    title: '加载中',
  })
  try {
    await getBirthdayList()
  } finally {
    uni.hideLoading()
    loading.value = false
  }
}

const getBirthdayList = async () => {
  try {
    const res: any = await http({
      url: '/birthday',
      method: 'GET',
    })

    birthdayList.value = res.data
    const latestList = res.data.filter((ele: { birthday: string; birthdayType: BirthdayType }) => {
      const birthdayMonth = dayjs(ele.birthday).month()
      const birthdayDate = dayjs(ele.birthday).date()

      let birthdayDateInThisYear = dayjs().set('month', birthdayMonth).set('date', birthdayDate)
      if (ele.birthdayType === BirthdayType.LUNAR) {
        birthdayDateInThisYear = dayjs(calculateSolarBirthday(ele.birthday))
      }
      return (
        birthdayDateInThisYear.diff(dayjs(), 'day') <= 30 &&
        birthdayDateInThisYear.diff(dayjs(), 'day') >= 0
      )
    })

    const otherList = res.data.filter((ele: { id: any }) => {
      return !latestList.some((item: { id: any }) => item.id === ele.id)
    })

    birthdayLatestList.value = transformBirthday(latestList)
    birthdayAfterOneMonthList.value = transformBirthday(otherList)
  } catch (e) {
    uni.showToast({
      title: '获取生日列表失败',
      icon: 'error',
    })
  }
}

/**
 * 转换生日列表 生成年龄、生日描述、倒计时
 */
const transformBirthday = (birthdayList: any[]): any[] => {
  return birthdayList
    .map((ele) => {
      const solarBirthday =
        ele.birthdayType === BirthdayType.LUNAR
          ? calculateSolarBirthday(ele.birthday)
          : ele.birthday

      const countdown = calcCountdown(solarBirthday).text

      let nextAge = dayjs().diff(ele.birthday, 'year') + 1
      if (countdown === '今天') {
        nextAge = dayjs().diff(ele.birthday, 'year')
      }

      const zodiac = calculateZodiac(ele)

      let desc = `${dayjs(ele.birthday).format('MM月DD日')} 属${zodiac} ${nextAge}岁`
      if (ele.birthdayType === BirthdayType.LUNAR) {
        const dateArr = ele.birthday.split('-')
        const lunarMonth = lunarMonthOptions.find((item) => item.value === dateArr[1])?.text
        const lunarDate = lunarDayOptions.find((item) => item.value === Number(dateArr[2]))?.text
        desc = `农历${lunarMonth}${lunarDate} 属${zodiac} ${nextAge}岁`
      }

      return {
        ...ele,
        nextAge,
        desc,
        countdown,
        options: swipeAction,
        diffDays: calcCountdown(solarBirthday).days,
      }
    })
    .sort((a, b) => {
      return a.diffDays - b.diffDays
    })
}

/**
 * 计算倒计时
 */
const calcCountdown = (
  birthday: string,
): {
  text: string
  days: number
} => {
  // 如果生日的月日小于当前的月日，说明今年的生日已经过了，计算下一年的生日还有多少天
  const birthdayMonth = dayjs(birthday).month()
  const birthdayDate = dayjs(birthday).date()

  const birthdayDateInThisYear = dayjs().set('month', birthdayMonth).set('date', birthdayDate)

  const now = dayjs()
  let diff = 0
  if (birthdayDateInThisYear.isSame(now, 'day') && birthdayDateInThisYear.isSame(now, 'month')) {
    return {
      text: '今天',
      days: 0,
    }
  }

  if (birthdayDateInThisYear.isBefore(dayjs())) {
    const nextBirthday = dayjs()
      .set('year', now.year() + 1)
      .set('month', birthdayMonth)
      .set('date', birthdayDate)
    diff = nextBirthday.diff(now, 'day')
  } else {
    diff = birthdayDateInThisYear.diff(now, 'day')
  }

  return {
    text: getDiffText(diff),
    days: diff,
  }
}

/**
 * 获取倒计时文本
 */
const getDiffText = (diff: number): string => {
  if (diff === 0 || diff === 365) {
    return '今天'
  } else if (diff === 1) {
    return '明天'
  } else if (diff === 2) {
    return '后天'
  } else if (diff >= 7 && diff < 14) {
    return '一周后'
  } else if (diff >= 14 && diff < 21) {
    return '两周后'
  } else if (diff >= 21 && diff < 30) {
    return '三周后'
  } else if (diff >= 30 && diff < 60) {
    return '一个月后'
  } else if (diff >= 60 && diff < 90) {
    return '两个月后'
  } else if (diff >= 90 && diff < 120) {
    return '三个月后'
  } else if (diff >= 120 && diff < 150) {
    return '四个月后'
  } else if (diff >= 150 && diff < 180) {
    return '五个月后'
  } else if (diff >= 180 && diff < 210) {
    return '半年后'
  } else if (diff >= 210 && diff < 240) {
    return '七个月后'
  } else if (diff >= 240 && diff < 270) {
    return '八个月后'
  } else if (diff >= 270 && diff < 300) {
    return '九个月后'
  } else if (diff >= 300 && diff < 330) {
    return '十个月后'
  } else if (diff >= 330 && diff < 365) {
    return '十一个月后'
  } else {
    return diff + '天'
  }
}
</script>

<style lang="scss">
.icon {
  position: fixed;
  right: 30px;
  bottom: 30px;
}

.avatar {
  width: 45px;
  height: 45px;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.link {
  margin-left: 6px;
}
</style>
