"use client";
import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import toast, { Toaster } from "react-hot-toast";
import { getUser } from "@/controllers/getUser";
import { getUserData, updateUserSettings } from "@/controllers/firestore";
import { getIDFromLink, getSundaysForMonth, Months, monthStrings } from "@/controllers/utilities";
import { processRowData } from "@/controllers/data";
import Volunteer from "@/models/volunteer";
import VariableSelect from "@/components/variableSelect";
import "react-tabs/style/react-tabs.css";

export default function LogIn() {
    const currentUser = getUser();
    const [loaded, SetLoaded] = React.useState<boolean>(false);
    const [sheetLink, SetSheetLink] = React.useState<string>("");
    const [headers, SetHeaders] = React.useState<string[]>([]);
    const [rows, SetRows] = React.useState<GoogleSpreadsheetRow<Record<string, any>>[]>([]);
    const [volunteers, SetVolunteers] = React.useState<Volunteer[]>([]);
    const nameRef = React.createRef<HTMLSelectElement>();
    const weekendsServingRef = React.createRef<HTMLSelectElement>();
    const serviceTimeRef = React.createRef<HTMLSelectElement>();
    const serveTimesRef = React.createRef<HTMLSelectElement>();
    const [matchingsDefined, SetMatchingsDefined] = React.useState<boolean>(false);
    const [days, SetDays] = React.useState<string[]>([]);


    const getVSUser = async () => {
        if (!(currentUser === undefined || currentUser === null)) {
            let u = await getUserData(currentUser.uid);
            
            // set setting options to saved values
            if (u) {
                SetSheetLink(u.sheetLink);

                let nameIndex = headers.indexOf(u.matchings.NameField||"");
                let weekendsIndex = headers.indexOf(u.matchings.WeekendsServingField||"");
                let serviceTimeIndex = headers.indexOf(u.matchings.ServiceTimeField||"");
                let serveTimesIndex = headers.indexOf(u.matchings.ServeTimesField||"");

                if (nameRef.current) {
                    nameRef.current!.selectedIndex = nameIndex+1;
                    weekendsServingRef.current!.selectedIndex = weekendsIndex+1;
                    serviceTimeRef.current!.selectedIndex = serviceTimeIndex+1;
                    serveTimesRef.current!.selectedIndex = serveTimesIndex+1;
                    console.log("Set matching options");
                }

                if (nameIndex > -1 && weekendsIndex > -1 && serveTimesIndex > -1 && serveTimesIndex > -1) {
                    SetMatchingsDefined(true);
                }
            }
        }
    }

    const updateSettings = async () => {
        let linkBox = document.getElementById("sheetLink") as HTMLInputElement;
        let name = nameRef.current!.options[nameRef.current!.selectedIndex].text;
        let weekends = weekendsServingRef.current!.options[weekendsServingRef.current!.selectedIndex].text;
        let service = serviceTimeRef.current!.options[serviceTimeRef.current!.selectedIndex].text;
        let serveTime = serveTimesRef.current!.options[serveTimesRef.current!.selectedIndex].text;
        let matchings = {
            NameField: name,
            WeekendsServingField: weekends,
            ServiceTimeField: service,
            ServeTimesField: serveTime
        }
        console.log(matchings);
        let uid = currentUser!.uid;
        if (await updateUserSettings(uid, linkBox.value, matchings)) toast.success("Updated Settings!");
        else toast.error("Failed to update settings.")
    }

    const loadSheet = async () => {
        await getVSUser();
        if (sheetLink != "" && !loaded) {
            let u = await getUserData(currentUser!.uid);
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
            await doc.loadInfo();
            const sheet = doc.sheetsByIndex[0];
            await sheet.loadHeaderRow();
            SetHeaders(sheet.headerValues);
            sheet.getRows({ limit: sheet.rowCount }).then((data) => {
                SetRows(data);
                SetVolunteers(processRowData(data, u!.matchings));
            });
            fillTable(monthStrings[new Date().getMonth()]);
        }
    }

    const fillTable = (month: string) => {
        SetDays(getSundaysForMonth(month));
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
                    {!matchingsDefined &&
                        <p>
                            Field name matchings are required. Please visit the Settings tab to define the matchings.
                        </p>
                    }
                    {matchingsDefined && <>
                        <select id = "monthSelector" className = "four columns offset-by-one column" defaultValue = {monthStrings[new Date().getMonth()]} onChange = {(ev) => {fillTable(ev.target.value)}}>
                            {
                                monthStrings.map((m, i) => <option key = {i} value = {m}>{m}</option>)
                            }
                        </select>
                        <table className = "twelve columns">
                            <thead>
                                <tr>
                                    {
                                        days.map((d, i) => <th key = {i}>{d}</th>)
                                    }
                                </tr>
                            </thead>
                        </table>
                    </>}
                </TabPanel>
                <TabPanel className = "container">
                    <h4>Settings</h4>
                    <p>
                        Use this page to configure your scheduler. Once defined, these settings should not need to be changed. <br/>
                        <u>Note:</u> When updating settings, all settings must be defined. The Update button will set the scheduler to work with the options defined at the time you click the button. <br/>
                        <u>Note:</u> Some options may not load properly here, even if they are correctly defined. Refreshing the settings manually should correct this.
                    </p>
                    <button className = "four columns offset-by-eight columns" onClick = {getVSUser}>Refresh Settings</button>

                    <h5>Google Sheet Share Link</h5>
                    <p>
                        The Google Sheet connected to your Google Form. The sheet must be shared to anyone with the link, only viewer permissions are required or recommended.
                    </p>
                    <label htmlFor = "sheetLink" className = "two columns offset-by-one column">Link</label>
                    <input type = "text" id = "sheetLink" name = "sheetLink" className = "nine columns" defaultValue = {sheetLink} onChange={e => SetSheetLink(e.target.value)}/>
                    <div className = "big spacer"/>

                    <h5>Field Name Matching</h5>
                    <p>
                        Match your google form questions to the required field attributes. <br/>
                    </p>
                    <p>
                        Matchings defined: <b>{matchingsDefined ? "Yes" : "No"}</b>
                    </p>
                    <label className = "three columns offset-by-one column">Name</label>
                    <VariableSelect name = "Name" className = "eight columns" options = {headers} ref = {nameRef}/>
                    <div className = "break"/>
                    <label className = "three columns offset-by-one column">Weekends Serving</label>
                    <VariableSelect name = "Weekends Serving" className = "eight columns" options = {headers} ref = {weekendsServingRef}/>
                    <div className = "break"/>
                    <label className = "three columns offset-by-one column">Service Time</label>
                    <VariableSelect name = "Service Time" className = "eight columns" options = {headers} ref = {serviceTimeRef}/>
                    <div className = "break"/>
                    <label className = "three columns offset-by-one column">Serve Count</label>
                    <VariableSelect name = "Serve Count" className = "eight columns" options = {headers} ref = {serveTimesRef}/>
                    <div className = "break"/>

                    <div className = "big spacer"/>
                    <button onClick = {updateSettings} className = "four columns offset-by-eight columns">Update</button>
                    <div className = "big spacer"/>
                </TabPanel>
            </Tabs>
            <Toaster/>
        </main>
    )
}
