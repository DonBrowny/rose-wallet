import { proposeSlots } from './propose-slots'

describe('proposeSlots', () => {
  it('places both placeholders', () => {
    const sms = 'Rs.250 debited from a/c **1234 to VPA swiggy@icici UPI Ref 987654321098'
    expect(proposeSlots(sms, 250, 'swiggy@icici')).toEqual({
      template: 'Rs.<AMT> debited from a/c **1234 to VPA <MERCHANT> UPI Ref 987654321098',
      amountPlaced: true,
      merchantPlaced: true,
    })
  })

  it('places comma-formatted amounts', () => {
    const sms = 'Rs.1,500.00 debited from a/c **1234 at AMAZON'
    expect(proposeSlots(sms, 1500, 'AMAZON').template).toBe('Rs.<AMT> debited from a/c **1234 at <MERCHANT>')
  })

  it('prefers the amount occurrence near a transaction verb over the balance', () => {
    const sms = 'Rs.5,000.00 debited from a/c **1234. Avl Bal Rs.5,000.00'
    const { template } = proposeSlots(sms, 5000)
    expect(template).toBe('Rs.<AMT> debited from a/c **1234. Avl Bal Rs.5,000.00')
  })

  it('matches the merchant case-insensitively', () => {
    const sms = 'Paid Rs.99 to BLINKIT via UPI'
    expect(proposeSlots(sms, 99, 'Blinkit').template).toBe('Paid Rs.<AMT> to <MERCHANT> via UPI')
  })

  it('reports when the amount cannot be located', () => {
    const result = proposeSlots('Paid Rs.99 to Blinkit', 250)
    expect(result.amountPlaced).toBe(false)
    expect(result.template).toBe('Paid Rs.99 to Blinkit')
  })

  it('ignores an Unknown merchant', () => {
    expect(proposeSlots('Paid Rs.99 to Blinkit', 99, 'Unknown').merchantPlaced).toBe(false)
  })
})
