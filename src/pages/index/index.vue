<template>
  <view>
    <uni-calendar
      :lunar="true"
      :selected="info.selected"
      :showMonth="true"
      @monthSwitch="monthSwith"
    />

    <view v-if="birthdaysInCurrentMonth.length">
      <uni-notice-bar single :text="noticeText" />
    </view>

    <view v-else class="nodata">
      <view> 当月暂无生日哦～ </view>
      <view class="text-link link" @click="toBirthdayPage">查看所有生日</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import { calculateSolarBirthday, isLogin, toLogin } from '@/utils/util'
import { http } from '@/utils/http'
import dayjs from 'dayjs'
import { BirthdayType } from '@/types/common'
import { onLoad, onShow } from '@dcloudio/uni-app'
import Holidays from 'date-holidays'
const hd = new Holidays('CN')
let holidaysInThisYear = [] as any[]
let uniqueBirthdays = [] as any[]

const getHolidaysInTargetYear = (year = dayjs().year()) => {
  const holidays = hd.getHolidays(year)
  holidaysInThisYear = holidays.map((ele) => {
    return {
      date: ele.date.split(' ')[0],
      info: ele.name,
    }
  })
}
getHolidaysInTargetYear()

const info: Ref<{
  lunar: boolean
  range: boolean
  insert: boolean
  selected: { date: any; info: string }[]
}> = ref({
  lunar: true,
  range: true,
  insert: false,
  selected: [],
})

let noticeText = ''
let allBirthdays = [] as any[]
let birthdaysInCurrentMonth = ref([] as any[])

const monthSwith = (e: any) => {
  const { year, month } = e
  birthdaysInCurrentMonth.value = allBirthdays.filter((item: any) => {
    const birthdayDate = dayjs(item.date)
    return birthdayDate.month() + 1 === month
  })
  noticeText = `本月有 ${birthdaysInCurrentMonth.value.length} 个生日`

  getHolidaysInTargetYear(year)
  setSelected(allBirthdays, year)
  info.value.selected = [...uniqueBirthdays, ...holidaysInThisYear]
}

onLoad(async () => {
  await checkLogin()
  getBirthdayList()
})
onMounted(async () => {
  await checkLogin()
  getBirthdayList()
})

onShow(async () => {
  await checkLogin()
  getBirthdayList()
})

const getBirthdayList = async () => {
  const res: any = await http({
    url: '/birthday',
    method: 'GET',
  })

  setSelected(res.data, dayjs().year())

  monthSwith({
    month: dayjs().month() + 1,
  })
}

const setSelected = (birthdays: any[], year: number): void => {
  const transformedBirthday = birthdays?.map((item: any) => {
    return {
      ...item,
      date: getCurrentYearBirthday(item.birthday, item.birthdayType, year),
      info: `${item.name}生日`,
    }
  })

  allBirthdays = transformedBirthday

  const uniqueBirthday = new Map()
  transformedBirthday.forEach((item: any) => {
    const birthday = item.date
    if (!uniqueBirthday.has(birthday)) {
      uniqueBirthday.set(birthday, [])
    }
    uniqueBirthday.get(birthday).push(item)
  })

  // 将去重后的对象转换为数组
  uniqueBirthdays = Array.from(uniqueBirthday.entries()).map(([birthday, items]) => {
    return {
      date: items[0].date,
      info: items.map((item: any) => item.name).join('、') + '生日',
    }
  })

  info.value.selected = [...uniqueBirthdays, ...holidaysInThisYear]
}

const getCurrentYearBirthday = (
  birthday: string,
  birthdayType: BirthdayType,
  year = dayjs().year(),
) => {
  let solarBirthday = birthday
  if (birthdayType === BirthdayType.LUNAR) {
    solarBirthday = calculateSolarBirthday(birthday, year)
    return solarBirthday
  }

  const birthdayMonth = dayjs(solarBirthday).month()
  const birthdayDate = dayjs(solarBirthday).date()
  const birthdayDateInThisYear = dayjs()
    .set('year', year)
    .set('month', birthdayMonth)
    .set('date', birthdayDate)

  return `${birthdayDateInThisYear.format('YYYY-MM-DD')}`
}

const checkLogin = async () => {
  if (!isLogin()) {
    try {
      await toLogin()
    } catch (error) {
      console.error(error)
    }
  }
}
const toBirthdayPage = () => {
  uni.switchTab({
    url: '/pages/birthday/birthday',
  })
}
</script>

<style lang="scss">
.nodata {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: #999;
  margin: 20px 0;
  .link {
    margin-left: 6px;
  }
}
</style>
