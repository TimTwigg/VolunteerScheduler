import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import RootLayout from "components/layout"
import AccessDenied from "components/access-denied"

const Home = () => {
    const { data: session } = useSession()
    const [ content, SetContent ] = useState()

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch("/api/protected")
            const json = await res.json()
            if (json.content) {
                SetContent(json.content)
            }
        }
        fetchData()
    }, [session])

    if (!session) {
        return (
            <RootLayout>
                <AccessDenied/>
            </RootLayout>
        )
    }

    return (
        <RootLayout>
            <h1>Content</h1>
            <p>
                {content ?? "\u00a0"}
            </p>
        </RootLayout>
    )
}

export default Home