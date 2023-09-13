import { signal } from '@preact/signals'
import { Bus, NamespacedEvents } from '@nichoth/events'
import { Events as TodoEvents } from './todo-events.js'
import { Login } from './pages/login.jsx'
import { localAuth } from '../src/index.js'

export function State () {
    const state = localAuth.createState()
    const routeState = signal<string>(location.pathname + location.search)
    // @ts-ignore
    window.state = { route: routeState, ...state }
    return { route: routeState, ...state }
}

export const Events = Bus.createEvents({
    root: TodoEvents,
    login: Login.Events
})

State.Bus = (state:ReturnType<typeof State>) => {
    const bus = new Bus()

    bus.on('*', (name, data) => {
        console.log('*****', name, data)
    })

    bus.on((Events.root as NamespacedEvents).routeChange as string, (ev) => {
        state.route.value = ev
    })

    // bus.on(events.root.createList, (data) => {
    //     console.log('create list', data)
    // })

    // ------- login page ---------

    bus.on(((Events.login as NamespacedEvents).login as string), (data) => {
        console.log('got login request', data)
    })

    return bus
}
