<template>
  <div class="card">
    <uni-forms ref="formRef" :modelValue="formData" :rules="rules" label-width="100px">
      <uni-forms-item label="礼物名" name="name">
        <uni-easyinput type="text" v-model="formData.name" placeholder="请输入礼物名" />
      </uni-forms-item>
      <uni-forms-item label="描述" name="description">
        <uni-easyinput
          type="textarea"
          v-model="formData.description"
          placeholder="请输入礼物描述"
        />
      </uni-forms-item>
      <uni-forms-item label="适用性别" name="usageSex">
        <uni-data-select v-model="formData.usageSex" :localdata="sexOptions"></uni-data-select>
      </uni-forms-item>
      <uni-forms-item label="适用年龄段" name="usageAge">
        <uni-data-select v-model="formData.usageAge" :localdata="usageAgeOptions"></uni-data-select>
      </uni-forms-item>
    </uni-forms>

    <view class="example-body">
      <uni-file-picker limit="1" title="选择图片" @select="select"></uni-file-picker>
    </view>

    <view class="box"></view>
    <view class="submit flex">
      <uni-icons type="trash" size="30" color="#9e9e9e" v-if="giftId" @click="remove" />
      <button @click="submit" class="submit-btn color-theme-bg text-light">
        {{ giftId ? '修改' : '添加' }}
      </button>
    </view>
  </div>
</template>

<script lang="ts" setup>
import { baseURL, http } from '@/utils/http'
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { Sex } from '@/types/common.ts'

let giftId = ref('')
onLoad(async ({ id }: any) => {
  if (id) {
    uni.setNavigationBarTitle({
      title: '编辑礼物',
    })

    giftId.value = id

    // 获取礼物详情
    uni.showLoading({
      title: '加载中',
      mask: true,
    })
    await getBirthdayDetail(id)
    uni.hideLoading()
  }
})

const sexOptions = [
  { value: 'all', text: '通用' },
  { value: Sex.MALE, text: '男' },
  { value: Sex.FEMALE, text: '女' },
]
const usageAgeOptions = [
  { value: 'all', text: '通用' },
  { value: '0', text: '婴幼儿' },
  { value: '1', text: '童年' },
  { value: '2', text: '少年' },
  { value: '3', text: '青年' },
  { value: '4', text: '中年' },
  { value: '5', text: '老年' },
]

const formData = ref({
  name: '',
  description: '',
  usageSex: 'all',
  usageAge: 'all',
  img: '',
})

const rules = {
  name: {
    // name 字段的校验规则
    rules: [
      {
        required: true,
        errorMessage: '请填写礼物名',
      },
      // 对name字段进行长度验证
      {
        minLength: 1,
        maxLength: 20,
        errorMessage: '{label}长度在 {minLength} 到 {maxLength} 个字符',
      },
    ],
    label: '礼物名',
    validateTrigger: 'submit',
  },
  description: {
    rules: [
      {
        minLength: 1,
        maxLength: 200,
        errorMessage: '{label}长度在 {minLength} 到 {maxLength} 个字符',
      },
    ],
    label: '礼物描述',
    validateTrigger: 'submit',
  },
}

// 引用表单
const formRef = ref(null) as any

const submit = async () => {
  try {
    const val = await formRef.value?.validate()

    if (giftId.value) {
      await http({
        url: `/gift/${giftId.value}`,
        method: 'PUT',
        data: {
          ...val,
          id: giftId.value,
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
      url: '/gift',
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
  // 获取礼物详情
  try {
    const res: any = await http({
      url: '/gift/detail/' + id,
      method: 'GET',
    })

    // 设置表单数据
    formData.value = res.data
  } catch (e) {
    uni.showToast({
      title: '获取礼物详情失败',
      icon: 'error',
    })
  }
}

const remove = () => {
  uni.showModal({
    title: '提示',
    content: '确定删除该礼物吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await http({
            url: '/gift/' + giftId.value,
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

const select = (e: any) => {
  const tempFilePaths = e.tempFiles

  uni.uploadFile({
    url: `${baseURL}/common/upload`,
    filePath: tempFilePaths[0].path,
    name: 'file',
    header: {
      'Content-Type': 'multipart/form-data',
    },
    success: (res: any) => {
      try {
        const data = JSON.parse(res.data)
        formData.value.img = data.data
      } catch (e) {
        uni.showToast({
          title: '图片上传失败',
          icon: 'error',
        })
      }
    },
    fail: (fail) => {
      console.log(fail)
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
