"use client";
import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import toast, { Toaster } from "react-hot-toast";
import { getUser } from "@/controllers/getUser";
import { getUserData, updateUserSettings, saveSchedule, loadSchedule, saveManualAssignments, loadManualAssignments } from "@/controllers/firestore";
import { getIDFromLink, getSundaysForMonth, monthStrings } from "@/controllers/utilities";
import { processRowData } from "@/controllers/data";
import Volunteer from "@/models/volunteer";
import VariableSelect from "@/components/variableSelect";
import VolunteerSelect from "@/components/volunteerSelect";
import "react-tabs/style/react-tabs.css";
import { Schedule } from "@/models/schedule";
import ManualInput from "@/components/manualInput";
import ViewBar from "@/components/viewBar";

export default function Home() {
    const currentUser = getUser();
    const [tabIndex, SetTabIndex] = React.useState<number>(0);
    const [loaded, SetLoaded] = React.useState<boolean>(false);
    const [sheetLink, SetSheetLink] = React.useState<string>("");
    const [headers, SetHeaders] = React.useState<string[]>([]);
    const [volunteers, SetVolunteers] = React.useState<Volunteer[][]>([]);
    const nameRef = React.createRef<HTMLSelectElement>();
    const weekendsServingRef = React.createRef<HTMLSelectElement>();
    const serviceTimeRef = React.createRef<HTMLSelectElement>();
    const serveTimesRef = React.createRef<HTMLSelectElement>();
    const teamsRef = React.createRef<HTMLSelectElement>();
    const notesRef = React.createRef<HTMLSelectElement>();
    const [matchingsDefined, SetMatchingsDefined] = React.useState<boolean>(false);
    const [days, SetDays] = React.useState<string[]>([]);
    const [prev, SetPrev] = React.useState<string>("");
    const [_, updateState] = React.useState<object>({});
    const forceUpdate = React.useCallback(() => updateState({}), []);
    const [month, SetMonth] = React.useState<string>(monthStrings[new Date().getMonth()]);
    const [vNotes, SetVNotes] = React.useState<[string, string][]>([]);
    const [schedules, SetSchedules] = React.useState<Schedule[]>([]);
    const [manualAssignments, SetManualAssignments] = React.useState<string[]>([]);

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
                let teamsIndex = headers.indexOf(u.matchings.TeamsField||"");
                let notesIndex = headers.indexOf(u.matchings.NotesField||"");

                if (nameRef.current) {
                    nameRef.current!.selectedIndex = nameIndex+1;
                    weekendsServingRef.current!.selectedIndex = weekendsIndex+1;
                    serviceTimeRef.current!.selectedIndex = serviceTimeIndex+1;
                    serveTimesRef.current!.selectedIndex = serveTimesIndex+1;
                    teamsRef.current!.selectedIndex = teamsIndex+1;
                    notesRef.current!.selectedIndex = notesIndex+1;
                }

                if (nameIndex > -1 && weekendsIndex > -1 && serveTimesIndex > -1 && serveTimesIndex > -1 && teamsIndex > -1 && notesIndex > -1) {
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
        let teams = teamsRef.current!.options[teamsRef.current!.selectedIndex].text;
        let notes = notesRef.current!.options[notesRef.current!.selectedIndex].text;
        let matchings = {
            NameField: name,
            WeekendsServingField: weekends,
            ServiceTimeField: service,
            ServeTimesField: serveTime,
            TeamsField: teams,
            NotesField: notes
        }
        let uid = currentUser!.uid;
        if (await updateUserSettings(uid, linkBox.value, matchings)) toast.success("Updated Settings!");
        else toast.error("Failed to update settings.")
    }

    const mergeScheduleWithVolunteers = (v: Volunteer[][], s: Schedule) => {
        let vols = v[s.month];
        let all = s.getAllScheduled();
        for (let i = 0; i < all.length; ++i) {
            let entry = all[i];
            let name = entry[0];
            let date = entry[1];
            let pieces = entry[2].split(" ");
            let team = pieces[0];
            let time = pieces[1];
            for (const v of vols) {
                if (v.name == name) {
                    v.schedule(date, time, team);
                }
            }
        }
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

            let s = await loadSchedule(currentUser!.uid);
            let nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
            if (s.length < 12) {
                for (let sch of s) {
                    nums = nums.splice(nums.indexOf(sch.month), 1);
                }
                for (let n of nums) {
                    let m = monthStrings[n];
                    s.push(new Schedule(["Check-In Team 9am", "Elementary 9am", "Check-In Team 11am", "Elementary 11am", "Rise 11am"], getSundaysForMonth(m), m));
                }
            }
            s.sort((a, b) => a.month - b.month);
            SetSchedules(s);

            SetManualAssignments(await loadManualAssignments(currentUser!.uid));

            sheet.getRows({ limit: sheet.rowCount }).then((data) => {
                let vs = processRowData(data, u!.matchings);
                let index = monthStrings.indexOf(month);
                mergeScheduleWithVolunteers(vs, s[index]);
                SetVolunteers(vs);
                let noteVolunteers = vs[monthStrings.indexOf(month)].filter(v => v.notes);
                SetVNotes(noteVolunteers.map(v => [v.name, v.notes!] as [string, string]));
            });
            fillTable(monthStrings[new Date().getMonth()], 0);
        }
    }

    const fillTable = (month: string, tab: number) => {
        SetDays(getSundaysForMonth(month));
        SetMonth(month);
        SetTabIndex(3);
        setTimeout(() => SetTabIndex(tab), 1);
        let noteVolunteers = volunteers[monthStrings.indexOf(month)]?.filter(v => v.notes);
        if (noteVolunteers) SetVNotes(noteVolunteers.map(v => [v.name, v.notes!] as [string, string]));
    }

    const handleTabChange = (index: number): boolean => {
        if (index == 1) getVSUser();
        SetTabIndex(index);
        return true;
    }

    // assignment is [month, date, team, name]
    const handleAddManualAssignment = (assignment: [string, string, string, string, string]) => {
        let temp = manualAssignments;
        temp.push(assignment.join());
        SetManualAssignments(temp);
        saveManualAssignments(currentUser!.uid, manualAssignments);
    }

    // assignment is [month, date, team, name]
    const handleRemoveManualAssignment = (assignment: [string, string, string, string, string]) => {
        let temp = manualAssignments;
        temp.splice(temp.indexOf(assignment.join()), 1);
        SetManualAssignments(temp);
        saveManualAssignments(currentUser!.uid, manualAssignments);
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

    const scheduleVolunteers = async (name: string, day: string, time: string, team: string) => {
        let oldV = volunteers[monthStrings.indexOf(month)].filter(v => v.name == prev);
        if (oldV.length > 0) {
            oldV[0].unschedule(day, time, team);
            schedules[monthStrings.indexOf(month)]!.unscheduleVolunteer(`${team} ${time}`, day, oldV[0].name);
        }
        let newV = volunteers[monthStrings.indexOf(month)].filter(v => v.name == name);
        if (newV.length > 0) {
            newV[0].schedule(day, time, team);
            schedules[monthStrings.indexOf(month)]!.scheduleVolunteer(`${team} ${time}`, day, name);
        }
        await saveSchedule(currentUser.uid, schedules);
    }

    const exportData = () => {
        let data = schedules[monthStrings.indexOf(month)].export()!;
        let sundays = getSundaysForMonth(month).map(s => s.replace(",", ""));
        for (let assign of manualAssignments) {
            let entry = assign.split(",");
            if (entry[0] != month) continue;
            let day = `${entry[1]}${entry[2]}`;
            let index = schedules[monthStrings.indexOf(month)]!.teams.indexOf(`${entry[3]} ${entry[4]}`) + 1;
            let dayIndex = sundays.indexOf(day) + 1;
            let old = data[index][dayIndex];
            if (old.length > 0) data[index][dayIndex] = `${data[index][dayIndex]} | ${entry[5]}`;
            else data[index][dayIndex] = entry[5];
        }
        let csv = new Blob([data.map(arr => arr.join(",")).join("\r\n")], { type: "text/csv;charset=utf-8;" })
        let encoded = window.URL.createObjectURL(csv);
        let link = document.createElement("a");
        link.setAttribute("href", encoded);
        link.setAttribute("download", `schedule_${month}.csv`);
        document.body.appendChild(link);
        link.click();
    }

    return (
        <main>
            <Tabs selectedIndex = {tabIndex} onSelect = {handleTabChange} >
                <TabList>
                    <Tab>Schedule</Tab>
                    <Tab>View</Tab>
                    <Tab>Settings</Tab>
                </TabList>
                <TabPanel className = "container">
                    {!matchingsDefined &&
                        <p>
                            Field name matchings are required. Please visit the Settings tab to define the matchings.
                        </p>
                    }
                    {matchingsDefined && <>
                        <select id = "monthSelector" className = "four columns offset-by-one column" value = {month} onChange = {(ev) => {fillTable(ev.target.value, 0)}}>
                            {
                                monthStrings.map((m, i) => <option key = {i} value = {m}>{m}</option>)
                            }
                        </select>
                        <button className = "three columns offset-by-four columns" onClick = {exportData}>Export</button>
                        <table className = "twelve columns">
                            <thead>
                                <tr>
                                    <th></th>
                                    {
                                        days.map((d, i) => <th key = {i}>{d}</th>)
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan = {days.length+1} className = "breakRow">9:00am</td>
                                </tr>
                                <tr>
                                    <td>Check-In Team</td>
                                    {
                                        days.map((d, i) => <td key = {i}>
                                            <VolunteerSelect volunteers = {volunteers} team = "Check-In Team" day = {d} time = "9am" id = {0} month = {month} onChange = {(name: string) => scheduleVolunteers(name, d, "9am", "Check-In Team")} onFocus = {(name: string) => {SetPrev(name),forceUpdate()}}/>
                                            <VolunteerSelect volunteers = {volunteers} team = "Check-In Team" day = {d} time = "9am" id = {1} month = {month} onChange = {(name: string) => scheduleVolunteers(name, d, "9am", "Check-In Team")} onFocus = {(name: string) => {SetPrev(name),forceUpdate()}}/>
                                            <ManualInput forceUpdate = {forceUpdate} team = "Check-In Team" day = {d} time = "9am" month = {month} assignments = {manualAssignments} handleAdd = {handleAddManualAssignment} handleRemove = {handleRemoveManualAssignment}/>
                                        </td>)
                                    }
                                </tr>
                                <tr>
                                    <td>Elementary</td>
                                    {
                                        days.map((d, i) => <td key = {i}>
                                            <VolunteerSelect volunteers = {volunteers} team = "Elementary" day = {d} time = "9am" id = {0} month = {month} onChange = {(name: string) => scheduleVolunteers(name, d, "9am", "Elementary")} onFocus = {(name: string) => {SetPrev(name),forceUpdate()}}/>
                                            <VolunteerSelect volunteers = {volunteers} team = "Elementary" day = {d} time = "9am" id = {1} month = {month} onChange = {(name: string) => scheduleVolunteers(name, d, "9am", "Elementary")} onFocus = {(name: string) => {SetPrev(name),forceUpdate()}}/>
                                            <VolunteerSelect volunteers = {volunteers} team = "Elementary" day = {d} time = "9am" id = {2} month = {month} onChange = {(name: string) => scheduleVolunteers(name, d, "9am", "Elementary")} onFocus = {(name: string) => {SetPrev(name),forceUpdate()}}/>
                                            <VolunteerSelect volunteers = {volunteers} team = "Elementary" day = {d} time = "9am" id = {3} month = {month} onChange = {(name: string) => scheduleVolunteers(name, d, "9am", "Elementary")} onFocus = {(name: string) => {SetPrev(name),forceUpdate()}}/>
                                            <VolunteerSelect volunteers = {volunteers} team = "Elementary" day = {d} time = "9am" id = {4} month = {month} onChange = {(name: string) => scheduleVolunteers(name, d, "9am", "Elementary")} onFocus = {(name: string) => {SetPrev(name),forceUpdate()}}/>
                                            <ManualInput forceUpdate = {forceUpdate} team = "Elementary" day = {d} time = "9am" month = {month} assignments = {manualAssignments} handleAdd = {handleAddManualAssignment} handleRemove = {handleRemoveManualAssignment}/>
                                        </td>)
                                    }
                                </tr>
                                <tr>
                                    <td colSpan = {days.length+1} className = "breakRow">11:00am</td>
                                </tr>
                                <tr>
                                    <td>Check-In Team</td>
                                    {
                                        days.map((d, i) => <td key = {i}>
                                            <VolunteerSelect volunteers = {volunteers} team = "Check-In Team" day = {d} time = "11am" id = {0} month = {month} onChange = {(name: string) => scheduleVolunteers(name, d, "11am", "Check-In Team")} onFocus = {(name: string) => {SetPrev(name),forceUpdate()}}/>
                                            <VolunteerSelect volunteers = {volunteers} team = "Check-In Team" day = {d} time = "11am" id = {1} month = {month} onChange = {(name: string) => scheduleVolunteers(name, d, "11am", "Check-In Team")} onFocus = {(name: string) => {SetPrev(name),forceUpdate()}}/>
                                            <ManualInput forceUpdate = {forceUpdate} team = "Check-In Team" day = {d} time = "11am" month = {month} assignments = {manualAssignments} handleAdd = {handleAddManualAssignment} handleRemove = {handleRemoveManualAssignment}/>
                                        </td>)
                                    }
                                </tr>
                                <tr>
                                    <td>Elementary</td>
                                    {
                                        days.map((d, i) => <td key = {i}>
                                            <VolunteerSelect volunteers = {volunteers} team = "Elementary" day = {d} time = "11am" id = {0} month = {month} onChange = {(name: string) => scheduleVolunteers(name, d, "11am", "Elementary")} onFocus = {(name: string) => {SetPrev(name),forceUpdate()}}/>
                                            <VolunteerSelect volunteers = {volunteers} team = "Elementary" day = {d} time = "11am" id = {1} month = {month} onChange = {(name: string) => scheduleVolunteers(name, d, "11am", "Elementary")} onFocus = {(name: string) => {SetPrev(name),forceUpdate()}}/>
                                            <VolunteerSelect volunteers = {volunteers} team = "Elementary" day = {d} time = "11am" id = {2} month = {month} onChange = {(name: string) => scheduleVolunteers(name, d, "11am", "Elementary")} onFocus = {(name: string) => {SetPrev(name),forceUpdate()}}/>
                                            <VolunteerSelect volunteers = {volunteers} team = "Elementary" day = {d} time = "11am" id = {3} month = {month} onChange = {(name: string) => scheduleVolunteers(name, d, "11am", "Elementary")} onFocus = {(name: string) => {SetPrev(name),forceUpdate()}}/>
                                            <ManualInput forceUpdate = {forceUpdate} team = "Elementary" day = {d} time = "11am" month = {month} assignments = {manualAssignments} handleAdd = {handleAddManualAssignment} handleRemove = {handleRemoveManualAssignment}/>
                                        </td>)
                                    }
                                </tr>
                                <tr>
                                    <td>Rise</td>
                                    {
                                        days.map((d, i) => <td key = {i}>
                                            <VolunteerSelect volunteers = {volunteers} team = "Rise" day = {d} time = "11am" id = {0} month = {month} onChange = {(name: string) => scheduleVolunteers(name, d, "11am", "Rise")} onFocus = {(name: string) => {SetPrev(name),forceUpdate()}}/>
                                            <VolunteerSelect volunteers = {volunteers} team = "Rise" day = {d} time = "11am" id = {1} month = {month} onChange = {(name: string) => scheduleVolunteers(name, d, "11am", "Rise")} onFocus = {(name: string) => {SetPrev(name),forceUpdate()}}/>
                                            <VolunteerSelect volunteers = {volunteers} team = "Rise" day = {d} time = "11am" id = {2} month = {month} onChange = {(name: string) => scheduleVolunteers(name, d, "11am", "Rise")} onFocus = {(name: string) => {SetPrev(name),forceUpdate()}}/>
                                            <VolunteerSelect volunteers = {volunteers} team = "Rise" day = {d} time = "11am" id = {3} month = {month} onChange = {(name: string) => scheduleVolunteers(name, d, "11am", "Rise")} onFocus = {(name: string) => {SetPrev(name),forceUpdate()}}/>
                                            <ManualInput forceUpdate = {forceUpdate} team = "Rise" day = {d} time = "11am" month = {month} assignments = {manualAssignments} handleAdd = {handleAddManualAssignment} handleRemove = {handleRemoveManualAssignment}/>
                                        </td>)
                                    }
                                </tr>
                            </tbody>
                        </table>

                            <div className = "big spacer"/>
                            <p>
                                {vNotes.map(pair => `${pair[0]}: ${pair[1]}\n`)}
                            </p>
                    
                    </>}
                </TabPanel>
                <TabPanel className = "container">
                    {matchingsDefined && <>
                        <select id = "monthSelector" className = "four columns offset-by-one column" value = {month} onChange = {(ev) => {fillTable(ev.target.value, 1)}}>
                            {
                                monthStrings.map((m, i) => <option key = {i} value = {m}>{m}</option>)
                            }
                        </select>
                        <table className = "ten columns offset-by-one column">
                            <thead>
                                <tr>
                                    <th></th>
                                    {
                                        days.map((d, i) => <th key = {i}>{d}</th>)
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan = {days.length+1} className = "breakRow">9:00am</td>
                                </tr>
                                <tr>
                                    <td>Check-In Team</td>
                                    {
                                        days.map((d, i) => <td key = {i}><ViewBar names = {schedules[monthStrings.indexOf(month)].getNamesForDate(d, "Check-In Team 9am")} manualNames = {manualAssignments} team = "Check-In Team" day = {d} time = "9am" month = {month}/></td>)
                                    }
                                </tr>
                                <tr>
                                    <td>Elementary</td>
                                    {
                                        days.map((d, i) => <td key = {i}><ViewBar names = {schedules[monthStrings.indexOf(month)].getNamesForDate(d, "Elementary 9am")} manualNames = {manualAssignments} team = "Elementary" day = {d} time = "9am" month = {month}/></td>)
                                    }
                                </tr>
                                <tr>
                                    <td colSpan = {days.length+1} className = "breakRow">11:00am</td>
                                </tr>
                                <tr>
                                    <td>Check-In Team</td>
                                    {
                                        days.map((d, i) => <td key = {i}><ViewBar names = {schedules[monthStrings.indexOf(month)].getNamesForDate(d, "Check-In Team 11am")} manualNames = {manualAssignments} team = "Check-In Team" day = {d} time = "11am" month = {month}/></td>)
                                    }
                                </tr>
                                <tr>
                                    <td>Elementary</td>
                                    {
                                        days.map((d, i) => <td key = {i}><ViewBar names = {schedules[monthStrings.indexOf(month)].getNamesForDate(d, "Elementary 11am")} manualNames = {manualAssignments} team = "Elementary" day = {d} time = "11am" month = {month}/></td>)
                                    }
                                </tr>
                                <tr>
                                    <td>Rise</td>
                                    {
                                        days.map((d, i) => <td key = {i}><ViewBar names = {schedules[monthStrings.indexOf(month)].getNamesForDate(d, "Rise 11am")} manualNames = {manualAssignments} team = "Rise" day = {d} time = "11am" month = {month}/></td>)
                                    }
                                </tr>
                            </tbody>
                        </table>
                    </>}
                </TabPanel>
                <TabPanel className = "container">
                    <h4>Settings</h4>
                    <p>
                        Use this page to configure your scheduler. Once defined, these settings should not need to be changed. <br/>
                        <u>Note:</u> When updating settings, all settings must be defined. The Update button will set the scheduler to work with the options defined at the time you click the button.
                    </p>

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
                    <label className = "three columns offset-by-one column">Name</label>
                    <VariableSelect className = "eight columns" options = {headers} ref = {nameRef}/>
                    <div className = "break"/>
                    <label className = "three columns offset-by-one column">Weekends Serving</label>
                    <VariableSelect className = "eight columns" options = {headers} ref = {weekendsServingRef}/>
                    <div className = "break"/>
                    <label className = "three columns offset-by-one column">Service Time</label>
                    <VariableSelect className = "eight columns" options = {headers} ref = {serviceTimeRef}/>
                    <div className = "break"/>
                    <label className = "three columns offset-by-one column">Serve Count</label>
                    <VariableSelect className = "eight columns" options = {headers} ref = {serveTimesRef}/>
                    <div className = "break"/>
                    <label className = "three columns offset-by-one column">Teams</label>
                    <VariableSelect className = "eight columns" options = {headers} ref = {teamsRef}/>
                    <div className = "break"/>
                    <label className = "three columns offset-by-one column">Notes</label>
                    <VariableSelect className = "eight columns" options = {headers} ref = {notesRef}/>
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
