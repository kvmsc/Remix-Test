import { BlockStack, Box, Button, IndexTable, InlineGrid, InlineStack, EmptyState, Text } from "@shopify/polaris";
import { Card } from "@shopify/polaris";
import { DateRule } from "./types";
import { PlusIcon, DeleteIcon, EditIcon } from "@shopify/polaris-icons";
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import { DateSelector } from "./DateSelector";
import "./adjustment.css";


export function DateEditor({ disabledDates, addRule, removeRule }: { disabledDates: DateRule[], addRule: (date: DateRule) => void, removeRule: (identifier: string) => void }) {
    const [openCalendar, setOpenCalendar] = useState(false);
    const [openDeleteWarning, setOpenDeleteWarning] = useState(false);
    const [currentDateRule, setCurrentDateRule] = useState<DateRule | undefined>(undefined);

    return (<>
        <Card>
            <BlockStack gap="200">
                <InlineGrid columns={["twoThirds", "oneThird"]} gap="200">
                    <BlockStack gap="200">
                        <Text as="h2" variant="headingMd">
                            Select dates
                        </Text>
                        <Text as="p" variant="bodyMd">
                            Pick the dates you’d like to disable in the calendar
                        </Text>
                    </BlockStack>
                    <BlockStack gap="200" align="start" >
                        <Button icon={PlusIcon} onClick={() => {
                            setCurrentDateRule(undefined);
                            setOpenCalendar(true);
                        }}>
                            Add date/range
                        </Button>
                    </BlockStack>

                </InlineGrid>
                <IndexTable
                    resourceName={{
                        singular: "date rule",
                        plural: "date rules"
                    }}
                    itemCount={disabledDates.length}
                    headings={[
                        { title: 'Blocked date(s)' },
                        { title: 'Actions' },
                    ]}
                    selectable={false}
                    emptyState={<EmptyState
                        heading="No dates/ranges added"
                        action={{
                            content: "Add date/range",
                            onAction: () => {
                                setCurrentDateRule(undefined);
                                setOpenCalendar(true);
                            }
                        }}
                        image={"https://cdn.shopify.com/s/files/1/0582/0386/5152/files/Calendar_685d5d27-965e-4979-9fc3-d4ae87de7c50.png?v=1736148460"}
                    />}
                >
                    {disabledDates.map((date, index) => (
                        <IndexTable.Row key={date.identifier} id={date.identifier} position={index}>
                            <IndexTable.Cell>{date.identifier}</IndexTable.Cell>
                            <IndexTable.Cell>
                                <Button icon={EditIcon} onClick={() => {
                                    setCurrentDateRule(date);
                                    setOpenCalendar(true);
                                }} />
                                <Button icon={DeleteIcon} onClick={() => {
                                    setCurrentDateRule(date);
                                    setOpenDeleteWarning(true);
                                }} />
                            </IndexTable.Cell>
                        </IndexTable.Row>
                    ))}
                </IndexTable>
            </BlockStack>
        </Card>
        <DateSelector
            show={openCalendar}
            disabledDates={disabledDates}
            onSave={(rule) => {
                currentDateRule ? removeRule(currentDateRule.identifier) : null;
                addRule(rule);
                setCurrentDateRule(undefined);
                setOpenCalendar(false);
            }}
            onClose={() => {
                setCurrentDateRule(undefined);
                setOpenCalendar(false);
            }}
            currentDateRule={currentDateRule}
        />
        <Modal open={openDeleteWarning} onHide={() => {
            setOpenDeleteWarning(false);
            setCurrentDateRule(undefined);
        }} variant="small">
            <TitleBar title="Are you sure?"/>
            <Box padding="300">
                <BlockStack gap="200">
                    <Text as="p" variant="bodyMd">
                        By clicking on “Yes”, you will remove the selected date/range.
                    </Text>
                </BlockStack>
                <InlineStack align="end" gap="200">
                    <Button onClick={() => {
                        setOpenDeleteWarning(false);
                        setCurrentDateRule(undefined);
                    }}>Cancel</Button>
                    <Button variant="primary" onClick={() => {
                        removeRule(currentDateRule?.identifier || "");
                        setOpenDeleteWarning(false);
                        setCurrentDateRule(undefined);
                    }}>Yes</Button>
                </InlineStack>
            </Box>
        </Modal>
    </>);
}
