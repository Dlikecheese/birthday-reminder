<template>
  <div class="card">
    <uni-forms ref="formRef" :modelValue="formData" :rules="rules" label-width="100px">
      <uni-forms-item label="礼物名" name="name" required>
        <uni-easyinput type="text" v-model="formData.name" placeholder="请输入礼物名" />
      </uni-forms-item>
      <uni-forms-item label="描述" name="description">
        <uni-easyinput
          type="textarea"
          v-model="formData.description"
          placeholder="请输入礼物描述"
        />
      </uni-forms-item>
      <uni-forms-item label="适用性别" name="usageSex" required>
        <uni-data-select v-model="formData.usageSex" :localdata="sexOptions"></uni-data-select>
      </uni-forms-item>
      <uni-forms-item label="适用年龄段" name="usageAge" required>
        <uni-data-checkbox
          multiple
          v-model="formData.usageAge"
          :localdata="usageAgeOptions"
        ></uni-data-checkbox>
      </uni-forms-item>
    </uni-forms>

    <view v-if="!giftId || (giftId && formData.image)">
      <uni-file-picker
        v-model="formData.image"
        limit="1"
        title="选择图片"
        @select="selectFile"
        @delete="deleteFile"
        :del-icon="showDelIcon"
      ></uni-file-picker>
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
import { AgeRange, Sex } from '@/types/common.ts'
import { usageAgeOptions, sexOptions } from '@/utils/common'

let giftId = ref('')
const showDelIcon = ref(true)
onLoad(async ({ id }: any) => {
  if (id) {
    uni.setNavigationBarTitle({
      title: '编辑礼物',
    })

    giftId.value = id
    showDelIcon.value = false

    // 获取礼物详情
    uni.showLoading({
      title: '加载中',
      mask: true,
    })
    await getBirthdayDetail(id)
    uni.hideLoading()
  }
})

const formData = ref({
  name: '',
  description: '',
  usageSex: Sex.ALL,
  usageAge: [AgeRange.ALL],
  image: undefined as
    | {
        name: string
        extname: string
        url: string
      }
    | undefined,
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

/**
 * 发送添加请求
 */
const sendAddRequestWithFile = async (params: any) => {
  // 压缩文件
  if (!selectImg) {
    sendAddRequest(params)
    return
  }

  const res = await uni.compressImage({
    src: selectImg,
    quality: 80,
  })
  selectImg = res.tempFilePath
  uni.uploadFile({
    url: `${baseURL}/common/upload`,
    filePath: selectImg,
    name: 'file',
    header: {
      'Content-Type': 'multipart/form-data',
    },
    success: async (res: any) => {
      if (res.statusCode === 413) {
        uni.showToast({
          title: '图片超过5MB，请重新选择',
          icon: 'error',
        })
        return
      }
      try {
        const data = JSON.parse(res.data)
        formData.value.image = data.data

        await sendAddRequest({
          ...params,
          image: formData.value.image,
        })
      } catch (e) {
        uni.showToast({
          title: '图片上传失败',
          icon: 'error',
        })
      } finally {
        uni.hideLoading()
      }
    },
    fail: (fail) => {
      uni.hideLoading()
      uni.showToast({
        title: fail.errMsg,
        icon: 'error',
      })
    },
  })
}

const sendAddRequest = async (params: any) => {
  await http({
    url: '/gift',
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
  uni.navigateBack()
}

const submit = async () => {
  try {
    const val = await formRef.value?.validate()

    if (val.usageAge.includes('all')) {
      val.usageAge = ['all']
    } else {
      val.usageAge = val.usageAge.filter((item: string) => item !== 'all')
    }

    uni.showLoading({
      title: '提交中',
      mask: true,
    })

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

    await sendAddRequestWithFile(val)
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
    if (res.data.image) {
      formData.value.image = {
        name: res.data.image,
        extname: res.data.image.split('.').pop(),
        url: res.data.image,
      }
    }
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

let selectImg = ''
const selectFile = (e: any) => {
  selectImg = e.tempFiles[0].path
  formData.value.image = {
    name: e.tempFiles[0].name,
    extname: e.tempFiles[0].path.split('.').pop(),
    url: e.tempFiles[0].path,
  }
}

const deleteFile = () => {
  selectImg = ''
  formData.value.image = undefined
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
