"use client";
import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";
import { getUser } from "@/controllers/getUser";
import { updateLink, getUserData } from "@/controllers/firestore";
import "react-tabs/style/react-tabs.css";
import { getIDFromLink } from "@/controllers/utilities";
import { JWT } from "google-auth-library";

export default function LogIn() {
    const currentUser = getUser();
    const [loaded, SetLoaded] = React.useState<boolean>(false);
    const [sheetLink, SetSheetLink] = React.useState<string>("");
    const [headers, SetHeaders] = React.useState<string[]>([]);
    const [rows, SetRows] = React.useState<GoogleSpreadsheetRow<Record<string, any>>[]>([]);

    const getVSUser = async () => {
        if (!(currentUser === undefined || currentUser === null)) {
            let u = await getUserData(currentUser.uid);
            if (u) {
                SetSheetLink(u.sheetLink);
            }
        }
    }

    const updateSettings = async () => {
        let linkBox = document.getElementById("sheetLink") as HTMLInputElement;
        await updateLink(currentUser!.uid, linkBox.value);
    }

    const loadSheet = async () => {
        await getVSUser();
        if (sheetLink != "" && !loaded) {
            SetLoaded(true);
            let id = getIDFromLink(sheetLink);
            const doc = new GoogleSpreadsheet(id, new JWT({
                email: process.env.NEXT_PUBLIC_CLIENT_EMAIL,
                key: process.env.NEXT_PUBLIC_CLIENT_KEY!.replace(/\\n/g, '\n'),
                scopes: [
                    "https://www.googleapis.com/auth/spreadsheets",
                    "https://www.googleapis.com/auth/drive.file"
                ]
            }));
            console.log(doc);
            await doc.loadInfo();
            const sheet = doc.sheetsByIndex[0];
            await sheet.loadHeaderRow();
            SetHeaders(sheet.headerValues);
            sheet.getRows({ limit: sheet.rowCount }).then((data) => {SetRows(data)});
        }
    }

    if (currentUser === undefined || currentUser === null) {
        return (
            <main>
                <h3>Not Logged In...</h3>
                <p>
                    Please log in to use the Volunteer Scheduler.
                </p>
            </main>
        );
    }

    loadSheet();

    return (
        <main>
            <Tabs>
                <TabList>
                    <Tab>Schedule</Tab>
                    <Tab>Settings</Tab>
                </TabList>
                <TabPanel className = "container">
                    <p>
                        {headers}
                        {rows.length}
                    </p>
                </TabPanel>
                <TabPanel className = "container">
                    <form>
                    <h5>Google Sheet Share Link</h5>
                    <p>
                        The Google Sheet connected to your Google Form. The sheet must be shared to anyone with the link, only viewer permissions are required or recommended.
                    </p>
                    <label htmlFor = "sheetLink" className = "two columns offset-by-one column">Link</label>
                    <input type = "text" id = "sheetLink" name = "sheetLink" className = "nine columns" defaultValue = {sheetLink} onChange={e => SetSheetLink(e.target.value)}/>
                    <div className = "break"/>

                    <div className = "big spacer"/>
                    <button onClick = {updateSettings} className = "four columns offset-by-eight columns">Update</button>
                    </form>
                </TabPanel>
            </Tabs>
        </main>
    )
}
