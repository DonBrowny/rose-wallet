import { HomeScreen } from '@/screens/home-screen/home-screen'
// TODO: Add the plugin expo-drizzle-studio-plugin back in when it is compatible with the latest version of Expo.
// import { DB_NAME } from '@/types/constants'
// import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'
// import * as SQLite from 'expo-sqlite'

// const db = SQLite.openDatabaseSync(DB_NAME)

export default function Index() {
  // useDrizzleStudio(db)
  return <HomeScreen />
}
