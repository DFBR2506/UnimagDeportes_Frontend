import assert from 'node:assert/strict'
import test from 'node:test'
import { client } from './helpers.js'

test('solo el valor exacto true activa la demostración', async (t) => {
  for (const value of [undefined, '', 'false', 'TRUE', '1', 'true']) {
    await t.test(String(value), async (t) => {
      const { load } = await client(t, value)
      assert.equal((await load('lib/config.js')).DEMO_ENABLED, value === 'true')
    })
  }
})
