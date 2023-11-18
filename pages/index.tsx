import { useSession } from "next-auth/react"
// import { collection, getDocs } from "firebase/firestore"
import RootLayout from "components/layout"
import AccessDenied from "components/access-denied"
import { handleAddData } from "handlers/firebaseHandlers"

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
            <button onClick = {() => handleAddData()}>Insert data</button>
        </RootLayout>
    )
}

export default Home