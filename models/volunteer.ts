export default class Volunteer {
    name: string;
    servePerMonth: number;
    serviceTime: string;
    weekends: string[];

    constructor(name: string, servicePerMonth: number, serviceTime: string, weekends: string[]) {
        this.name = name;
        this.servePerMonth = servicePerMonth;
        this.serviceTime = serviceTime;
        this.weekends = weekends;
    }
}