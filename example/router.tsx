import Router from '@nichoth/routes'
import { Login } from './pages/login.jsx'
import { MainView } from './pages/main.jsx'
import { Home } from './pages/home.jsx'

export default function _Router ():ReturnType<Router> {
    const router = Router()

    router.addRoute('/', (_, emit) => {
        return (props) => {
            return Home({ ...props, emit })
        }
    })

    router.addRoute('/login', (_, emit) => {
        return (props) => {
            return Login({ ...props, emit })
        }
    })

    router.addRoute('/id/:id', (match, emit) => {
        return (props) => {
            return MainView({ ...props, emit, params: match.params })
        }
    })

    return router
}
