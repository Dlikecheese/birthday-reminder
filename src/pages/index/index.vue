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
import { ref, type Ref } from 'vue'
import { isLogin, toLogin } from '@/utils/util'
import { http } from '@/utils/http'
import dayjs from 'dayjs'
import { BirthdayType } from '@/types/common'
import calendar from 'js-calendar-converter'
import { onShow } from '@dcloudio/uni-app'

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
let birthdaysInCurrentMonth = ref([] as any[])

const monthSwith = (e: any) => {
  const { month } = e
  birthdaysInCurrentMonth.value = info.value.selected.filter((item: any) => {
    const birthdayDate = dayjs(item.date)
    return birthdayDate.month() + 1 === month
  })
  noticeText = `本月有 ${birthdaysInCurrentMonth.value.length} 个生日`
}

onShow(async () => {
  await checkLogin()
  getBirthdayList()
})

const getBirthdayList = async () => {
  const res: any = await http({
    url: '/birthday',
    method: 'GET',
  })

  info.value.selected = res.data?.map((item: any) => {
    return {
      ...item,
      date: getCurrentYearBirthday(item.birthday, item.birthdayType),
      info: `${item.name}生日`,
    }
  })

  monthSwith({
    month: dayjs().month() + 1,
  })
}

const getCurrentYearBirthday = (birthday: string, birthdayType: BirthdayType) => {
  let solarBirthday = birthday
  if (birthdayType === BirthdayType.LUNAR) {
    const lunarBirthday = birthday.split('-')
    solarBirthday = calendar.lunar2solar(
      dayjs().year(),
      lunarBirthday[1],
      Number(lunarBirthday[2]),
    ).date
  }

  const birthdayMonth = dayjs(solarBirthday).month()
  const birthdayDate = dayjs(solarBirthday).date()
  const birthdayDateInThisYear = dayjs().set('month', birthdayMonth).set('date', birthdayDate)

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
