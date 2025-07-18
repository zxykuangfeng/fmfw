<template>
	<view :style="warpCss">
		<view class="pt-[34rpx] member-info">
			<view v-if="info" class="flex ml-[32rpx] mr-[52rpx]  items-center relative">
				<!-- 唤起获取微信 -->
				<u-avatar :src="img(info.headimg)" size="55" :default-url="img('static/resource/images/default_headimg.png')" leftIcon="none" @click="clickAvatar"></u-avatar>
				<view class="ml-[22rpx]">
					<view class="text-[#222222] truncate w-[430rpx] font-bold text-lg" :style="{ color : diyComponent.textColor }">{{ info.nickname }}</view>
					<view class="text-[#696B70] text-[24rpx] mt-[10rpx]" :style="{ color : diyComponent.textColor }">UID：{{ info.member_no }}</view>
				</view>
				<view class="set-icon flex items-center absolute right-0 top-2">
					<view @click="redirect({ url: '/app/pages/setting/index' })">
						<text class="nc-iconfont nc-icon-shezhiV6xx-1 text-[40rpx] ml-[10rpx]" :style="{ color : diyComponent.textColor }"></text>
					</view>
				</view>
			</view>
			<view v-else class="flex ml-[32rpx] mr-[52rpx]  items-center relative" @click="toLogin">
				<u-avatar :src="img('static/resource/images/default_headimg.png')" size="55" />
				<view class="ml-[22rpx]">
					<view class="text-[#222222] font-bold text-lg" :style="{ color : diyComponent.textColor }">
						{{ t('login') }}/{{ t('register') }}
					</view>
				</view>
				<view class="set-icon flex items-center absolute right-0 top-2">
					<view @click="redirect({ url: '/app/pages/setting/index' })">
						<text class="nc-iconfont nc-icon-shezhiV6xx-1 text-[40rpx] ml-[10rpx]" :style="{ color : diyComponent.textColor }"></text>
					</view>
				</view>
			</view>

			<view class="flex m-[30rpx] mb-0 py-[30rpx] items-center">
				<view class="flex-1 text-center">
					<view class="font-bold">
						<view @click="redirect({ url: info ? '/app/pages/member/balance' : '' })" :style="{ color : diyComponent.textColor }">{{ money }}</view>
					</view>
					<view class="text-sm mt-[10rpx]">
						<view @click="redirect({ url: info ? '/app/pages/member/balance' : '' })" :style="{ color : diyComponent.textColor }">{{ t('balance') }}</view>
					</view>
				</view>
				<view class="border-solid border-white border-l border-b-0 border-t-0 border-r-0 h-[60rpx]"></view>
				<view class="flex-1 text-center">
					<view class="font-bold">
						<view @click="redirect({ url: info ? '/app/pages/member/point' : '' })" :style="{ color : diyComponent.textColor }">{{ parseInt(info?.point) || 0 }}</view>
					</view>
					<view class="text-sm mt-[10rpx]">
						<view @click="redirect({ url: info ? '/app/pages/member/point' : '' })" :style="{ color : diyComponent.textColor }">{{ t('point') }}</view>
					</view>
				</view>
			</view>
		</view>

		<!-- #ifdef MP-WEIXIN -->
		<information-filling ref="infoFill"></information-filling>
		<!-- #endif -->

	</view>
</template>

<script lang="ts" setup>
	import { computed, ref } from 'vue'
	import useMemberStore from '@/stores/member'
	import { useLogin } from '@/hooks/useLogin'
	import { img, isWeixinBrowser, redirect, urlDeconstruction, moneyFormat } from '@/utils/common'
	import { t } from '@/locale'
	import { wechatSync } from '@/app/api/system'
	import useDiyStore from '@/app/stores/diy'

	const props = defineProps(['component', 'index']);

	const diyStore = useDiyStore();

	const diyComponent = computed(() => {
		if (diyStore.mode == 'decorate') {
			return diyStore.value[props.index];
		} else {
			return props.component;
		}
	})

	const warpCss = computed(() => {
		var style = '';
        if(diyComponent.value.componentStartBgColor) {
            if (diyComponent.value.componentStartBgColor && diyComponent.value.componentEndBgColor) style += `background:linear-gradient(${diyComponent.value.componentGradientAngle},${diyComponent.value.componentStartBgColor},${diyComponent.value.componentEndBgColor});`;
            else style += 'background-color:' + diyComponent.value.componentStartBgColor + ';';
        }
		if (diyComponent.value.bgUrl) {
			style += 'background-image:url(' + img(diyComponent.value.bgUrl) + ');';
			style += 'background-size: 100%;';
			style += 'background-repeat: no-repeat;';
		}
		if (diyComponent.value.topRounded) style += 'border-top-left-radius:' + diyComponent.value.topRounded * 2 + 'rpx;';
		if (diyComponent.value.topRounded) style += 'border-top-right-radius:' + diyComponent.value.topRounded * 2 + 'rpx;';
		if (diyComponent.value.bottomRounded) style += 'border-bottom-left-radius:' + diyComponent.value.bottomRounded * 2 + 'rpx;';
		if (diyComponent.value.bottomRounded) style += 'border-bottom-right-radius:' + diyComponent.value.bottomRounded * 2 + 'rpx;';
		return style;
	})

	const memberStore = useMemberStore()

	// #ifdef H5
	const { query } = urlDeconstruction(location.href)
	if (query.code && isWeixinBrowser()) {
		wechatSync({ code: query.code }).then(res => {
			memberStore.getMemberInfo()
		})
	}
	// #endif

	const info = computed(() => {
		// 装修模式
		if (diyStore.mode == 'decorate') {
			return {
				headimg: '',
				nickname: '昵称',
				balance: 0,
				point: 0,
				money: 0,
				member_no: 'NIU0000021'
			}
		} else {
			return memberStore.info;
		}
	})

	const money = computed(() => {
		if (info.value) {
			let m = parseFloat(info.value.balance) + parseFloat(info.value.money)
			return moneyFormat(m.toString());
		} else {
			return 0;
		}
	})

	const toLogin = () => {
		useLogin().setLoginBack({ url: '/addon/o2o/pages/member/index' })
	}

	const infoFill = ref(false)
	const clickAvatar = () => {
		// #ifdef MP-WEIXIN
		infoFill.value.show = true
		// #endif

		// #ifdef H5
		if (isWeixinBrowser()) {
			useLogin().getAuthCode({ scopes : 'snsapi_userinfo' })
		} else {
			redirect({ url: '/app/pages/member/personal' })
		}
		// #endif
	}
</script>

<style lang="scss" scoped>
	.member-info {
		// background-image: linear-gradient(#E3F0FF, #F5F6F8)
	}
</style>
