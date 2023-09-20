// import { Signal, signal, effect } from '@preact/signals'
import { Signal, signal } from '@preact/signals'
import { Bus } from '@nichoth/events'
import { CoID, CoValueImpl } from 'cojson'
import {
    LocalAuthState,
    ReadyStatus,
    SignedInStatus,
    localAuth
} from '../src/index.js'
import { TodoProject, ListOfTasks } from './types.js'
import {
    // consumeInviteLinkFromWindowLocation,
    parseInviteLink
} from 'jazz-browser'
import Route from 'route-event'

export interface Invitation {
    valueID: CoID<CoValueImpl>;
    inviteSecret: `inviteSecret_z${string}`;
}

/**
 * This creates the localNode that is used throughout the application
 */
export function State ():{
    routeEvent:ReturnType<Route>;
    setRoute:(route:string)=>void;
    routeState:Signal<string>;
    invitation?:Invitation;
} & LocalAuthState {
    const route = Route()
    const state = localAuth.createState(parseInviteLink(location.href))

    console.log('location', location.href)
    console.log('location', location)
    console.log('location hash', location.hash)

    // const invitation:Signal<Invitation|null> = state.invitation

    // if (location.hash) {
    //     const inv = parseInviteLink(location.href)
    //     if (inv) invitation.value = inv
    // }

    const routeState = signal<string>(location.pathname + location.search)
    // @ts-ignore
    window.state = { route: routeState, ...state }

    return {
        setRoute: route.setRoute.bind(route),
        routeEvent: route,
        routeState,
        ...state
    }
}

/**
 * Create namespaced events here. The views import these events, so they
 * can emit the namespaced events.
 */
export const Events = Bus.createEvents({
    root: ['routeChange', 'logout'],
    login: ['login'],
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
    bus.on(Events.root.routeChange, (ev) => {
        state.routeState.value = ev
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
    bus.on(Events.login.login, (data) => {
        (state.authStatus.value as ReadyStatus).logIn()
    })

    return bus
}
