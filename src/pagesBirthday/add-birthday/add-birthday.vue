<template>
  <div class="add-birthday card">
    <uni-forms ref="formRef" :modelValue="formData" :rules="rules">
      <uni-forms-item label="昵称" name="name" required>
        <uni-easyinput type="text" v-model="formData.name" placeholder="请输入昵称" />
      </uni-forms-item>
      <uni-forms-item label="生日" name="birthdayType" required>
        <uni-data-checkbox
          v-model="formData.birthdayType"
          :localdata="birthdayTypes"
        ></uni-data-checkbox>
      </uni-forms-item>
      <uni-forms-item label=" " v-if="formData.birthdayType === BirthdayType.SOLAR" name="birthday">
        <uni-datetime-picker type="date" v-model="formData.birthday"></uni-datetime-picker>
      </uni-forms-item>
      <uni-forms-item label=" " v-else>
        <view class="flex flex-col gap-2">
          <uni-data-select
            v-model="lunarYear"
            :localdata="lunarYearOptions"
            placeholder="请选择农历年"
          ></uni-data-select>

          <uni-data-select
            v-model="lunarMonth"
            :localdata="lunarMonthOptions"
            placeholder="请选择农历月"
          ></uni-data-select>

          <uni-data-select
            v-model="lunarDay"
            :localdata="lunarDayOptions"
            placeholder="请选择农历日"
          ></uni-data-select>
        </view>
      </uni-forms-item>
      <uni-forms-item label="生日提醒" name="remindTime">
        <uni-data-checkbox
          multiple
          v-model="formData.remindTime"
          :localdata="remindTimes"
        ></uni-data-checkbox>
      </uni-forms-item>
      <uni-forms-item> 其他信息</uni-forms-item>
      <uni-forms-item label="性别" name="sex">
        <uni-data-select v-model="formData.sex" :localdata="sexOptions"></uni-data-select>
      </uni-forms-item>
      <uni-forms-item label="关系" name="relation">
        <uni-data-checkbox
          v-model="formData.relation"
          :localdata="relationOptions"
        ></uni-data-checkbox>
      </uni-forms-item>
      <uni-forms-item label="备注" name="comment">
        <uni-easyinput v-model="formData.comment" type="text" placeholder="请输入备注" />
      </uni-forms-item>
    </uni-forms>
    <view class="box"></view>
    <view class="submit flex">
      <uni-icons type="trash" size="30" color="#9e9e9e" v-if="birthdayId" @click="remove" />
      <button @click="submit" class="submit-btn color-theme-bg text-light">
        {{ birthdayId ? '修改' : '添加' }}
      </button>
    </view>
  </div>
</template>

<script lang="ts" setup>
import { http } from '@/utils/http'
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

import calendar from 'js-calendar-converter'

import {
  sexOptions,
  remindTimes,
  relationOptions,
  lunarYearOptions,
  lunarMonthOptions,
  lunarDayOptions,
} from '@/utils/common'
import { BirthdayType, RemindeType } from '@/types/common'

let birthdayId = ref('')

onLoad(async ({ id }: any) => {
  if (id) {
    uni.setNavigationBarTitle({
      title: '编辑生日提醒',
    })

    birthdayId.value = id

    // 获取生日详情
    uni.showLoading({
      title: '加载中',
      mask: true,
    })
    await getBirthdayDetail(id)
    uni.hideLoading()
  }
})

const birthdayTypes = [
  { value: BirthdayType.SOLAR, text: '公历' },
  { value: BirthdayType.LUNAR, text: '农历' },
]

const formData = ref({
  name: '',
  sex: '',
  birthday: '',
  birthdayType: BirthdayType.SOLAR,
  remindTime: [RemindeType.ONE_DAY],
  relation: '',
  comment: '',
})

let lunarYear = ref(undefined as any)
let lunarMonth = ref('')
let lunarDay = ref(undefined as any)

const rules = {
  name: {
    // name 字段的校验规则
    rules: [
      // 校验 name 不能为空
      {
        required: true,
        errorMessage: '请填写姓名',
      },
      // 对name字段进行长度验证
      {
        minLength: 1,
        maxLength: 20,
        errorMessage: '{label}长度在 {minLength} 到 {maxLength} 个字符',
      },
    ],
    label: '姓名',
    validateTrigger: 'submit',
  },
}

// 引用表单
const formRef = ref(null) as any

const checkForm = (val: any): boolean => {
  if (val.birthdayType === BirthdayType.LUNAR) {
    if (!lunarYear.value || !lunarMonth.value || !lunarDay.value) {
      uni.showToast({
        title: '请填写生日',
        icon: 'error',
      })
      return false
    }

    if (calendar.lunar2solar(lunarYear.value, lunarMonth.value, lunarDay.value) === -1) {
      uni.showToast({
        title: '农历日期不正确',
        icon: 'error',
      })
      return false
    }
  } else {
    if (!val.birthday) {
      uni.showToast({
        title: '请填写生日',
        icon: 'error',
      })
      return false
    }
  }
  return true
}

const submit = async () => {
  const val = await formRef.value?.validate()

  if (!checkForm(val)) {
    return
  }

  try {
    const params = {
      ...val,
      birthday:
        val.birthdayType === BirthdayType.SOLAR
          ? val.birthday
          : `${lunarYear.value}-${lunarMonth.value}-${lunarDay.value}`,
      birthdayType: val.birthdayType,
    }
    if (birthdayId.value) {
      await http({
        url: '/birthday',
        method: 'PUT',
        data: {
          ...params,
          id: birthdayId.value,
        },
      })
      uni.showToast({
        title: '编辑成功',
        icon: 'success',
      })

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve('')
        }, 200)
      })

      uni.setStorageSync('refresh', true)
      uni.navigateBack()
      return
    }

    await http({
      url: '/birthday',
      method: 'POST',
      data: params,
    })

    uni.showToast({
      title: '添加成功',
      icon: 'success',
    })
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve('')
      }, 200)
    })
    uni.setStorageSync('refresh', true)
    uni.navigateBack()
  } catch (error) {
    uni.showToast({
      title: '操作失败',
      icon: 'error',
    })
  }
}

const getBirthdayDetail = async (id: string) => {
  // 获取生日详情
  try {
    const res: any = await http({
      url: '/birthday/' + id,
      method: 'GET',
    })

    // 设置表单数据
    formData.value = res.data

    if (res.data.birthdayType === BirthdayType.LUNAR) {
      const lunarDate = res.data.birthday.split('-')
      lunarYear.value = Number(lunarDate[0])
      lunarMonth.value = lunarDate[1]
      lunarDay.value = Number(lunarDate[2])
    }
  } catch (e) {
    uni.showToast({
      title: '获取生日详情失败',
      icon: 'error',
    })
  }
}

const remove = () => {
  uni.showModal({
    title: '提示',
    content: '确定删除该生日提醒吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await http({
            url: '/birthday/' + birthdayId.value,
            method: 'DELETE',
          })
          uni.showToast({
            title: '删除成功',
            icon: 'success',
          })
          uni.setStorageSync('refresh', true)
          uni.navigateBack()
        } catch (e) {
          uni.showToast({
            title: '删除失败',
            icon: 'error',
          })
        }
      }
    },
  })
}
</script>

<style lang="scss">
.submit {
  position: fixed;
  bottom: 0px;
  width: 100%;
  left: 0;
  border-top: 1px solid #f2f2f2;
  padding: 10px 10px 0;
  background-color: #fff;
  align-items: center;
  z-index: 98;
  .submit-btn {
    width: 80%;
  }
}
.box {
  margin-bottom: 24px;
  width: 100%;
  height: 50px;
}
</style>
