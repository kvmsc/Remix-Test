import dayjs from "dayjs";
import { DayRule } from "./types";
import { Text } from "@shopify/polaris";
import { BlockStack } from "@shopify/polaris";
import { IndexTable } from "@shopify/polaris";
import { Card } from "@shopify/polaris";
import "./toggle.css";
import { useCallback } from "react";
// const days : DayRule[] = [{day:0, identifier: "Sunday"}, 
//     {day:1, identifier: "Monday"}, 
//     {day:2, identifier: "Tuesday"}, 
//     {day:3, identifier: "Wednesday"}, 
//     {day:4, identifier: "Thursday"}, 
//     {day:5, identifier: "Friday"}, 
//     {day:6, identifier: "Saturday"}]

// Importing days from dayjs
const days: DayRule[] = Array.from({ length: 7 }, (_, day) => ({
    day,
    disabled: false,
    identifier: dayjs().day(day).format("dddd")
}));


export function DayEditor({ disabledDays, addRule, removeRule }: { disabledDays: DayRule[], addRule: (day: DayRule) => void, removeRule: (identifier: string) => void }) {
    
    const isDisabled = useCallback((day: DayRule) => {
        return disabledDays.find((disabledDay) => disabledDay.day === day.day)?.disabled ?? false;
    }, [disabledDays])
    
    return (
        <Card>
            <BlockStack gap="200">
                <BlockStack gap="200">
                    <Text as="h2" variant="headingMd">
                        Select days
                    </Text>
                    <Text as="p" variant="bodyMd">
                        Pick the days of the week you’d like to enable or disable in the calendar.
                    </Text>
                </BlockStack>
                <IndexTable
                    resourceName={{
                        singular: "day rule",
                        plural: "day rules"
                    }}
                    itemCount={days.length}
                    headings={[
                        { title: 'Blocked day(s)' },
                        { title: 'Action' },
                    ]}
                    selectable={false}
                >
                    {days.map((day, index) => (
                        <IndexTable.Row key={day.identifier} id={day.identifier} position={index}>
                            <IndexTable.Cell>{day.identifier}</IndexTable.Cell>
                            <IndexTable.Cell>
                                <button
                                    id={`toggle-${day.identifier}`}
                                    className={`toggle-track ${!isDisabled(day) ? 'toggle-track-on' : ''}`}
                                    role='switch'
                                    type='button'
                                    onClick={() => {
                                        addRule({ ...day, disabled: !isDisabled(day) });
                                    }}
                                >
                                    <div className={`toggle ${!isDisabled(day) ? 'toggle-on' : ''}`}></div>
                                </button>
                            </IndexTable.Cell>
                        </IndexTable.Row>
                    ))}
                </IndexTable>
            </BlockStack>
        </Card>
    );
}

