<template>
    <view :style="themeColor()">
        <view class="bg-[#f8f8f8] min-h-screen overflow-hidden" v-if="!loading && Object.keys(detail).length">
            <view class="pb-[200rpx]">
                <view v-if="detail.status_name" class="flex status-item text-[32rpx] bg-primary h-[170rpx]">
                    <view class="ml-[50rpx]">
                        <image v-if="['wait_refund','refunding'].indexOf(detail.status) != -1" class="w-[70rpx] h-[70rpx] mt-[45rpx]" :src="img('addon/o2o/refund/payment.png')" />
                        <image v-if="['refund_completed'].indexOf(detail.status) != -1" class="w-[70rpx] h-[70rpx] mt-[45rpx]" :src="img('addon/o2o/refund/complete.png')" />
                        <image v-if="['cancel','refund_fail','refund_refuse'].indexOf(detail.status) != -1" class="w-[70rpx] h-[70rpx] mt-[45rpx]" :src="img('addon/o2o/refund/close.png')" />
                    </view>
                    <view class="ml-[20rpx] text-[#fff] mt-[50rpx] text-[40rpx]">{{ detail.status_name }}</view>
                </view>

                <view class="bg-[#fff] mx-[30rpx] p-[30rpx] rounded-[10rpx] flex justify-between flex-wrap mt-[30rpx]">
                    <view class="w-[160rpx] h-[160rpx] flex-2" @click="goodsEvent(detail.order_item.goods_id)">
                        <u--image class="rounded-[10rpx] overflow-hidden" width="160rpx" height="160rpx" :src="img(detail.order_item.item_image_thumb_small ? detail.order_item.item_image_thumb_small : '')" model="aspectFill">
                            <template #error>
                                <u-icon name="photo" color="#999" size="50"></u-icon>
                            </template>
                        </u--image>
                    </view>
                    <view class="ml-[20rpx] flex flex-1 flex-col justify-between">
                        <view>
                            <text class="text-[28rpx] text-item leading-[40rpx]">{{ detail.order_item.item_name }}</text>
                        </view>
                        <view class="text-[24rpx] flex">
                            <text class="text-[var(--primary-color)] rounded-[6rpx] py-[6rpx] bg-[var(--primary-color-light)] px-[10rpx]">{{ detail.order_item.item_type == 'reservation' ? '预约' : '一口价' }}</text>
                        </view>
                        <view class="flex justify-between">
                            <text class="text-right text-[28rpx]  text-[var(--price-text-color)] price-font">￥{{ detail.order_item.price }}</text>
                            <text class="text-right text-sm"><text class="text-[26rpx]">x</text>{{ detail.order_item.num }}</text>
                        </view>
                    </view>
                </view>
                <view class="bg-[#fff] mx-[30rpx] p-[30rpx] mt-[30rpx] rounded-[10rpx]">
                    <view class="flex justify-between text-[28rpx] pt-[20rpx] border-top-[2rpx] border-[solid] border-[#f1f1f1]">
                        <view>{{t('refundMoney')}}</view>
                        <view class="w-[400rpx] multi-hidden text-right leading-[1.2]">{{ detail.status == 'wait_refund' ? parseFloat(detail.apply_money).toFixed(2) : parseFloat(detail.money).toFixed(2) }}</view>
                    </view>
                    <view class="flex justify-between text-[28rpx] pt-[20rpx] border-top-[2rpx] border-[solid] border-[#f1f1f1] mt-[40rpx]">
                        <view>{{t('refundCause')}}</view>
                        <view class="w-[400rpx] multi-hidden text-right leading-[1.2]">{{ detail.reason || '--' }}</view>
                    </view>
                    <view class="flex justify-between text-[28rpx] pt-[20rpx] border-top-[2rpx] border-[solid] border-[#f1f1f1] mt-[40rpx]">
                        <view>{{t('refundNo')}}</view>
                        <view>{{ detail.refund_no}}</view>
                    </view>
                    <view class="flex justify-between text-[28rpx] pt-[20rpx] border-top-[2rpx] border-[solid] border-[#f1f1f1] mt-[40rpx]">
                        <view>{{t('createTime')}}</view>
                        <view>{{ detail.create_time }}</view>
                    </view>
                    <view class="flex justify-between text-[28rpx] pt-[20rpx] border-top-[2rpx] border-[solid] border-[#f1f1f1] mt-[40rpx]">
                        <view>{{t('createExplain')}}</view>
                        <view class="max-w-[480rpx]">{{ detail.remark }}</view>
                    </view>
                    <view v-if="detail.voucher" class="text-[28rpx] pt-[20rpx] border-top-[2rpx] border-[solid] border-[#f1f1f1] mt-[40rpx]">
                        <view>{{t('voucher')}}</view>
                        <view class="flex mt-[20rpx] flex-wrap">
                            <template v-for="(item,index) in detail.voucher.split(',')">
                                <view class="w-[140rpx] h-[140rpx] mr-[10rpx] mb-[10rpx]" @click="handleImg(item)">
                                    <u--image class="rounded-[10rpx] overflow-hidden " width="140rpx" height="140rpx" :src="img(item ? item : '')" model="aspectFill">
                                        <template #error>
                                            <u-icon name="photo" color="#999" size="50"></u-icon>
                                        </template>
                                    </u--image>
                                </view>
                            </template>
                        </view>
                    </view>
                    <view v-if="detail.refuse_reason" class="flex justify-between text-[28rpx] pt-[20rpx] border-top-[2rpx] border-[solid] border-[#f1f1f1] mt-[40rpx]">
                        <view>{{t('createExplain')}}</view>
                        <view class="max-w-[480rpx]">{{ detail.refuse_reason }}</view>
                    </view>
                </view>

                <view class="bg-[#fff] mx-[30rpx] p-[30rpx] mt-[30rpx] rounded-[10rpx]">
                    <view class="flex justify-between text-[28rpx] border-top-[2rpx] border-[solid] border-[#f1f1f1]">
                        <view>{{t('record')}}</view>
                        <view class="flex items-center" @click="redirect({url: '/addon/o2o/pages/refund/log', param: { refund_no: detail.refund_no}})">
                            <text>{{t('check')}}</text>
                            <text class="nc-iconfont nc-icon-youV6xx text-[26rpx] text-[var(--text-color-light6)]"></text>
                        </view>
                    </view>
                </view>

                <view class="flex tab-bar justify-between items-center bg-[#fff] fixed left-0 right-0 bottom-0 min-h-[100rpx] px-1 flex-wrap">
                    <view class="flex ml-[30rpx] w-[70rpx] flex-col justify-center items-center" @click="redirect({ url: '/addon/o2o/pages/index', mode: 'reLaunch' })">
                        <text class="nc-iconfont nc-icon-shouye-xiaolianV6xx text-[34rpx]"></text>
                        <text class="text-xs mt-1">{{t('index')}}</text>
                    </view>
                    <view class="flex justify-end mr-[30rpx]">
                        <view class="inline-block text-[26rpx] leading-[56rpx] px-[30rpx] border-[3rpx] border-solid border-[#999] rounded-full ml-[20rpx]" @click="cancelRefundFn(detail)" v-if="detail.status == 'wait_refund'">{{t('refundApply')}}</view>
                    </view>
                </view>
            </view>
            <!-- 取消退款 -->
            <u-modal :show="cancelRefundshow" confirmColor="var(--primary-color)" :content="t('cancelRefundContent')" :showCancelButton="true" :closeOnClickOverlay="true" @cancel="refundCancel" @confirm="refundConfirm"></u-modal>

        </view>

		<loading-page :loading="loading"></loading-page>
    </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { onLoad,onUnload } from '@dcloudio/uni-app'
import { t } from '@/locale'
import { img, redirect } from '@/utils/common';
import { getRefundDetail, cancelRefund } from '@/addon/o2o/api/order';

const detail = ref<Object>({});
const loading = ref<boolean>(true);
const refundNo = ref('');
onLoad((option) => {
	refundNo.value = option.refund_no;
	refundDetailFn(refundNo.value);
});

const refundDetailFn = (refundNo) => {
	loading.value = true;
	getRefundDetail(refundNo).then((res) => {
		detail.value = res.data;
		loading.value = false;
	}).catch(() => {
		loading.value = false;
	})
}

const goodsEvent = (id: number) => {
	redirect({
		url: '/addon/o2o/pages/goods/detail',
		param: {
			goods_id: id
		}
	})
}

// 取消退款
const cancelRefundshow = ref(false);
let currRefundId = "";
let curOrderId = '';
const cancelRefundFn = (data) => {
	currRefundId = data.refund_id;
    curOrderId = data.order_id
	cancelRefundshow.value = true;
}

const refundConfirm = ()=> {
    cancelRefund(currRefundId).then((res) => {
        cancelRefundshow.value = false;
        redirect({
            url: '/addon/o2o/pages/order/detail',
            param: {
                order_id: curOrderId
            }
        })
    }).catch(() => {
        cancelRefundshow.value = false;
    })
}

const refundCancel = ()=>{
	cancelRefundshow.value = false;
}

const handleImg = (url) => {
	let tmp = [];
	if(detail.value.voucher){
        tmp = detail.value.voucher.split(',').map(item => {
            return img(item)
        })
    }
	uni.previewImage({
		current: img(url),
		urls: tmp,
		indicator: "number",
		loop: true
	})

}

// 关闭预览图片
onUnload(()=>{
    // #ifdef  H5 || APP
    uni.closePreviewImage()
    // #endif
})
</script>
<style lang="scss" scoped>
.text-item {
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.text-color {
	color: $u-primary;
}
</style>
