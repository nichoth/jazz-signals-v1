import { signal } from '@preact/signals'
import { Bus } from '@nichoth/events'
import { Home } from './pages/home.jsx'
import { TodoApp } from './todo-app.jsx'
import {
    localAuth,
    AuthStatus,
    SignedInStatus
} from '../src/index.js'

export function State () {
    const state = localAuth.createState()
    const routeState = signal<string>(location.pathname + location.search)
    return { route: routeState, ...state }
}

// const routeState = useSignal<string>(location.pathname + location.search)
// const currentProjectId = useSignal<string>('')

State.Bus = (state:ReturnType<typeof State>) => {
    const bus = new Bus('todos')

    bus.on('*', (name, data) => {
        console.log('*****', name, data)
    })

    bus.on(TodoApp.Events.routeChange, (newPath:string) => {
        state.route.value = newPath
    })

    bus.on(Home.Events.createList, (data) => {
        console.log('create list', data)
    })

    return bus
}
