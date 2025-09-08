// Reexport the native module. On web, it will be resolved to ExpoSmsReaderModule.web.ts
// and on native platforms to ExpoSmsReaderModule.ts
export * from './src/ExpoSmsReader.types'
export { default } from './src/ExpoSmsReaderModule'
export { checkSMSPermission, isAvailable, readSMS, requestSMSPermission } from './src/index'
