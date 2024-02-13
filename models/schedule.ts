import { monthStrings, getSundaysForMonth } from "@/controllers/utilities";

class Team {
    days: Map<string, string[]>;
    teamName: string;

    constructor(teamName: string, dates: string[]) {
        this.days = new Map<string, string[]>();
        this.teamName = teamName;
        dates.forEach(d => this.days.set(d, []));
    }

    static fromStore(data: {teamName: string, days: Map<string, string[]>}): Team {
        let t = new Team(data.teamName, []);
        for (const [k, v] of Object.entries(data.days)) {
            t.days.set(k, v);
        }
        return t;
    }

    schedule(date: string, name: string) {
        if (!this.days.has(date)) throw Error("Invalid date matching in Schedule");
        let team = this.days.get(date)!;
        team.push(name);
        this.days.set(date, team);
    }

    unschedule(date: string, name: string) {
        if (!this.days.has(date)) throw Error("Invalid date matching in Schedule");
        let team = this.days.get(date)!;
        let index = team.indexOf(name);
        if (index != -1) team.splice(index, 1);
        this.days.set(date, team);
    }
}

export class Schedule {
    schedule: Team[];
    teams: string[];
    month: number;

    constructor(teams: string[], dates: string[], month: string) {
        this.schedule = [];
        this.teams = teams;
        for (let i = 0; i < teams.length; ++i) {
            this.schedule.push(new Team(teams[i], dates));
        }
        let monthIndex = monthStrings.indexOf(month);
        if (monthIndex == -1) throw Error("Invalid month");
        this.month = monthIndex;
    }

    static fromStore(schedule: {teamName: string, days: Map<string, string[]>}[], teams: string[], month: number) {
        let s = new Schedule(teams, [], "January");
        s.schedule = schedule.map(t => Team.fromStore(t));
        s.month = month;
        return s;
    }

    scheduleVolunteer(team: string, date: string, name: string) {
        this.schedule[this.teams.indexOf(team)].schedule(date, name);
    }

    unscheduleVolunteer(team: string, date: string, name: string) {
        this.schedule[this.teams.indexOf(team)].unschedule(date, name);
    }

    getAllScheduled() {
        let scheduled: string[][] = [];
        this.schedule.forEach(t => {
            t.days.forEach((names, date) => {
                names.forEach((n: string) => {
                    scheduled.push([n, date, t.teamName]);
                });
            });
        });
        return scheduled;
    }

    getNamesForDate(date: string, team: string) {
        return this.schedule[this.teams.indexOf(team)].days.get(date)||[];
    }

    export(): string[][] {
        let data: string[][] = [];
        let days = getSundaysForMonth(monthStrings[this.month]);
        data.push(["Team", ...days.map(s => s.replace(",", ""))]);
        this.schedule.forEach(t => {
            let sections = [];
            for (const d of days) {
                let names = t.days.get(d);
                sections.push(names!.join(" | "));
            }
            data.push([t.teamName, ...sections]);
        });
        return data;
    }
}

export const scheduleConverter = {
    toFirestore: (schedules: Schedule[]) => {
        return {
            schedule: schedules.map(s => {return {
                    teams: s.teams,
                    schedule: s.schedule.map(t => {return {days: Object.fromEntries(t.days), teamName: t.teamName}}),
                    month: s.month
                }
            })
        }
    },
    fromFirestore: (snapshot: any, options: any): Schedule[] => {
        const data = snapshot.data(options);
        if (data.schedule) return Array.from(data.schedule).map((s:any) => Schedule.fromStore(s.schedule, s.teams, s.month));
        return [];
    }
}