import { HomeScreen } from '@/screens/home-screen/home-screen'
import { DB_NAME } from '@/types/constants'
import * as SQLite from 'expo-sqlite'

const db = SQLite.openDatabaseSync(DB_NAME)

type UseDrizzleStudio = (db: unknown) => void
let useDrizzleStudioDev: UseDrizzleStudio = () => {}
if (__DEV__) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useDrizzleStudio } = require('expo-drizzle-studio-plugin')
  useDrizzleStudioDev = useDrizzleStudio
}

export default function Index() {
  useDrizzleStudioDev(db)
  return <HomeScreen />
}
