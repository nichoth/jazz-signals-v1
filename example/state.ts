import { signal } from '@preact/signals'
import { Bus, NamespacedEvents } from '@nichoth/events'
import { CoID, CoValueImpl } from 'cojson'
import { TodoProject, ListOfTasks } from './types.js'
import Route from 'route-event'
import { ReadyStatus, SignedInStatus, localAuth } from '../src/index.js'

/**
 * This creates the localNode that is used throughout the application
 */
export function State () {
    const route = Route()
    const state = localAuth.createState()
    const routeState = signal<string>(location.pathname + location.search)
    // @ts-ignore
    window.state = { route: routeState, ...state }

    return {
        setRoute: route.setRoute.bind(route),
        routeEvent: route,
        route: routeState,
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

console.log('events', Events)

State.Bus = (state:ReturnType<typeof State>) => {
    const bus = new Bus(Bus.flatten(Events))

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

        navigateToProjectId(project.id, state.setRoute)
    })

    // ------------- main page -------------
    // @ts-ignore
    bus.on(Events.main.createTask, ({ name, tasks }) => {
        console.log('**got a new task**', name, tasks)
        // console.log('**tasks in here**', tasksSignal.value)
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
        console.log('**got login request**', data);
        (state.authStatus.value as ReadyStatus).logIn()
    })

    return bus
}

function navigateToProjectId (id:CoID<CoValueImpl> | undefined, setRoute) {
    setRoute(`/id/${id}`)
}
