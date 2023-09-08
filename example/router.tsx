import Router from '@nichoth/routes'
import { Login } from './pages/login.jsx'
import { MainView } from './pages/main.jsx'
import { Home } from './pages/home.jsx'

export default function _Router ():ReturnType<Router> {
    const router = Router()

    router.addRoute('/', () => {
        // should show
        // - a list of lists
        //  (a list of your various todo lists)
        // - controls to create a new list
        return Home
    })

    router.addRoute('/login', () => {
        return Login
    })

    /**
     * Need to check if there is a project ID
     * If so, then show the app
     */
    router.addRoute('/id/:id', () => {
        return MainView
    })

    return router
}
