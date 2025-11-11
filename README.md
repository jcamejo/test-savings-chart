# Cash Savings History - Trellis Charts

A web application for visualizing cash savings history data using Chart.js in a trellis (small multiples) format.

## Features

- 📊 **Trellis Chart Visualization**: Display multiple charts in a responsive grid layout
- 🔍 **Search Functionality**: Filter charts by aggregation key
- 📁 **CSV File Support**: Upload and parse CSV files with multi-line JSON data
- 📅 **Date-based X-axis**: Automatically generates date labels from start_date
- 🎨 **Modern UI**: Clean, responsive design with hover effects

## Usage

1. Open `index.html` in a web browser
2. Click "Select CSV File" and choose your CSV file
3. Charts will be generated automatically for each row
4. Use the search box to filter charts by aggregation key

## CSV Format

The CSV file should have the following columns:
- `COUNTRY`: Country code (e.g., UK)
- `CALENDAR_DATE`: Date in YYYY-MM-DD format
- `AGGREGATION_NAME`: Name of the aggregation
- `AGGREGATION_KEY`: Key identifier (e.g., mazda_3)
- `DATA`: JSON object with:
  - `start_date`: Start date for the time series (YYYY-MM-DD)
  - `values`: Array of numeric values

## Example Data Structure

```csv
COUNTRY,CALENDAR_DATE,AGGREGATION_NAME,AGGREGATION_KEY,DATA
UK,2025-11-11,average_factory_cash_savings_history,mazda_3,"{
  ""start_date"": ""2025-10-13"",
  ""values"": [2318, 2318, 2608, 2898]
}"
```

## Local Development

Simply open `index.html` in your browser. For auto-loading `data.csv`, use a local web server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Technologies

- Chart.js 4.4.0
- Vanilla JavaScript
- HTML5 & CSS3

## License

MIT

