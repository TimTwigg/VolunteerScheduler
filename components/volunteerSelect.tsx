import Volunteer from "@/models/volunteer";
import { monthStrings } from "@/controllers/utilities";

type VolunteerSelectProps = {
    volunteers: Volunteer[][],
    day: string,
    team: string,
    time: string,
    id: number,
    month: string,
    className?: string,
    onChange: (name: string) => void,
    onFocus: (name: string) => void
}

export default function VolunteerSelect({ volunteers, day, team, time, id, month, className, onChange, onFocus } : VolunteerSelectProps) {
    if (volunteers.length < 1) return null;

    var defValue: string = "None";
    let selectedVol = volunteers[monthStrings.indexOf(month)].filter(v => v.isScheduled(day, time, team));
    if (selectedVol.length > id) {
        defValue = selectedVol[id].name
    }
    return (
        <select defaultValue = {defValue} className = {"volunteerSelect " + className} onChange = {ev => {onChange(ev.target.value)}} onFocus = {ev => {onFocus(ev.target.value),ev.target.blur()}}>
            <option value = "None">None</option>
            {
                volunteers[monthStrings.indexOf(month)].filter((v) => v.willServe(team, day, time)).map((v, i) => <option key = {i} value = {v.name} disabled = {!v.couldServe(day, time)}>{v.name}</option>)
            }
        </select>
    );
};