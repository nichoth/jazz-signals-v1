import { Signal, signal } from '@preact/signals'
import { Bus } from '@nichoth/events'
import { CoID, CoValueImpl } from 'cojson'
import { TodoProject, ListOfTasks } from './types.js'
import Route from 'route-event'
import {
    LocalAuthState,
    ReadyStatus,
    SignedInStatus,
    localAuth
} from '../src/index.js'

export interface Invitation {
    valueID: CoID<CoValueImpl>;
    inviteSecret: `inviteSecret_z${string}`;
}

type AppState = ({
    routeEvent:ReturnType<Route>;
    setRoute:(route:string)=>void;
    next:Signal<string>;
    routeState:Signal<string>;
} & LocalAuthState)

/**
 * Create application state
 *   - Create top level app state
 *   - Create the localNode that is used throughout the application
 *
 * This sets `next` as the initial route path, because this is called first
 * when the app loads. `next` is used for the login flow. It is the URL shown
 * after you have logged in.
 *
 * @returns {AppState}
 */
export function State ():AppState & LocalAuthState {
    const route = Route()
    const state = localAuth.createState()

    const routeState = signal<string>(location.pathname + location.search)

    const appState = {
        setRoute: route.setRoute.bind(route),
        routeEvent: route,
        next: signal(location.pathname + location.search),
        routeState,
        ...state
    }

    // @ts-ignore
    window.state = appState

    return appState
}

/**
 * Create namespaced events here. The views import these events, so they
 * can emit the namespaced events.
 */
export const Events = Bus.createEvents({
    root: ['routeChange', 'logout'],
    login: ['login', 'createAccount'],
    home: ['createList'],
    main: ['createTask']
})

State.Bus = (state:ReturnType<typeof State>) => {
    const bus = new Bus(Bus.flatten(Events))

    bus.on('*', (name, data) => {
        console.log('*****', name, data)
    })

    // ---------- root component ----------------

    // @ts-ignore
    bus.on(Events.root.routeChange, ({ path, next }) => {
        state.routeState.value = path
        if (next) state.next.value = next
    })

    // @ts-ignore
    bus.on(Events.root.logout, () => {
        (state.authStatus.value as SignedInStatus).logOut()
        state.logoutCount.value++
    })

    // ---------- home page -----------------

    // @ts-ignore
    bus.on(Events.home.createList, (listName:string) => {
        // To create a new todo project, we first create a `Group`,
        // which is a scope for defining access rights (reader/writer/admin)
        // of its members, which will apply to all CoValues owned by that group.
        const projectGroup = state.localNode.value!.createGroup()

        // Then we create an empty todo project and list of tasks within
        // that group.
        const project = projectGroup.createMap<TodoProject>()
        const tasks = projectGroup.createList<ListOfTasks>()

        // We edit the todo project to initialise it.
        // Inside the `.edit` callback we can mutate a CoValue
        project.edit(_project => {
            _project.set('title', listName)
            _project.set('tasks', tasks.id)
        })

        // then set the route
        state.setRoute(`/id/${project.id}`)
    })

    // ------------- main page -------------
    // @ts-ignore
    bus.on(Events.main.createTask, ({ name, tasks }) => {
        const task = tasks.group.createMap()
        task.edit((task) => {
            task.set('text', name)
            task.set('done', false)
        })

        tasks.edit(projectTasks => {
            projectTasks.push(task.id)
        })
    })

    // ------------- login page -------------

    // @ts-ignore
    bus.on(Events.login.login, (nextPath) => {
        (state.authStatus.value as ReadyStatus).logIn()
        state.setRoute(nextPath || '/')
    })

    // @ts-ignore
    bus.on(Events.login.createAccount, async ({ username, next }) => {
        await (state.authStatus.value as ReadyStatus).signUp(username)
        state.setRoute(next || '/')
    })

    return bus
}
