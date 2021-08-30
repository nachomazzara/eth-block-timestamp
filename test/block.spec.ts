import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import Block from '../lib/blocks'

chai.use(chaiAsPromised)

const expect = chai.expect

describe('Blocks', function () {
  this.timeout(Infinity)
  const blocks = new Block('https://mainnet.infura.io/v3/85bbcb55329846258cda4ad9734d2e1f')

  it('should get the first block', async function () {

    const found = await blocks.getDate('first')

    expect(found!.block).to.be.equal(1)
    expect(found!.timestamp).to.be.equal(1438269988)
  })

  it('should get a block by unix timestamp', async function () {
    const found = await blocks.getDate('1586618608')

    expect(found!.block).to.be.equal(9851782)
    expect(found!.timestamp).to.be.equal(1586618608)
  })

  it('should get a block by date', async function () {
    const found = await blocks.getDate('03/20/2020 03:10:00 AM UTC+0')

    expect(found!.block).to.be.equal(9706042)
    expect(found!.timestamp).to.be.equal(1584673800)
  })
})