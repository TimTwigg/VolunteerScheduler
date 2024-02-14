export function getIDFromLink(link: string|undefined): string {
    if (!link) return "";
    let pieces = link.split("/");
    if (pieces.length < 6) return "";
    return pieces[5];
}

export type Months = string;
export const Months = {
    January: <any>"January",
    February: <any>"February",
    March: <any>"March",
    April: <any>"April",
    May: <any>"May",
    June: <any>"June",
    July: <any>"July",
    August: <any>"August",
    September: <any>"September",
    October: <any>"October",
    November: <any>"November",
    December: <any>"December"
}

export const monthStrings = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]

export function getSundaysForMonth(month: Months): string[] {
    let sundays: string[] = [];
    let y = new Date().getFullYear();
    let m = monthStrings.indexOf(month.valueOf());
    let s1: number = 1;

    for (s1; s1 <= 7; ++s1) {
        let d = new Date(y, m, s1);
        if (d.getDay() == 0) break;
    }

    let d = new Date(y, m, s1);
    while (d.getMonth() == m) {
        sundays.push(d.toLocaleDateString("en-US", {day: "2-digit", month: "long", year: "numeric"}))
        d.setDate(d.getDate() + 7);
    }

    return sundays;
}