import Volunteer from "@/models/volunteer";
import { monthStrings } from "@/controllers/utilities";

type VolunteerSelectProps = {
    volunteers: Volunteer[][],
    day: string,
    team: string,
    time: string,
    month: string,
    className?: string,
    onChange: (name: string) => void,
    onFocus: (name: string) => void
}

export default function VolunteerSelect({ volunteers, day, team, time, month, className, onChange, onFocus } : VolunteerSelectProps) {
    if (volunteers.length < 1) return null;

    var defValue: string = "None";
    let selectedVol = volunteers[monthStrings.indexOf(month)].filter(v => v.isScheduled(day, time, team));
    if (selectedVol.length > 0) {
        defValue = selectedVol[0].name
    }
    return (
        <select defaultValue = {defValue} className = {"volunteerSelect " + className} onChange = {ev => {onChange(ev.target.value)}} onFocus = {ev => {onFocus(ev.target.value)}}>
            <option value = "None">None</option>
            {
                volunteers[monthStrings.indexOf(month)].filter((v) => v.willServe(team, day, time)).map((v, i) => <option key = {i} value = {v.name} disabled = {!v.couldServe(day, time)}>{v.name}</option>)
            }
        </select>
    );
};