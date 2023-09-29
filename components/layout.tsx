import type { ReactNode } from "react"
import Header from "./header"
import "styles/globals.scss"

type LayoutProps = {
    children: ReactNode
}

const RootLayout = ({ children }: LayoutProps) => {
    return (
        <div>
            <Header/>
            <main>
                {children}
            </main>
        </div>
    )
}

export default RootLayout;