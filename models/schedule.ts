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
        t.days = data.days;
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

    constructor(teams: string[], dates: string[]) {
        this.schedule = [];
        this.teams = teams;
        for (let i = 0; i < teams.length; ++i) {
            this.schedule.push(new Team(teams[i], dates));
        }
    }

    static fromStore(schedule: {teamName: string, days: Map<string, string[]>}[], teams: string[]) {
        let s = new Schedule(teams, []);
        s.schedule = schedule.map(t => Team.fromStore(t));
        return s;
    }

    scheduleVolunteer(team: string, date: string, name: string) {
        this.schedule[this.teams.indexOf(team)].schedule(date, name);
    }

    unscheduleVolunteer(team: string, date: string, name: string) {
        this.schedule[this.teams.indexOf(team)].unschedule(date, name);
    }
}

export const scheduleConverter = {
    toFirestore: (schedule: Schedule) => {
        return {
            schedule: {
                teams: schedule.teams,
                schedule: schedule.schedule.map(t => {return {days: t.days, teamName: t.teamName}}) as object
            }
        }
    },
    fromFirestore: (snapshot: any, options: any) => {
        const data = snapshot.data(options);
        return Schedule.fromStore(data.schedule.schedule, data.schedule.teams);
    }
}