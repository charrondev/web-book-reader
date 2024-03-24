/**
 * @author Adam Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2024 Vanilla Forums Inc.
 * @license gpl-2.0-only
 */

interface IProps {
    date: Date | string;
    className?: string;
}

export function DateTime(props: IProps) {
    const date = props.date instanceof Date ? props.date : new Date(props.date);
    const fullDate = date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
    });

    const displayDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <time
            className={props.className}
            dateTime={date.toISOString()}
            title={fullDate}
        >
            {displayDate}
        </time>
    );
}
