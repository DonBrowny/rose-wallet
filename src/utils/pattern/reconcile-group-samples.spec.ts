import { reconcileGroupSamples } from './reconcile-group-samples'

function sample(body: string, amount: number, merchantRaw = '') {
  return { body, amount, merchantRaw }
}

describe('reconcileGroupSamples', () => {
  it('outvotes a minority wrong amount with the consensus template', () => {
    const samples = [
      sample('Rs.100.00 paid to AMAZON via UPI. Avl Bal Rs.900.00', 100, 'AMAZON'),
      sample('Rs.250.00 paid to FLIPKART via UPI. Avl Bal Rs.650.00', 250, 'FLIPKART'),
      // bootstrap mistakenly picked the balance for this one
      sample('Rs.75.00 paid to SWIGGY via UPI. Avl Bal Rs.575.00', 575, 'SWIGGY'),
    ]

    const { template, samples: reconciled } = reconcileGroupSamples(samples)

    expect(template).toContain('<AMT>')
    expect(template).toContain('<MERCHANT>')
    expect(reconciled.map((s) => s.amount)).toEqual([100, 250, 75])
    expect(reconciled.map((s) => s.merchantRaw)).toEqual(['AMAZON', 'FLIPKART', 'SWIGGY'])
  })

  it('fills a merchant the bootstrap missed from the aligned gap', () => {
    const samples = [
      sample('Rs.120.00 paid at STORE via UPI on 10-07-26. Avl Bal Rs.4,000.00', 120, 'STORE'),
      sample('Rs.240.00 paid at BAKERY via UPI on 11-07-26. Avl Bal Rs.3,760.00', 240, 'BAKERY'),
      sample('Rs.75.00 paid at 24SEVEN via UPI on 12-07-26. Avl Bal Rs.3,685.00', 75, ''),
    ]

    const { samples: reconciled } = reconcileGroupSamples(samples)

    expect(reconciled[2].merchantRaw).toBe('24SEVEN')
    expect(reconciled[2].amount).toBe(75)
  })

  it('keeps bootstrap values for a sample the winning template cannot read', () => {
    const samples = [
      sample('Rs.100.00 paid to AMAZON via UPI. Avl Bal Rs.900.00', 100, 'AMAZON'),
      sample('Rs.250.00 paid to FLIPKART via UPI. Avl Bal Rs.650.00', 250, 'FLIPKART'),
      sample('Card bill payment received towards ending 4523', 42, 'HDFC CARD'),
    ]

    const { samples: reconciled } = reconcileGroupSamples(samples)

    expect(reconciled[2]).toEqual(samples[2])
  })

  it('reproduces the single sample of a singleton group unchanged', () => {
    const samples = [sample('Rs.100.00 paid to AMAZON via UPI. Avl Bal Rs.900.00', 100, 'AMAZON')]

    const { template, samples: reconciled } = reconcileGroupSamples(samples)

    expect(template).toContain('<AMT>')
    expect(template).toContain('<MERCHANT>')
    expect(reconciled).toEqual(samples)
  })

  it('falls back to a first-sample proposal when no template reproduces any label', () => {
    const samples = [
      sample('UPI mandate executed successfully towards subscription', 999, ''),
      sample('UPI mandate executed successfully towards subscription', 888, ''),
    ]

    const { template, samples: reconciled } = reconcileGroupSamples(samples)

    expect(template).toBe('UPI mandate executed successfully towards subscription')
    expect(reconciled).toEqual(samples)
  })

  it('returns an empty template for an empty group', () => {
    expect(reconcileGroupSamples([])).toEqual({ template: '', samples: [] })
  })
})
