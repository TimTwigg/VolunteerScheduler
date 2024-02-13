import React from "react";

type ViewBarProps = {
    names: string[],
    manualNames: string[],
    team: string,
    day: string,
    time: string,
    month: string,
}

export default function ViewBar({ names, manualNames, team, day, time, month }: ViewBarProps) {
    const [list, SetList] = React.useState<string[]>([]);
    const [rendered, SetRendered] = React.useState<Boolean>(false);
    const theNames = names;

    const parseManual = () => {
        SetList([]);
        let temp = Array.from(names);
        manualNames.forEach(s => {
            let entry = s.split(",");
            if (entry[0] == month && `${entry[1]},${entry[2]}` == day && entry[3] == team && entry[4] == time) temp.push(entry[5]);
        });
        SetList(temp);
    }

    if (!rendered) {
        SetRendered(true);
        parseManual();
    }

    return (<>
        {
            list.map((n, i) => <span key = {i} className = "twelve columns">{n}</span>)
        }
    </>);
}