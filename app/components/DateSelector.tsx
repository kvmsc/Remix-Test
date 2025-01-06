import { useEffect, useState } from "react";
import { DateRule } from "./types";
import { Modal } from "@shopify/app-bridge-react";
import { BlockStack, Box, Button, Checkbox, DatePicker, InlineStack } from "@shopify/polaris";
import dayjs from "dayjs";

const getDate = (date: string) => {
    return dayjs(date).toDate();
}

export function DateSelector({ disabledDates, show, onSave, onClose, currentDateRule }: { disabledDates: DateRule[], show: boolean, onSave: (date: DateRule) => void, onClose: () => void, currentDateRule?: DateRule }) {
    const [startDate, setStartDate] = useState(currentDateRule?.startDate ? getDate(currentDateRule.startDate) : new Date());
    const [endDate, setEndDate] = useState(currentDateRule?.endDate ? getDate(currentDateRule.endDate) : new Date());
    const [allowRange, setAllowRange] = useState(!!currentDateRule?.endDate);

    useEffect(() => {
        setStartDate(currentDateRule?.startDate ? getDate(currentDateRule.startDate) : new Date());
        setEndDate(currentDateRule?.endDate ? getDate(currentDateRule.endDate) : new Date());
        setAllowRange(!!currentDateRule?.endDate);
    }, [currentDateRule]);

    return (<Modal open={show} onHide={onClose} id="date-selector" variant="small">
        <Box padding="300">
            <BlockStack gap="500" >
                <Checkbox
                    label="Allow range selection"
                    checked={allowRange}
                    onChange={() => setAllowRange(!allowRange)}
                />
                <DatePicker
                    selected={{
                        start: startDate,
                        end: endDate
                    }}
                    allowRange={allowRange}
                    disableDatesBefore={new Date()}
                    disableSpecificDates={disabledDates.filter(rule => rule.identifier !== currentDateRule?.identifier).flatMap(rule => {
                        if (rule.startDate && rule.endDate) {
                            let arr = [];
                            for (let i = 0; i <= dayjs(rule.endDate).diff(dayjs(rule.startDate), 'days'); i++) {
                                arr.push(dayjs(rule.startDate).add(i, 'day').toDate());
                            }
                            return arr;
                        }
                        return [getDate(rule.startDate)];
                    })}
                    month={new Date().getMonth()}
                    year={new Date().getFullYear()}
                    onChange={(data) => {
                        setStartDate(data.start);
                        setEndDate(data.end);
                    }}
                />

                <InlineStack align="end" gap="200">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={() => {
                        onSave({
                            startDate: dayjs(startDate).format("YYYY-MM-DD"),
                            endDate: allowRange ? dayjs(endDate).format("YYYY-MM-DD") : undefined,
                            identifier: dayjs(startDate).format("DD/MM/YYYY") + (allowRange ? ` - ${dayjs(endDate).format("DD/MM/YYYY")}` : "")
                        });
                    }}>Save</Button>
                </InlineStack>

            </BlockStack>
        </Box>
    </Modal>);
}
