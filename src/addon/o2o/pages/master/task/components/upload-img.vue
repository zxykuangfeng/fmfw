<template>
  <view class="flex flex-wrap">
    <view v-for="(item, index) in value" :class="['mb-[18rpx] relative', (index + 1) % 3 === 0 ? '' : '']" style="margin: 8rpx">
      <u--image class="rounded-[10rpx] overflow-hidden" width="168rpx" height="168rpx" :src="img(item || '')" model="aspectFill" @click="imgListPreview(item)">
        <template #error>
          <u-icon name="photo" color="#999" size="50"></u-icon>
        </template>
      </u--image>
      <text
        class="nc-iconfont nc-icon-guanbiV6xx text-[32rpx] absolute top-0 right-[0rpx] text-[#fff] bg-[#888] rounded-bl-[16rpx]"
        @click.stop="deleteImg(index)"
      ></text>
    </view>
    <view class="w-[168rpx] h-[168rpx]" v-if="value.length < maxCount">
      <u-upload @afterRead="afterRead" :maxCount="maxCount" :multiple="prop.multiple">
        <view class="flex items-center justify-center w-[168rpx] h-[168rpx] border-[2rpx] border-dashed border-[#ebebec] text-center text-[#888]">
          <view>
            <view class="nc-iconfont nc-icon-xiangjiV6xx text-[50rpx]"></view>
            <view class="text-[24rpx] mt-[10rpx]">{{ value.length }}/{{ maxCount }}</view>
          </view>
        </view>
      </u-upload>
    </view>
  </view>
</template>
<script lang="ts" setup>
  import { computed } from 'vue'
  import { img } from '@/utils/common'
  import { uploadImage } from '@/app/api/system'

  const prop = defineProps({
    modelValue: {
      type: String || Array
    },
    maxCount: {
      type: Number,
      default: 9
    },
    multiple: {
      type: Boolean,
      default: false
    }
  })
  const emit = defineEmits(['update:modelValue'])
  const value = computed({
    get() {
      return prop.modelValue
    },
    set(value) {
      emit('update:modelValue', value)
    }
  })

  const maxCount = computed(() => {
    return prop.maxCount
  })

  const afterRead = (event: any) => {
    if (prop.multiple) {
      event.file.forEach((file) => {
        upload({ file })
      })
    } else {
      upload(event)
    }
  }

  const upload = (event: any) => {
    if (value.value?.length >= maxCount.value) {
      uni.showToast({ title: `最多允许上传${maxCount.value}张图片`, icon: 'none' })
      return false
    }

    uploadImage({
      filePath: event.file.url,
      name: 'file'
    })
      .then((res) => {
        if (value.value?.length < maxCount.value) value.value.push(res.data.url)
      })
      .catch(() => {})
  }

  const deleteImg = (index: number) => {
    value.value.splice(index, 1)
  }
  
  //预览图片
  const imgListPreview = (item:any) => {
      if (item === '') return false
      var urlList = []
      urlList.push(img(item))  //push中的参数为 :src="item.img_url" 中的图片地址
      uni.previewImage({
          indicator: "number",
          loop: true,
          urls: urlList
      })
  }
</script>
