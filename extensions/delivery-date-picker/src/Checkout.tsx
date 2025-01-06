import {
  reactExtension,
  Banner,
  BlockStack,
  Checkbox,
  Text,
  useApi,
  useApplyAttributeChange,
  useInstructions,
  useTranslate,
  useBuyerJourneyIntercept,
  useApplyMetafieldsChange,
  DatePicker,
  useAttributeValues,
  useMetafield,
  Heading,
} from "@shopify/ui-extensions-react/checkout";
import { useCallback, useEffect, useState } from "react";
import { DateConfig } from "../../../app/components/types";
import dayjs from "dayjs";
import { constants } from "../../../app/constants";
// 1. Choose an extension target
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const translate = useTranslate();
  const { extension, query } = useApi();
  const instructions = useInstructions();
  const applyAttributeChange = useApplyAttributeChange();
  const attributeValues = useAttributeValues([constants.ORDER_ATTRIBUTE_KEY]);

  useEffect(() => {
    if (attributeValues.length > 0) {
      setSelectedDate(attributeValues[0]);
      console.log("mohattributeValues", attributeValues[0]);
    }
  }, []);


  const getAvailabilityRules = useCallback(async () => {
    const response: any = await query(`#graphql
      query getMetafield {
        shop {
          id
          metafield(
            namespace: "${constants.APP_NAMESPACE}"
            key: "${constants.KEY}"
          ) {
            value
          }
        }
      }`);

    const dateConfig: DateConfig = JSON.parse(response.data?.shop?.metafield?.value ?? "{}");
    return dateConfig;
  }, [])

  const validateDate = useCallback((dateStr: string, rules: DateConfig) => {
    const date = dayjs(dateStr);
    const day = date.day();
    let isDisabled = rules.disabledDays.find(rule => rule.day === day)?.disabled ?? false;
    if (!isDisabled) {
      isDisabled = rules.disabledDates.find(rule => {
        const ruleStartDate = dayjs(rule.startDate);
        if (!rule.endDate) {
          return ruleStartDate.isSame(date, "day");
        }
        const ruleEndDate = dayjs(rule.endDate);
        return ((ruleStartDate.isSame(date, "day") || ruleStartDate.isBefore(date)) && (ruleEndDate.isAfter(date) || ruleEndDate.isSame(date, "day")));
      }) ? true : false;
    }
    return !isDisabled;
  }, [])


  // 2. Check instructions for feature availability, see https://shopify.dev/docs/api/checkout-ui-extensions/apis/cart-instructions for details
  if (!instructions.attributes.canUpdateAttributes) {
    // For checkouts such as draft order invoices, cart attributes may not be allowed
    // Consider rendering a fallback UI or nothing at all, if the feature is unavailable
    return (
      <Banner title="Delivery Date Picker" status="warning">
        {translate("attributeChangesAreNotSupported")}
      </Banner>
    );
  }

  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [isValid, setIsValid] = useState<boolean>(true);
  const [availabilityRules, setAvailabilityRules] = useState<DateConfig>({ disabledDates: [], disabledDays: [] });
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useBuyerJourneyIntercept(
    ({ canBlockProgress }) => {

      if (canBlockProgress) {
        if (!selectedDate) {
          return {
            behavior: 'block',
            reason: 'Invalid delivery date',
            errors: [
              {
                message: 'Please select a delivery date.',
              },
            ],
          };
        } else if (!isValid) {
          return {
            behavior: 'block',
            reason: 'Invalid delivery date',
            errors: [
              {
                message: 'Please select a valid delivery date.',
              },
            ],
          };
        }
      }
      return {
        behavior: 'allow',
      };
    },
  );


  // Run a check every 1 minute to see if the availability rules changed, and validate the selected date if present
  useEffect(() => {
    // Initialize the availability rules
    getAvailabilityRules().then(rules => {
      if (selectedDate && !validateDate(selectedDate, rules)) {
        setSelectedDate(undefined);
        setIsValid(false);
      }
      setIsInitialized(true);
      setAvailabilityRules(rules);
    });
    // For subsequent checks, check every minute
    const interval = setInterval(async () => {
      const newRules = await getAvailabilityRules();
      setAvailabilityRules(newRules);
      if (selectedDate && !validateDate(selectedDate, newRules)) {
        setSelectedDate(undefined);
        setIsValid(false);
      }
    }, 60 * 1000);
    return () => {
      clearInterval(interval);
    }
  }, [selectedDate]);


  // 3. Render a UI
  return (
    <BlockStack padding={"none"}>
      <Heading level={2}>Pick a delivery date</Heading>
      <BlockStack border={"base"} padding={"tight"}>
        <DatePicker
          selected={selectedDate}
          onChange={onDateSelected}
          disabled={isInitialized ? [...availabilityRules.disabledDays.filter(day => day.disabled).map(day => day.identifier),
          ...availabilityRules.disabledDates.map(date =>
            date.endDate ? { start: date.startDate, end: date.endDate } : date.startDate)] : true}
        />
      </BlockStack>

    </BlockStack>
  );

  async function onDateSelected(date: string) {
    setSelectedDate(date);
    setIsValid(validateDate(date, availabilityRules));
    await applyAttributeChange({
      key: constants.ORDER_ATTRIBUTE_KEY,
      type: "updateAttribute",
      value: date,
    });
  }
}
