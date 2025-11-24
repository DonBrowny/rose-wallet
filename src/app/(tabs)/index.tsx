import { HomeScreen } from '@/screens/home-screen/home-screen'
import { DB_NAME } from '@/types/constants'
import * as SQLite from 'expo-sqlite'

const db = SQLite.openDatabaseSync(DB_NAME)

export default function Index() {
  if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useDrizzleStudio } = require('expo-drizzle-studio-plugin')
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDrizzleStudio(db)
  }
  return <HomeScreen />
}
