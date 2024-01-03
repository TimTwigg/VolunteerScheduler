import { ForwardedRef, forwardRef } from "react";

type VariableSelectProps = {
    name: string,
    options: string[],
    className?: string
}

export default forwardRef(function VariableSelect({ name, options, className } : VariableSelectProps, ref : ForwardedRef<HTMLSelectElement>) {
    return (
        <select defaultValue = "- select -" className = {className} ref = {ref}>
            <option disabled>- select -</option>
            {
                options.map((v, i) => <option key = {i}>{v}</option>)
            }
        </select>
    );
});