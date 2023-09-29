import { useSession } from "next-auth/react"
import RootLayout from "components/layout"
import AccessDenied from "components/access-denied"

const Home = () => {
    const { status } = useSession()

    if (status != "authenticated") {
        return (
            <RootLayout>
                <AccessDenied/>
            </RootLayout>
        )
    }

    return (
        <RootLayout>
            <h3>Schedule Volunteers</h3>
            <p>
                Text
            </p>
        </RootLayout>
    )
}

export default Home