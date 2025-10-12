import { MMKV_KEYS } from '@/types/mmkv-keys'
import { getPatternSamplesByName, setPatternSamplesByName } from './pattern-samples'
import { storage } from './storage'

// Mock the native MMKV to avoid requiring a real device environment
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
  })),
}))

describe('getPatternSamplesByName', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns [] when no data present', () => {
    jest.spyOn(storage, 'getString').mockReturnValueOnce(undefined as any)
    const result = getPatternSamplesByName('SBI')
    expect(result).toEqual([])
  })

  it('returns [] on invalid JSON', () => {
    jest.spyOn(storage, 'getString').mockReturnValueOnce('{invalid json')
    const result = getPatternSamplesByName('HDFC')
    expect(result).toEqual([])
  })

  it('returns [] when name not found in map', () => {
    jest.spyOn(storage, 'getString').mockReturnValueOnce(JSON.stringify({ OTHER: [{ id: 'x' }] }))
    const result = getPatternSamplesByName('ICICI')
    expect(result).toEqual([])
  })

  it('returns samples array when name is present', () => {
    const samples = [{ id: '1' } as any]
    jest.spyOn(storage, 'getString').mockReturnValueOnce(JSON.stringify({ AXIS: samples }))
    const result = getPatternSamplesByName('AXIS')
    expect(Array.isArray(result)).toBe(true)
    expect(result).toEqual(samples)
  })
})

describe('setPatternSamplesByName', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('writes new map when none exists', () => {
    const getSpy = jest.spyOn(storage, 'getString').mockReturnValueOnce(undefined as any)
    const setSpy = jest.spyOn(storage, 'set').mockImplementation(() => {})
    const samples = [{ id: '1' } as any]

    setPatternSamplesByName('HDFC', samples)

    expect(getSpy).toHaveBeenCalledWith(MMKV_KEYS.PATTERNS.DISCOVERY_SAMPLES_V1)
    expect(setSpy).toHaveBeenCalledTimes(1)
    expect(setSpy).toHaveBeenCalledWith(MMKV_KEYS.PATTERNS.DISCOVERY_SAMPLES_V1, JSON.stringify({ HDFC: samples }))
  })

  it('merges with existing map (overwrites given name)', () => {
    const existing = { SBI: [{ id: 'a' }], ICICI: [{ id: 'x' }] }
    jest.spyOn(storage, 'getString').mockReturnValueOnce(JSON.stringify(existing))
    const setSpy = jest.spyOn(storage, 'set').mockImplementation(() => {})

    const samples = [{ id: 'b' } as any]
    setPatternSamplesByName('SBI', samples)

    expect(setSpy).toHaveBeenCalledWith(
      MMKV_KEYS.PATTERNS.DISCOVERY_SAMPLES_V1,
      JSON.stringify({ ...existing, SBI: samples })
    )
  })

  it('resets map on invalid JSON and writes new entry', () => {
    jest.spyOn(storage, 'getString').mockReturnValueOnce('{invalid json')
    const setSpy = jest.spyOn(storage, 'set').mockImplementation(() => {})

    const samples = [{ id: 'z' } as any]
    setPatternSamplesByName('AXIS', samples)

    expect(setSpy).toHaveBeenCalledWith(MMKV_KEYS.PATTERNS.DISCOVERY_SAMPLES_V1, JSON.stringify({ AXIS: samples }))
  })
})
