import type { NextApiRequest, NextApiResponse } from "next"
import RootLayout from "components/layout"
import { useSession } from "next-auth/react"
import { Session } from "next-auth"
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet"
import { useState } from "react"

const SourcePage = (req: NextApiRequest, res: NextApiResponse) => {
    const session = useSession().data! as Session & {token: string, sheetID: string}
    const [headers, SetHeaders] = useState({} as string[])
    const [rows, SetRows] = useState({} as GoogleSpreadsheetRow<Record<string, any>>[])
    const [loaded, SetLoaded] = useState(false)

    const loadInfo = async () => {
        if (session && !loaded) {
            SetLoaded(true)
            const doc = new GoogleSpreadsheet(session.sheetID, {token: session.token})
            await doc.loadInfo()
            const sheet = doc.sheetsByIndex[0]
            await sheet.loadHeaderRow()
            SetHeaders(sheet.headerValues)
            sheet.getRows({ limit: sheet.rowCount }).then((data) => {SetRows(data)})
        }
    }
    loadInfo()

    return (
        <RootLayout>
            <h2>Choose Source</h2>
            <p>
                {JSON.stringify(headers)}
            </p>
        </RootLayout>
    )
}

export default SourcePage