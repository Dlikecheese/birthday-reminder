export interface UserInfo {
  nickName: string
  avatarUrl: string
  id: string
  token: string
}

export enum Sex {
  ALL = 'ALL',
  MALE = 'MAIL',
  FEMALE = 'FEMALE',
}

/**
 * 年龄段枚举类型
 */
export enum AgeRange {
  ALL = 'ALL',
  // 婴儿：年龄范围从 0 岁到 1 岁
  INFANT = 'INFANT',
  // 幼儿：年龄范围从 1 岁到 3 岁
  TODDLER = 'TODDLER',
  // 学龄前儿童：年龄范围从 3 岁到 6 岁
  PRESCHOOLER = 'PRESCHOOLER',
  // 儿童：年龄范围从 6 岁到 12 岁
  CHILD = 'CHILD',
  // 少年：年龄范围从 12 岁到 18 岁
  TEENAGER = 'TEENAGER',
  // 青年：年龄范围从 18 岁到 35 岁
  YOUTH = 'YOUTH',
  // 中年：年龄范围从 35 岁到 60 岁
  MIDDLE_AGED = 'MIDDLE_AGED',
  // 老年：年龄范围为 60 岁及以上
  ELDERLY = 'ELDERLY',
}

/** 提醒时间类型 */
export enum RemindeType {
  ONE_DAY = 'ONE_DAY',
  TWO_DAY = 'TWO_DAY',
  THREE_DAY = 'THREE_DAY',
  FOUR_DAY = 'FOUR_DAY',
  ONE_WEEK = 'ONE_WEEK',
  ONE_MONTH = 'ONE_MONTH',
}

/**
 * 关系
 */
export enum Relation {
  FAMILY = 'FAMILY',
  FRIEND = 'FRIEND',
  COLLEAGUE = 'COLLEAGUE',
  TEACHER = 'TEACHER',
  CUSTOM = 'CUSTOM',
  OTHER = 'OTHER',
}

/**
 * 生日类型
 * @property {string} SOLAR - 阳历-公历
 * @property {string} LUNAR - 阴历-农历
 */
export enum BirthdayType {
  SOLAR = 'SOLAR',
  LUNAR = 'LUNAR',
}
