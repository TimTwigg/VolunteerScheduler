import { GoogleSpreadsheetRow } from "google-spreadsheet";
import Volunteer from "@/models/volunteer";
import { Matchings } from "@/models/user";

export function processRowData(data: GoogleSpreadsheetRow<Record<string, any>>[], fieldNames: Matchings): Volunteer[] {
    var vData: Volunteer[] = [];

    data.forEach(row => {
        vData.push(new Volunteer(
            row.get(fieldNames.NameField!),
            parseInt(row.get(fieldNames.ServeTimesField!)),
            row.get(fieldNames.ServiceTimeField!),
            (row.get(fieldNames.WeekendsServingField!) as string).split(",")
        ));
    });

    return vData;
}