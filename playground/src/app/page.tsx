import { BestIdStudio } from '~/components/best-id-studio'
import {
  createBatch,
  DEFAULT_COUNT,
  DEFAULT_PREFIX,
} from '~/lib/best-id-studio-data'

export default function Home() {
  const initialGeneratedItems = createBatch(DEFAULT_PREFIX, DEFAULT_COUNT)

  return <BestIdStudio initialGeneratedItems={initialGeneratedItems} />
}
