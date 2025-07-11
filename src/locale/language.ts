import { nextTick } from 'vue'
import { getAppPages, getSubPackagesPages} from "@/utils/pages"

class Language {
    private i18n: any
    private loadLocale: Array<string> = [] //已加载的语言

    public path = ''

    constructor(i18n: any) {
        this.i18n = i18n
    }

    /**
     *
     * @param locale 设置语言
     */
    public setI18nLanguage(locale: string, path: string = '') {
        if (this.i18n.global.locale == locale) return
        this.i18n.global.locale = locale
        path && (this.path = path)
        uni.setLocale(locale)
    }

    public loadAllLocaleMessages(app: string, locale: string) {
        const pages = app == 'app' ? getAppPages() : getSubPackagesPages()
        pages.forEach((path: string) => {
            this.loadLocaleMessages(path, locale)
        })
    }

    /**
     * 加载语言包
     * @param path
     * @param locale
     * @returns
     */
    public async loadLocaleMessages(path: string, locale: string) {
        try {
            const { route, file, fileKey } = this.getFileKey(path)

            // 是否已加载
            if (this.loadLocale.includes(`${fileKey}.${locale}`)) {
                this.setI18nLanguage(locale, file)
                return nextTick()
            }

            // 引入语言包文件
            const messages = await import(route == 'app' ? `../${route}/locale/${locale}/${file}.json` : `../addon/${route}/locale/${locale}/${file}.json`)
            let data: Record<string, string> = {}
            Object.keys(messages.default).forEach(key => {
                data[`${fileKey}.${key}`] = messages.default[key]
            })

            this.i18n.global.mergeLocaleMessage(locale, data)
            this.setI18nLanguage(locale, file)

            this.loadLocale.push(`${fileKey}.${locale}`)

            return nextTick()
        } catch (e) {
            // console.log(e)
            this.setI18nLanguage(locale)
            return nextTick()
        }
    }

    public getFileKey = (path: string) => {
        const pathArr = path.split('/')
        let route = pathArr[1] == 'app' ? pathArr[1] : pathArr[2];

        let file = path == '/' ? 'pages.index.index' : path.replace('/', '').replaceAll('/', '.')

        // 如果是系统页面，则移除“app.”
        let fileKey = ''
        if (route == 'app') {
            fileKey = file.replace('app.', '')
            file = file.replace('app.', '')
        } else {
            fileKey = file.replace(`addon.`, '')
            file = file.replace(`addon.${route}.`, '')
        }
        return { file, fileKey, route }
    }
}

export default Language
