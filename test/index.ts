import { effect } from '@preact/signals'
import { test } from '@socketsupply/tapzero'
import {
    LocalAuthState,
    ReadyStatus,
    localAuth
} from '../src/index.js'

let state:LocalAuthState
test('localAuth.createState', t => {
    state = localAuth.createState()
    t.ok(state, 'should create state')
    t.ok(state.authStatus, 'has authStatus')
    t.ok(state.localNode, 'has localNode')
    t.ok(state.logoutCount, 'has logoutCount')
})

test('localAuth', t => {
    const done = localAuth('tester', undefined, state)
    t.equal(typeof done, 'function', 'should return a function')
})

test('login', async t => {
    effect(async () => {
        console.log('**status**', state.authStatus.value)

        // if (state.authStatus.value.status === null) return
        if (state.authStatus.value.status === 'ready') {
            console.log('**auth value**', state.authStatus.value)
            await (state.authStatus.value as ReadyStatus).signUp('test-user')
            console.log('new state...', state.authStatus.value)
            t.equal(state.authStatus.value.status, 'signedIn')
        }

        console.log('down here')
    })

    await sleep(1000)
    return await (state.authStatus.value as ReadyStatus).signUp('test-user')
})

/**
 * Sleeps for `ms` milliseconds.
 * @param {number} ms
 * @return {Promise}
 */
async function sleep (ms?:number) {
    return new Promise((resolve) => {
        if (!ms) {
            setTimeout(resolve, 0)
        } else {
            setTimeout(resolve, ms)
        }
    })
}
