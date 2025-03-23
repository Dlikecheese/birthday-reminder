<template>
  <div class="add-birthday card">
    <uni-forms ref="formRef" :modelValue="formData" :rules="rules">
      <uni-forms-item label="昵称" name="name">
        <uni-easyinput type="text" v-model="formData.name" placeholder="请输入昵称" />
      </uni-forms-item>
      <uni-forms-item label="生日" name="birthday">
        <uni-datetime-picker type="date" v-model="formData.birthday"></uni-datetime-picker>
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
      <uni-forms-item label="手机" name="phone">
        <uni-easyinput v-model="formData.phone" type="text" placeholder="请输入手机" />
      </uni-forms-item>
      <uni-forms-item label="地址" name="address">
        <uni-easyinput v-model="formData.address" type="text" placeholder="请输入地址" />
      </uni-forms-item>
      <uni-forms-item label="备注" name="comment">
        <uni-easyinput v-model="formData.comment" type="text" placeholder="请输入备注" />
      </uni-forms-item>
      <uni-forms-item label="个性标签" name="tag">
        <uni-easyinput v-model="formData.tag" type="text" placeholder="请输入个性标签" />
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
import { Relation, RemindeType, Sex } from './type'
import { onLoad } from '@dcloudio/uni-app'

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

const sexOptions = [
  { value: Sex.MALE, text: '男' },
  { value: Sex.FEMALE, text: '女' },
]
const remindTimes = [
  { value: RemindeType.ONE_DAY, text: '提前一天' },
  { value: RemindeType.TWO_DAY, text: '提前两天' },
  { value: RemindeType.THREE_DAY, text: '提前三天' },
  { value: RemindeType.FOUR_DAY, text: '提前四天' },
  { value: RemindeType.ONE_WEEK, text: '提前一周' },
  { value: RemindeType.ONE_MONTH, text: '提前一月' },
]
const relationOptions = [
  { value: Relation.FAMILY, text: '亲人' },
  { value: Relation.FRIEND, text: '朋友' },
  { value: Relation.TEACHER, text: '老师' },
  { value: Relation.COLLEAGUE, text: '同事' },
  { value: Relation.CUSTOM, text: '客户' },
  { value: Relation.OTHER, text: '其他' },
]

const formData = ref({
  name: '',
  sex: '',
  birthday: '',
  phone: '',
  remindTime: [RemindeType.ONE_DAY],
  relation: '',
  address: '',
  comment: '',
  tag: '',
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
  phone: {
    rules: [
      {
        pattern: /^1[3456789]\d{9}$/,
        errorMessage: '手机号格式不正确',
      },
    ],
    label: '手机号',
    validateTrigger: 'submit',
  },
  birthday: {
    rules: [
      {
        required: true,
        errorMessage: '请填写生日',
      },
    ],
    label: '生日',
    validateTrigger: 'submit',
  },
}

// 引用表单
const formRef = ref(null) as any

const submit = async () => {
  try {
    const val = await formRef.value?.validate()

    if (birthdayId.value) {
      await http({
        url: '/birthday',
        method: 'PUT',
        data: {
          ...val,
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

      uni.navigateBack()
      return
    }

    await http({
      url: '/birthday',
      method: 'POST',
      data: val,
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
