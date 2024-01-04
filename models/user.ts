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
    sheetLink: string;
    matchings: Matchings

    constructor(uid: string, sheetLink: string, matchings: Matchings) {
        this.uid = uid;
        this.sheetLink = sheetLink;
        this.matchings = matchings;
    }
}