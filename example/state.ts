import { signal } from '@preact/signals'
import { Bus, NamespacedEvents } from '@nichoth/events'
import { Events as TodoEvents } from './todo-events.js'
import { Login } from './pages/login.jsx'
import { SignedInStatus, localAuth } from '../src/index.js'

export function State () {
    const state = localAuth.createState()
    const routeState = signal<string>(location.pathname + location.search)
    // @ts-ignore
    window.state = { route: routeState, ...state }
    return { route: routeState, ...state }
}

/**
 * Create namespaced events here. The views import the events created here,
 *   so they can emit the namespaced events.
 */
export const Events = Bus.createEvents({
    root: TodoEvents,
    login: Login.Events,
    home: ['createList']
})

State.Bus = (state:ReturnType<typeof State>) => {
    const bus = new Bus()

    bus.on('*', (name, data) => {
        console.log('*****', name, data)
    })

    // ---------- root component ----------------

    bus.on((Events.root as NamespacedEvents).routeChange as string, (ev) => {
        state.route.value = ev
    })

    bus.on((Events.root as NamespacedEvents).logout as string, () => {
        console.log('got a logout event');
        (state.authStatus.value as SignedInStatus).logOut()
        state.logoutCount.value++
    })

    // ------- login page ---------

    bus.on(((Events.login as NamespacedEvents).login as string), (data) => {
        console.log('got login request', data)
    })

    return bus
}
