//字符串拼接
function strFormat(str) {
    return str < 10 ? `0${ str }` : str
}

// 获取当前时间
export function currentTime() {
    const myDate = new Date();
    const y = myDate.getFullYear()
    const m = myDate.getMonth() + 1;
    const d = myDate.getDate();
    const date = y + '-' + strFormat(m) + '-' + strFormat(d)//年月日
    const mdTime = strFormat(m) + '-' + strFormat(d)
    const md = strFormat(m) + '月' + strFormat(d) + '日'
    const hour = myDate.getHours()
    const min = myDate.getMinutes()
    const secon = myDate.getSeconds()
    const seconTime = Math.floor(Date.now() / 1000)
    const time = strFormat(hour) + ':' + strFormat(min) + ':' + strFormat(secon);
    return {
        y,
        md,
        mdTime,
        date,
        time,
        seconTime
    }
}

//时间戳转日期
export function timeStamp(time, isQuantum) {
    const dates = new Date(time)
    const year = dates.getFullYear()
    const month = dates.getMonth() + 1
    const date = dates.getDate()
    const day = dates.getDay()
    const hour = dates.getHours()
    const min = dates.getMinutes()
    const days = ['日', '一', '二', '三', '四', '五', '六']
    const xinqi = [7, 1, 2, 3, 4, 5, 6]
    return {
        allDate: `${ year }/${ strFormat(month) }/${ strFormat(date) }`,
        date: `${ strFormat(year) }-${ strFormat(month) }-${ strFormat(date) }`, //返回的日期 2000-07-01
        md: `${ strFormat(month) }月${ strFormat(date) }日`,//返回的日期 07月01日
        mdTime: `${ strFormat(month) }-${ strFormat(date) }`, //返回的日期 07-01
        day: `周${ days[day] }`, //返回的礼拜天数  星期一
        dayNum: `${ xinqi[day] }`, //返回的礼拜天数 用于判断左侧设置
        hour: strFormat(hour) + ':' + strFormat(min) + ( isQuantum ? "" : ':00' ) //返回的时钟 08:00
    }
}

//获取最近7天的日期和礼拜天数
export function initData() {
    const time = []
    const date = new Date()

    const now = date.getTime() //获取当前日期的时间戳
    let timeStr = 3600 * 24 * 1000 //一天的时间戳
    let obj = {
        0: "今天",
        1: "明天",
        2: "后天"
    }
    for (let i = 0; i < 10; i++) {
        time.push({
            date: timeStamp(now + timeStr * i).date, //保存日期(年月日)
            mdTime: timeStamp(now + timeStr * i).md,
            md: obj[i] ? obj[i] : timeStamp(now + timeStr * i).md,
            timeStamp: now + timeStr * i, //保存时间戳
            week: timeStamp(now + timeStr * i).day,
            dayNum: timeStamp(now + timeStr * i).dayNum,
            disable: false
        })
    }
    return time
}

//时间数组
export function initTime(startTime = '10:00:00', endTime = '21:00:00', timeInterval = 1, isQuantum = false) {
    const time = []
    const date = timeStamp(Date.now()).allDate
    const startDate = `${ date } ${ startTime }`
    const endDate = `${ date } ${ endTime }`
    const startTimeStamp = new Date(startDate).getTime()
    const endTimeStamp = new Date(endDate).getTime()
    const timeStr = 3600 * 1000 * timeInterval
    const sum = ( endTimeStamp - startTimeStamp ) / timeStr
    const count = sum % 2 == 0 ? sum : ( sum - 1 )
    let num = 0
    for (let i = startTimeStamp; i <= endTimeStamp; i = i + timeStr) {
        if (isQuantum) {
            num++
            time.push({
                begin: timeStamp(i, isQuantum).hour,
                end: timeStamp(i + timeStr, isQuantum).hour,
                disable: false
            })
        } else {
            time.push({
                time: timeStamp(i).hour,
                disable: false
            })
        }
        if (isQuantum && num >= count) return time
    }
    return time
}

// 时间戳转时间
export function timestampTransition(timeStamp) {
    let hour = Math.floor(timeStamp / ( 60 * 60 ))
    let minute = Math.floor(timeStamp / 60) - ( hour * 60 )
    let second = timeStamp % 60
    hour = hour < 10 ? ( '0' + hour ) : hour
    minute = minute < 10 ? ( '0' + minute ) : minute
    second = second < 10 ? ( '0' + second ) : second
    return hour + ':' + minute + ':' + second
}

// 时间转时间戳
export function timeTransition(time) {
    const arr = time.split(':')
    const num = arr[0] * 60 * 60 + arr[1] * 60 + Number(arr[2])
    return num
}
