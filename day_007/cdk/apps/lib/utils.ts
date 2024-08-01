import moment from 'moment'

export const DATE_FORMAT = 'YYYY-MM-DD'
export const TIME_FORMAT = 'HH:mm:ss'
export const DATETIME_FORMAT = `${DATE_FORMAT} ${TIME_FORMAT}`

export const isNull = (value: any) => value === null

export const nowDate = () => moment().format(DATETIME_FORMAT)