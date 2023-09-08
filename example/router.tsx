import Router from '@nichoth/routes'
import { Login } from './pages/login.jsx'

export default function _Router ():ReturnType<Router> {
    const router = Router()

    router.addRoute('/', () => {
        return function () {
            return <div>home view</div>
        }
    })

    router.addRoute('/login', () => {
        return Login
    })

    return router
}
