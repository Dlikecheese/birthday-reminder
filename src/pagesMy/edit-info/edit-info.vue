<template>
  <div class="card">
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

      <uni-forms-item label="性别" name="sex">
        <uni-data-select v-model="formData.sex" :localdata="sexOptions"></uni-data-select>
      </uni-forms-item>
    </uni-forms>
    <view class="box"></view>
    <view class="submit flex">
      <button @click="submit" class="submit-btn color-theme-bg text-light">修改</button>
      <button open-type="share" class="share-btn text-light">分享</button>
    </view>
  </div>
</template>

<script lang="ts" setup>
import { http } from '@/utils/http'
import { ref } from 'vue'
import { BirthdayType, Sex } from '@/types/common'
import { onShow, onShareAppMessage } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/index'
import { birthdayTypes, lunarYearOptions, lunarMonthOptions, lunarDayOptions } from '@/utils/common'

let lunarYear = ref(undefined as any)
let lunarMonth = ref('')
let lunarDay = ref(undefined as any)

onShow(async () => {
  uni.showLoading({
    title: '加载中',
    mask: true,
  })
  await getUserDetail()
  uni.hideLoading()
})

const sexOptions = [
  { value: Sex.MALE, text: '男' },
  { value: Sex.FEMALE, text: '女' },
]

const formData = ref({
  name: '',
  sex: '',
  birthday: '',
  birthdayType: BirthdayType.SOLAR,
})

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

const submit = async () => {
  try {
    const val = await formRef.value?.validate()
    const userStore = useUserStore()
    await http({
      url: '/user/' + userStore.profile.id,
      method: 'PUT',
      data: val,
    })

    userStore.setProfile({
      ...userStore.profile,
      ...val,
    })

    uni.showToast({
      title: '修改成功',
      icon: 'success',
    })
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve('')
      }, 200)
    })
    uni.navigateBack()
  } catch (error) {
    uni.showToast({
      title: '操作失败',
      icon: 'error',
    })
  }
}

const getUserDetail = async () => {
  try {
    const res: any = await http({
      url: '/user/detail',
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
      title: '获取用户详情失败',
      icon: 'error',
    })
  }
}

onShareAppMessage(() => {
  const data = JSON.stringify(formData.value)
  return {
    title: '分享了一个生日给你',
    path: `/pagesBirthday/add-birthday/add-birthday?shareData=${data}`, // 分享路径
  }
})
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
    width: 40%;
  }
}
.box {
  margin-bottom: 24px;
  width: 100%;
  height: 50px;
}
.share-btn {
  margin-left: 10px;
  width: 40%;
  background-color: #4fae70;
  color: #fff;
  text-align: center;
}
</style>
