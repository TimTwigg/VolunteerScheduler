import React from "react";

type ManualInputProps = {
    className?: string,
    team: string,
    day: string,
    time: string,
    month: string,
    assignments: string[],
    forceUpdate: () => void,
    handleAdd: (name: [string, string, string, string, string]) => void,
    handleRemove: (name: [string, string, string, string, string]) => void
}

type ManualNameProps = {
    name: string,
    onClick: (name: string) => void
}

function ManualName({ name, onClick } : ManualNameProps) {
    return (
        <span className = "twelve columns manualName">
            <span className = "eight columns">{name}</span>
            <button className = "two columns offset-by-two columns plain" onClick = {() => onClick(name)}>X</button>
        </span>
    );
}

export default function ManualInput({ team, day, time, month, assignments, forceUpdate, handleAdd, handleRemove } : ManualInputProps) {
    const [names, SetNames] = React.useState<string[]>([]);
    const textRef = React.createRef<HTMLInputElement>();
    const [rendered, SetRendered] = React.useState<Boolean>(false);

    const loadAssignments = () => {
        let temp: string[] = [];
        assignments.forEach(s => {
            let entry = s.split(",");
            if (entry[0] == month && `${entry[1]},${entry[2]}` == day && entry[3] == team && entry[4] == time) temp.push(entry[5]);
        });
        SetNames(temp);
    }

    const addName = (name: string) => {
        names.push(name);
        textRef.current!.value = "";
        handleAdd([month, day, team, time, name]);
        forceUpdate();
    }

    const removeName = (name: string) => {
        names.splice(names.indexOf(name), 1);
        handleRemove([month, day, team, time, name]);
        forceUpdate();
    }

    if (!rendered) {
        SetRendered(true);
        loadAssignments();
    }

    return (
        <>
            {names.map((n, i) => <ManualName key = {i} name = {n} onClick = {removeName}/>)}
            <span className = "twelve columns manualInput">
                <input type = "text" className = "eight columns" ref = {textRef}/>
                <button className = "three columns offset-by-one columns" onClick = {() => addName(textRef.current!.value)}>Add</button>
            </span>
        </>
    );
}