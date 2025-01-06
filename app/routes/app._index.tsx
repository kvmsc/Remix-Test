import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  BlockStack,
} from "@shopify/polaris";
import { SaveBar } from "@shopify/app-bridge-react";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { DateConfig, DateRule, DayRule } from "app/components/types";
import { simpleHash } from "app/helper/utils";
import { DateEditor } from "app/components/DateEditor";
import { DayEditor } from "app/components/DayEditor";
import { constants } from "app/constants";

// Get shop metafield
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  // Check for metafield definition
  const hasMetafieldDefinition = await admin.graphql(
    `#graphql
    query getMetafieldDefinitons{
      metafieldDefinitions(first: 250, ownerType: SHOP) {
        edges {
          node {
            key
            namespace
          }
        }
      }
    }`
  ).then((res) => res.json()).then((data) => 
    data.data.metafieldDefinitions.edges.some((edge: any) => edge.node.key === constants.KEY && edge.node.namespace === constants.NAMESPACE));

  if(!hasMetafieldDefinition) {
    await admin.graphql(
      `#graphql
      mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
          createdDefinition {
            id
            name
          }
          userErrors {
            field
            message
            code
          }
        }
      }`, 
      { 
        variables: {
          definition: {
            name: "Delivery Date Rules",
            namespace: constants.APP_NAMESPACE,
            key: constants.KEY,
            type: "json",
            ownerType: "SHOP",
          access: {
            storefront: "PUBLIC_READ",
              admin: "MERCHANT_READ"
            }
          }
        }
      }
    );
  }

  const response = await admin.graphql(
    `#graphql
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
      }`,
  ).then((res) => res.json());

  const dateConfig = !!response.data.shop.metafield?.value
    ? (JSON.parse(response.data.shop.metafield.value) as DateConfig)
    : { disabledDates: [], disabledDays: [] } as DateConfig;

  return { dateConfig, shopId: response.data.shop.id };
};

// Update shop metafield
export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();
  const newDateConfigJSON = formData.get("dateConfig");
  const shopId = formData.get("shopId");

  const response = await admin.graphql(
    `#graphql
      mutation setMetafield {
        metafieldsSet(metafields: [{
          ownerId: "${shopId}",
          namespace: "${constants.APP_NAMESPACE}",
          key: "${constants.KEY}",
          value: "${newDateConfigJSON?.toString().replace(/"/g, '\\"')}",
          type: "json"
        }]) {
          metafields {
            id
          }
        }
      }`
  ).then((res) => res.json());

  return { metafieldId: response.data.metafieldsSet.metafields[0].id };
};

export default function Index() {
  const fetcher = useFetcher<typeof action>();
  const { dateConfig, shopId } = useLoaderData<typeof loader>();
  const [dateConfigHash, setDateConfigHash] = useState(simpleHash(JSON.stringify(dateConfig)));
  const [isDateConfigChanged, setIsDateConfigChanged] = useState(false);
  const [currentDateConfig, setCurrentDateConfig] = useState<DateConfig>(dateConfig);


  useEffect(() => {
    const isDateConfigChanged = dateConfigHash !== simpleHash(JSON.stringify(currentDateConfig));
    setIsDateConfigChanged(isDateConfigChanged);
    if(isDateConfigChanged) {
      shopify.saveBar.show('dates-save-bar');
    } else {
      shopify.saveBar.hide('dates-save-bar');
    }
  }, [dateConfigHash, currentDateConfig]);

  const addRule = (rule: DateRule | DayRule) => {
    setCurrentDateConfig((prevDateConfig) => {
      if ("day" in rule) {
        const newDateConfig = { ...prevDateConfig };
        newDateConfig.disabledDays = [...newDateConfig.disabledDays.filter((r) => r.identifier !== rule.identifier), rule];
        return newDateConfig;
      } else {
        const newDateConfig = { ...prevDateConfig };
        newDateConfig.disabledDates = [...newDateConfig.disabledDates.filter((r) => r.identifier !== rule.identifier), rule];
        return newDateConfig;
      }
    });
  }

  const removeRule = (identifier: string) => {
    setCurrentDateConfig((prevDateConfig) => {
      const newDateConfig = { ...prevDateConfig };
      newDateConfig.disabledDays = newDateConfig.disabledDays.filter((r) => r.identifier !== identifier);
      newDateConfig.disabledDates = newDateConfig.disabledDates.filter((r) => r.identifier !== identifier);
      return newDateConfig;
    });
  }


  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  const saveDateConfig = () => {
    fetcher.submit({
      dateConfig: JSON.stringify(currentDateConfig),
      shopId: shopId
    }, { method: "POST" });
    shopify.saveBar.hide('dates-save-bar');
  }

  const resetDateConfig = () => {
    setCurrentDateConfig(dateConfig);
    setDateConfigHash(simpleHash(JSON.stringify(dateConfig)));
  }

  return (
    <>
    <Page>
      <TitleBar title="Delivery Date Availability - Configuration"/>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section variant="oneHalf">
            <DayEditor disabledDays={currentDateConfig.disabledDays} addRule={addRule} removeRule={removeRule} />
          </Layout.Section>
          <Layout.Section variant="oneHalf">
            <BlockStack gap="500">
              <DateEditor disabledDates={currentDateConfig.disabledDates} addRule={addRule} removeRule={removeRule} />
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
    <SaveBar id="dates-save-bar">
        <button variant="primary" disabled={isLoading || !isDateConfigChanged} onClick={saveDateConfig}>
          Save
        </button>
        <button disabled={isLoading || !isDateConfigChanged} onClick={resetDateConfig}>
          Reset
        </button>
    </SaveBar>
    </>
  );
}
