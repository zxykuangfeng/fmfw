import useMemberStore from '@/stores/member'
import { t } from '@/locale'
import { getToken, getAppChannel, getSiteId, redirect, currRoute, isUrl } from './common'
import qs from 'qs'

interface RequestConfig {
    showErrorMessage?: boolean
    showSuccessMessage?: boolean
}

interface RequestOptions extends UniNamespace.RequestOptions, RequestOptions {
}

class Request {
    private baseUrl: string

    private config: RequestOptions = {
        url: '',
        header: {}
    }

    constructor() {
        // #ifdef H5
        this.baseUrl = import.meta.env.VITE_APP_BASE_URL || `${ location.origin }/api/`
        // #endif
        // #ifndef H5
        this.baseUrl = import.meta.env.VITE_APP_BASE_URL
        // #endif
        this.baseUrl.substr(-1) != '/' && (this.baseUrl += '/')

        try {
            if (process.env.NODE_ENV == 'development') {
                this.config.header[import.meta.env.VITE_REQUEST_HEADER_SITEID_KEY] = getSiteId(import.meta.env.VITE_SITE_ID || uni.getStorageSync('wap_site_id'))
            } else {
                this.config.header[import.meta.env.VITE_REQUEST_HEADER_SITEID_KEY] = getSiteId(import.meta.env.VITE_SITE_ID)
            }
            this.config.header[import.meta.env.VITE_REQUEST_HEADER_CHANNEL_KEY] = getAppChannel()
        } catch (e) {
        }

    }

    /**
     * 请求拦截器
     */
    private requestInterceptors() {
        // 携带token site-id
        try {
            getToken() && (this.config.header[import.meta.env.VITE_REQUEST_HEADER_TOKEN_KEY] = getToken())
            this.config.header[import.meta.env.VITE_REQUEST_HEADER_CHANNEL_KEY] = getAppChannel()
            if (process.env.NODE_ENV == 'development') {
                this.config.header[import.meta.env.VITE_REQUEST_HEADER_SITEID_KEY] = getSiteId(import.meta.env.VITE_SITE_ID || uni.getStorageSync('wap_site_id'))
            } else {
                this.config.header[import.meta.env.VITE_REQUEST_HEADER_SITEID_KEY] = getSiteId(import.meta.env.VITE_SITE_ID)
            }
        } catch (e) {
        }
    }

    public get(url: string, data: AnyObject = {}, config: RequestConfig = {}) {
        return this.request('GET', url, data, config)
    }

    public post(url: string, data: AnyObject = {}, config: RequestConfig = {}) {
        return this.request('POST', url, data, config)
    }

    public put(url: string, data: AnyObject = {}, config: RequestConfig = {}) {
        return this.request('PUT', url, data, config)
    }

    public delete(url: string, data: AnyObject = {}, config: RequestConfig = {}) {
        return this.request('DELETE', url, data, config)
    }
    /**
     * 发送上传请求
     */
    public upload(url: string, data: AnyObject = {}, config: RequestConfig = {}) {
        this.requestInterceptors()

        const params = Object.assign(uni.$u.deepClone(this.config), config, {
            url: this.baseUrl + url,
            ...data
        })

        return new Promise((resolve, reject) => {
            uni.uploadFile({
                ...params,
                success: res => {
                    const data = JSON.parse(res.data)
                    if (data.code == 1) {
                        this.config.showSuccessMessage && uni.showToast({ title: data.msg, icon: 'none' })
                        resolve(data)
                    } else {
                        if (data.code == 0 || data.code == 400) {
                            if (this.config.showErrorMessage !== false) uni.showToast({ title: data.msg, icon: 'none' })
                        } else {
                            this.handleAuthError(data.code)
                        }
                        reject(data)
                    }
                },
                fail: res => {
                    reject(res)
                }
            })
        })
    }

    /**
     * 发送请求
     */
    private request(method: string, url: string, data ?: AnyObject, config: RequestConfig = {}) {
        this.requestInterceptors()

        const params = Object.assign(uni.$u.deepClone(this.config), config, {
            url: this.baseUrl + url,
            method
        })

        if (params.method.toUpperCase() == 'GET' || params.method.toUpperCase() == 'DELETE') {
            params.url += '?' + qs.stringify(data);
        } else {
            params.data = data;
        }

        return new Promise((resolve, reject) => {
            uni.request({
                ...params,
                success: res => {
                    const data = res.data
                    if (data.code == 1) {
                        config.showSuccessMessage && uni.showToast({ title: data.msg, icon: 'none' })
                        resolve(data)
                    } else {
                        if (data.code == 0 || data.code == 400) {
                            if (config.showErrorMessage !== false) uni.showToast({ title: data.msg, icon: 'none' })
                        } else {
                            this.handleAuthError(data.code)
                        }
                        reject(data)
                    }
                },
                fail: res => {
                    reject(res)
                },
                complete: (res) => {
                    this.handleRequestFail(res)
                }
            })
        })
    }

    private handleAuthError(code: number) {
        switch (code) {
            case 401:
                useMemberStore().logout()
                break;
            case 402:
                if (currRoute().indexOf('app/pages/index/close') != -1) return;
                redirect({ url: '/app/pages/index/close', mode: 'reLaunch' })
                break;
            case 403:
                if (currRoute().indexOf('app/pages/index/nosite') != -1) return;
                redirect({ url: '/app/pages/index/nosite', mode: 'switchTab' })
                break;
        }
    }

    private handleRequestFail(res) {
        if (res.errMsg && res.errMsg == "request:ok") {
            if (typeof res.data == 'string') {
                // #ifdef H5
                const err = (isUrl(this.baseUrl) ? this.baseUrl : location.origin + this.baseUrl) + t('baseUrlError')
                // #endif
                // #ifndef H5
                const err = this.baseUrl + t('baseUrlError')
                // #endif
                uni.showToast({ icon: 'none', title: err })
                return
            }
        }
        if (res.errMsg == 'request:fail') {
            uni.showToast({ icon: 'none', title: this.baseUrl + t('requestFail') })
            return
        }
        if (res.errMsg && res.errMsg == 'request:fail url not in domain list') {
            uni.showToast({ icon: 'none', title: this.baseUrl + t('notInDomainList') });
            return
        }
    }
}

export default new Request()
