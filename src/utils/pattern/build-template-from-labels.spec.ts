import { buildTemplateFromLabels } from './build-template-from-labels'
import { extractWithTemplate } from './extract-with-template'

describe('buildTemplateFromLabels', () => {
  const samples = [
    {
      body: 'Rs.250 debited from a/c **1234 on 15-08-25 to VPA swiggy@icici UPI Ref 987654321098. Avl Bal Rs.3,750.25',
      amount: 250,
      merchant: 'swiggy@icici',
    },
    {
      body: 'Rs.1,500.00 debited from a/c **1234 on 16-08-25 to VPA zomato@hdfc UPI Ref 123456789012. Avl Bal Rs.2,250.25',
      amount: 1500,
      merchant: 'zomato@hdfc',
    },
    {
      body: 'Rs.99 debited from a/c **1234 on 17-08-25 to VPA blinkit@ybl UPI Ref 555666777888. Avl Bal Rs.2,151.25',
      amount: 99,
      merchant: 'blinkit@ybl',
    },
  ]

  it('builds a template that reproduces every sample, including comma amounts', () => {
    const built = buildTemplateFromLabels(samples)

    expect(built).not.toBeNull()
    expect(built!.accuracy).toBe(1)
    expect(built!.template).toContain('<AMT>')
    expect(built!.template).toContain('<MERCHANT>')

    for (const sample of samples) {
      const extraction = extractWithTemplate(built!.template, sample.body)
      expect(extraction?.amount).toBe(sample.amount)
      expect(extraction?.merchantRaw).toBe(sample.merchant)
    }
  })

  it('extracts from a new message of the same template', () => {
    const built = buildTemplateFromLabels(samples)
    const fresh =
      'Rs.2,345.67 debited from a/c **1234 on 18-08-25 to VPA bigbasket@icici UPI Ref 111222333444. Avl Bal Rs.10,000.00'
    expect(extractWithTemplate(built!.template, fresh)).toEqual({
      amount: 2345.67,
      merchantRaw: 'bigbasket@icici',
    })
  })

  it('works with amount-only labels', () => {
    const built = buildTemplateFromLabels([
      { body: 'ATM withdrawal of Rs.500 from card **9876 on 15-08-25', amount: 500 },
    ])
    expect(built?.accuracy).toBe(1)
    expect(extractWithTemplate(built!.template, 'ATM withdrawal of Rs.2,000 from card **9876 on 20-08-25')).toEqual({
      amount: 2000,
    })
  })

  it('returns null for no samples', () => {
    expect(buildTemplateFromLabels([])).toBeNull()
  })
})
