import { GoogleSpreadsheetRow } from "google-spreadsheet";
import Volunteer from "@/models/volunteer";
import { Matchings } from "@/models/user";

function getMonthIndexFromRowData(weekends: string): number {
    if (!weekends) return -1;
    let month = weekends.match("[0-9]+\/[0-9]+");
    if (month) return new Date(`${month[0]}/24`).getMonth();
    else return -1;
}

export function processRowData(data: GoogleSpreadsheetRow<Record<string, any>>[], fieldNames: Matchings): Volunteer[][] {
    var vData: Volunteer[][] = [[], [], [], [], [], [], [], [], [], [], [], []];

    data.forEach(row => {
        let monthIndex = getMonthIndexFromRowData(row.get(fieldNames.WeekendsServingField!));
        if (monthIndex > -1) {
            let teams = (row.get(fieldNames.TeamsField!) as string).split(",");
            for (let i = 0; i < teams.length; i++) {
                if (teams[i].includes("Rise")) teams[i] = "Rise";
            }
            vData[monthIndex].push(new Volunteer(
                row.get(fieldNames.NameField!),
                parseInt(row.get(fieldNames.ServeTimesField!)),
                (row.get(fieldNames.ServiceTimeField!) as string).split(",").map(s => s.trim()),
                (row.get(fieldNames.WeekendsServingField!) as string).split(",").map((d, _) => new Date(`${d.match("[0-9]+\/[0-9]+")?.[0]!}/24`).toLocaleDateString("en-US", {day: "2-digit", month: "long", year: "numeric"})),
                teams,
                row.get(fieldNames.NotesField!)
            ));
        }
    });

    return vData;
}