import { AgeRange, BirthdayType, Relation, RemindeType, Sex } from '@/types/common'

export const usageAgeOptions = [
  { value: AgeRange.ALL, text: '通用' },
  { value: AgeRange.INFANT, text: '婴儿(0 - 1岁)' },
  { value: AgeRange.TODDLER, text: '幼儿(1 - 3岁)' },
  { value: AgeRange.PRESCHOOLER, text: '学龄前儿童(3 - 6岁)' },
  { value: AgeRange.CHILD, text: '儿童(6 - 12岁)' },
  { value: AgeRange.TEENAGER, text: '少年(12 - 18岁)' },
  { value: AgeRange.YOUTH, text: '青年(18 - 35岁)' },
  { value: AgeRange.MIDDLE_AGED, text: '中年(35 - 60岁)' },
  { value: AgeRange.ELDERLY, text: '老年(60岁以上)' },
]
export const sexOptions = [
  { value: Sex.ALL, text: '通用' },
  { value: Sex.MALE, text: '男' },
  { value: Sex.FEMALE, text: '女' },
]

export const remindTimes = [
  { value: RemindeType.ONE_DAY, text: '提前一天' },
  { value: RemindeType.TWO_DAY, text: '提前两天' },
  { value: RemindeType.THREE_DAY, text: '提前三天' },
  { value: RemindeType.FOUR_DAY, text: '提前四天' },
  { value: RemindeType.ONE_WEEK, text: '提前一周' },
  { value: RemindeType.ONE_MONTH, text: '提前一月' },
]
export const relationOptions = [
  { value: Relation.FAMILY, text: '亲人' },
  { value: Relation.FRIEND, text: '朋友' },
  { value: Relation.TEACHER, text: '老师' },
  { value: Relation.COLLEAGUE, text: '同事' },
  { value: Relation.CUSTOM, text: '客户' },
  { value: Relation.OTHER, text: '其他' },
]

export const lunarYearOptions = Array.from({ length: 200 }, (_, i) => ({
  value: i + 1900,
  text: (i + 1900).toString() + '年',
}))

export const lunarMonthOptions = [
  {
    value: '01',
    text: '正月',
  },
  {
    value: '02',
    text: '二月',
  },
  {
    value: '03',
    text: '三月',
  },
  {
    value: '04',
    text: '四月',
  },
  {
    value: '05',
    text: '五月',
  },
  {
    value: '06',
    text: '六月',
  },
  {
    value: '07',
    text: '七月',
  },
  {
    value: '08',
    text: '八月',
  },
  {
    value: '09',
    text: '九月',
  },
  {
    value: '10',
    text: '十月',
  },
  {
    value: '11',
    text: '冬月',
  },
  {
    value: '12',
    text: '腊月',
  },
]

export const lunarDayOptions = [
  {
    value: 1,
    text: '初一',
  },
  {
    value: 2,
    text: '初二',
  },
  {
    value: 3,
    text: '初三',
  },
  {
    value: 4,
    text: '初四',
  },
  {
    value: 5,
    text: '初五',
  },
  {
    value: 6,
    text: '初六',
  },
  {
    value: 7,
    text: '初七',
  },
  {
    value: 8,
    text: '初八',
  },
  {
    value: 9,
    text: '初九',
  },
  {
    value: 10,
    text: '初十',
  },
  {
    value: 11,
    text: '十一',
  },
  {
    value: 12,
    text: '十二',
  },
  {
    value: 13,
    text: '十三',
  },
  {
    value: 14,
    text: '十四',
  },
  {
    value: 15,
    text: '十五',
  },
  {
    value: 16,
    text: '十六',
  },
  {
    value: 17,
    text: '十七',
  },
  {
    value: 18,
    text: '十八',
  },
  {
    value: 19,
    text: '十九',
  },
  {
    value: 20,
    text: '二十',
  },
  {
    value: 21,
    text: '廿一',
  },
  {
    value: 22,
    text: '廿二',
  },
  {
    value: 23,
    text: '廿三',
  },
  {
    value: 24,
    text: '廿四',
  },
  {
    value: 25,
    text: '廿五',
  },
  {
    value: 26,
    text: '廿六',
  },
  {
    value: 27,
    text: '廿七',
  },
  {
    value: 28,
    text: '廿八',
  },
  {
    value: 29,
    text: '廿九',
  },
  {
    value: 30,
    text: '三十',
  },
]

export const birthdayTypes = [
  { value: BirthdayType.SOLAR, text: '公历' },
  { value: BirthdayType.LUNAR, text: '农历' },
]
