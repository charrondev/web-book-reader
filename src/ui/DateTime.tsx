/**
 * @author Adam Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2024 Vanilla Forums Inc.
 * @license gpl-2.0-only
 */

import { useMemo } from "react";

interface IProps {
    date: Date | string;
    className?: string;
}

export function DateTime(props: IProps) {
    const date = useMemo(() => {
        if (props.date instanceof Date) {
            return props.date;
        }
        try {
            return new Date(props.date);
        } catch (err) {
            console.error("Invalid date", props.date, err);
            return new Date("1970-01-01T00:00:00Z");
        }
    }, [props.date]);

    try {
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

        const isoDate = date.toISOString();
        return (
            <time
                className={props.className}
                dateTime={isoDate}
                title={fullDate}
            >
                {displayDate}
            </time>
        );
    } catch (err) {
        console.error("Invalid date", props.date, err);
        return <time className={props.className}>Invalid Date</time>;
    }
}
