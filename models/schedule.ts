import { monthStrings } from "@/controllers/utilities";

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
}

export const scheduleConverter = {
    toFirestore: (schedule: Schedule) => {
        return {
            schedule: {
                teams: schedule.teams,
                schedule: schedule.schedule.map(t => {return {days: Object.fromEntries(t.days), teamName: t.teamName}}),
                month: schedule.month
            }
        }
    },
    fromFirestore: (snapshot: any, options: any) => {
        const data = snapshot.data(options);
        if (data.schedule) return Schedule.fromStore(data.schedule.schedule, data.schedule.teams, data.schedule.month);
        return null;
    }
}