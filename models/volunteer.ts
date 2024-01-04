export default class Volunteer {
    name: string;
    servePerMonth: number;
    serviceTimes: string[];
    weekends: string[];
    teams: string[];
    notes?: string;
    flexibleTeams: boolean = false;
    available: boolean = true;
    scheduled: Map<string, [string, string][]> = new Map<string, [string, string][]>();
    scheduledCount: number = 0;

    constructor(name: string, servicePerMonth: number, serviceTimes: string[], weekends: string[], teams: string[], notes?: string) {
        this.name = name;
        this.servePerMonth = servicePerMonth;
        this.serviceTimes = serviceTimes;
        this.weekends = weekends;
        this.teams = teams;
        if (notes && notes.length > 1) this.notes = notes;

        weekends.forEach(w => {
            if (w.includes("None")) this.available = false;
        });
        teams.forEach(t => {
            if (t.includes("anywhere")) this.flexibleTeams = true;
        });
    }

    isScheduled(day: string, time: string, team: string): boolean {
        if (!this.scheduled.has(day)) return false;
        let arr = this.scheduled.get(day)!;
        for (let i = 0; i < arr.length; ++i) {
            if (arr[i][0] == time && arr[i][1] == team) return true;
        }
        return false;
    }

    schedule(day: string, time: string, team: string): boolean {
        if (!this.weekends.includes(day)) return false;
        if (this.scheduled.has(day)) {
            this.scheduled.set(day, this.scheduled.get(day)!.concat([[time, team]]));
        }
        else {
            this.scheduled.set(day, [[time, team]]);
        }
        ++this.scheduledCount;
        if (this.scheduledCount >= this.servePerMonth) this.available = false;
        return true;
    }

    unschedule(day: string, time: string, team: string): void {
        if (this.scheduled.has(day)) {
            let newTimes = this.scheduled.get(day)!;
            newTimes.splice(this.scheduled.get(day)!.indexOf([time, team]), 1);
            if (newTimes.length > 0) this.scheduled.set(day, newTimes);
            else this.scheduled.delete(day);
        }
        --this.scheduledCount;
        if (this.scheduledCount < this.servePerMonth) this.available = true;
    }

    willServe(team: string, day: string, time: string): boolean {
        return (this.teams.includes(team) || this.flexibleTeams) && this.weekends.includes(day) && this.serviceTimes.includes(time);
    }

    couldServe(day: string, time: string): boolean {
        if (!this.scheduled.get(day)) return this.available;
        let canServe = true;
        for (let i = 0; i < this.scheduled.get(day)!.length; ++i) {
            if (this.scheduled.get(day)![i][0] == time) canServe = false;
        }
        return this.available && canServe;
    }
}