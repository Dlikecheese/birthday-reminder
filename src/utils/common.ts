import { AgeRange, Sex } from '@/types/common'

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
