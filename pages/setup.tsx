import type { NextApiRequest, NextApiResponse } from "next"
import RootLayout from "components/layout"
import { useSession } from "next-auth/react"
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet"
import { useState } from "react"
import "styles/setup.scss"

const SetupPage = (req: NextApiRequest, res: NextApiResponse) => {
    const session = useSession().data
    const [headers, SetHeaders] = useState([] as string[])
    const [rows, SetRows] = useState([] as GoogleSpreadsheetRow<Record<string, any>>[])
    const [loaded, SetLoaded] = useState(false)
    const [text, SetText] = useState("")

    const loadInfo = async () => {
        if (session && !loaded) {
            SetLoaded(true)
            const doc = new GoogleSpreadsheet(session.sheetID!, {token: session.token!})
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
            <h3>Source Configuration</h3>
            <p>
                {JSON.stringify(headers)}
            </p>
            <span className = "twelve columns">
                <label htmlFor = "sheetInput" className = "three columns">Google Sheet Link</label>
                <input id = "sheetInput" className = "nine columns" onChange = {(t) => {SetText(t.target.value)}}/>
            </span>
        </RootLayout>
    )
}

export default SetupPage