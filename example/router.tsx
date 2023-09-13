import Router from '@nichoth/routes'
import { Login } from './pages/login.jsx'
import { MainView } from './pages/main.jsx'
import { Home } from './pages/home.jsx'

export default function _Router ():ReturnType<Router> {
    const router = Router()

    router.addRoute('/', (_, emit) => {
        // should show
        // - a list of lists
        //  (a list of your various todo lists)
        // - controls to create a new list
        return (props) => {
            return Home({ ...props, emit })
        }
    })

    router.addRoute('/login', (_, emit) => {
        return (props) => {
            return Login({ ...props, emit })
        }
    })

    /**
     * Need to check if there is a project ID.
     * If so, then show the app
     */
    router.addRoute('/id/:id', (_, emit) => {
        return (props) => {
            return MainView({ ...props, emit })
        }
    })

    return router
}
