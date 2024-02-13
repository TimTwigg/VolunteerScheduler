export type Matchings = {
    NameField: string|null,
    WeekendsServingField: string|null,
    ServiceTimeField: string|null,
    ServeTimesField: string|null,
    TeamsField: string|null,
    NotesField: string|null
}

export default class VSUser {
    uid: string;
    orgName: string;
    sheetLink: string;
    matchings: Matchings

    constructor(uid: string, orgName: string, sheetLink: string, matchings: Matchings) {
        this.uid = uid;
        this.orgName = orgName;
        this.sheetLink = sheetLink;
        this.matchings = matchings;
    }
}