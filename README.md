# Delivery Date Config - Remix

A Shopify app that enhances the merchant and customer experience by providing flexible delivery date management. Built with Shopify CLI, Remix, and TypeScript.

## Features

### For Merchants
- **Day Management**: Toggle specific days of the week for delivery availability
- **Date Management**: Block specific dates or date ranges
- **Real-time Updates**: Changes reflect immediately in checkout
- **Intuitive Dashboard**: Built with Shopify Polaris components

### For Customers
- **Dynamic Date Selection**: Choose delivery dates during checkout
- **Smart Validation**: Only available dates can be selected
- **Real-time Sync**: Date availability updates and validates every minute
- **Clear Feedback**: Informative messages for unavailable dates

## Technical Stack

- **Template**: Shopify Remix App Template
- **Framework**: Remix (React + TypeScript)
- **UI Components**: 
  - Merchant Dashboard: Shopify Polaris
  - Checkout Extension: Shopify Checkout UI Extensions
- **Date Management**: dayjs
- **Data Storage**: Shopify Metafields
- **Session Storage**: SQLite (development)

## Data Structure

The app uses Shopify Metafields to store configuration:
```typescript
interface DateConfig {
  disabledDates: DateRule[]; // Specific dates/ranges
  disabledDays: DayRule[]; // Weekly patterns
}
```

## Key Components

### Merchant Dashboard
- **Day Editor**: Toggle interface for weekday management
- **Date Editor**: Calendar interface for specific date/range blocking
- **Date Selector**: Modal component for date range selection

### Checkout Extension
- Dynamic date picker that respects merchant configurations
- Real-time validation of selected dates
- Clear error messaging for unavailable dates

## Deployment

The app is hosted on Render.com. For deployment:

1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Render will deploy based on the Dockerfile

## Limitations & Considerations

- Free hosting plan on Render may have initial load delays
- SQLite session storage not recommended for production at scale
- Metafield updates sync every minute in checkout, can be improved based on requirement

## Future Enhancements

- Date override functionality for blocked days
- PostgreSQL upgrade for session storage, required incase of multi tenancy

## Installation and Local Development

1. Clone the repository
2. Install dependencies:
```bash
yarn install
```
3. Run the app:
```bash
yarn dev
```
Press P to open the URL to your app. Once you click install, you can start development.
