// Reexport the native module. On web, it will be resolved to RoseSmsReaderModule.web.ts
// and on native platforms to RoseSmsReaderModule.ts
export { checkSMSPermission, isAvailable, readSMS, requestSMSPermission } from './src/index'
export * from './src/RoseSmsReader.types'
export { default } from './src/RoseSmsReaderModule'
