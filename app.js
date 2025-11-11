// Parse CSV text and create trellis charts
function parseCSV(text) {
    // Parse CSV manually (handling multi-line JSON in DATA column)
    const lines = text.split('\n');
    const records = [];
    let currentRecord = null;
    let jsonBuffer = '';
    let braceCount = 0;
    let inJson = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip header
        if (i === 0) continue;
        if (!line.trim()) continue;

        // Check if this line starts a new record (starts with country code followed by comma)
        if (line.match(/^[A-Z]{2},/)) {
            // Save previous record if exists
            if (currentRecord && jsonBuffer) {
                try {
                    // Clean up JSON buffer
                    let cleanJson = jsonBuffer.trim();
                    // Remove leading quote if present
                    if (cleanJson.startsWith('"')) {
                        cleanJson = cleanJson.slice(1);
                    }
                    // Remove trailing quote if present
                    if (cleanJson.endsWith('"')) {
                        cleanJson = cleanJson.slice(0, -1);
                    }
                    // Replace CSV escaped quotes ("" -> ")
                    cleanJson = cleanJson.replace(/""/g, '"');
                    currentRecord.data = JSON.parse(cleanJson);
                    records.push(currentRecord);
                } catch (e) {
                    console.warn('Failed to parse JSON for record:', currentRecord?.aggregationKey, e);
                    console.warn('JSON buffer:', jsonBuffer.substring(0, 200));
                }
            }

            // Start new record - parse first 4 columns
            const firstComma = line.indexOf(',');
            const secondComma = line.indexOf(',', firstComma + 1);
            const thirdComma = line.indexOf(',', secondComma + 1);
            const fourthComma = line.indexOf(',', thirdComma + 1);

            currentRecord = {
                country: line.substring(0, firstComma),
                calendarDate: line.substring(firstComma + 1, secondComma),
                aggregationName: line.substring(secondComma + 1, thirdComma),
                aggregationKey: line.substring(thirdComma + 1, fourthComma)
            };

            // Find where JSON starts (after the opening quote if present)
            const jsonStart = line.indexOf('{', fourthComma);
            if (jsonStart !== -1) {
                jsonBuffer = line.substring(jsonStart);
                // Count braces to track JSON completion
                braceCount = (jsonBuffer.match(/{/g) || []).length - (jsonBuffer.match(/}/g) || []).length;
                inJson = braceCount > 0;
            } else {
                jsonBuffer = '';
                inJson = false;
                braceCount = 0;
            }
        } else if (inJson) {
            // Continue building JSON
            jsonBuffer += '\n' + line;
            // Update brace count
            braceCount += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
            // JSON is complete when brace count reaches 0
            if (braceCount === 0) {
                inJson = false;
            }
        }
    }

    // Don't forget the last record
    if (currentRecord && jsonBuffer) {
        try {
            let cleanJson = jsonBuffer.trim();
            // Remove leading quote if present
            if (cleanJson.startsWith('"')) {
                cleanJson = cleanJson.slice(1);
            }
            // Remove trailing quote if present
            if (cleanJson.endsWith('"')) {
                cleanJson = cleanJson.slice(0, -1);
            }
            // Replace CSV escaped quotes ("" -> ")
            cleanJson = cleanJson.replace(/""/g, '"');
            currentRecord.data = JSON.parse(cleanJson);
            records.push(currentRecord);
        } catch (e) {
            console.warn('Failed to parse JSON for last record:', currentRecord?.aggregationKey, e);
            console.warn('JSON buffer:', jsonBuffer.substring(0, 200));
        }
    }

    console.log(`Parsed ${records.length} records`);
    if (records.length > 0) {
        console.log('Sample record:', records[0]);
    }
    return records;
}

// Generate date labels starting from start_date
function generateDateLabels(startDate, count) {
    const start = new Date(startDate);
    const labels = [];

    for (let i = 0; i < count; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    return labels;
}

// Create a chart for a single record
function createChart(record, container) {
    const { data, country, aggregationKey, calendarDate } = record;

    if (!data || !data.start_date || !data.values) {
        console.warn('Invalid data for record:', record);
        return;
    }

    const chartCard = document.createElement('div');
    chartCard.className = 'chart-card';
    chartCard.setAttribute('data-aggregation-key', aggregationKey.toLowerCase());

    const title = document.createElement('div');
    title.className = 'chart-title';
    title.textContent = `${country} - ${aggregationKey}`;

    const subtitle = document.createElement('div');
    subtitle.className = 'chart-subtitle';
    subtitle.textContent = `Date: ${calendarDate}`;

    const chartWrapper = document.createElement('div');
    chartWrapper.className = 'chart-wrapper';

    const canvas = document.createElement('canvas');
    chartWrapper.appendChild(canvas);

    chartCard.appendChild(title);
    chartCard.appendChild(subtitle);
    chartCard.appendChild(chartWrapper);
    container.appendChild(chartCard);

    const labels = generateDateLabels(data.start_date, data.values.length);

    // Replace -1 values with 0
    const processedValues = data.values.map(value => value === -1 ? 0 : value);

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cash Savings',
                data: processedValues,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                tension: 0.1,
                fill: true,
                pointRadius: 2,
                pointHoverRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        maxTicksLimit: 10
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Cash Savings'
                    },
                    beginAtZero: false
                }
            }
        }
    });
}

// Process CSV and create charts
function processCSV(text) {
    const loadingEl = document.getElementById('loading');
    const container = document.getElementById('charts-container');

    try {
        // Clear previous charts
        container.innerHTML = '';
        loadingEl.style.display = 'block';
        loadingEl.textContent = 'Parsing CSV data...';
        loadingEl.style.color = '#666';

        const records = parseCSV(text);

        loadingEl.style.display = 'none';

        // Create charts for each record
        records.forEach((record, index) => {
            createChart(record, container);
        });

        // Show search container and update result count
        const searchContainer = document.getElementById('search-container');
        searchContainer.style.display = 'block';
        updateResultCount();

        console.log(`Created ${records.length} charts`);
    } catch (error) {
        loadingEl.textContent = `Error: ${error.message}`;
        loadingEl.style.color = 'red';
        console.error('Processing error:', error);
    }
}

// Filter charts based on search term
function filterCharts(searchTerm) {
    const chartCards = document.querySelectorAll('.chart-card');
    const term = searchTerm.toLowerCase().trim();
    let visibleCount = 0;

    chartCards.forEach(card => {
        const aggregationKey = card.getAttribute('data-aggregation-key');
        if (term === '' || aggregationKey.includes(term)) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    updateResultCount(visibleCount);
}

// Update result count display
function updateResultCount(visibleCount = null) {
    const resultCountEl = document.getElementById('result-count');
    const chartCards = document.querySelectorAll('.chart-card');
    const totalCount = chartCards.length;

    if (visibleCount === null) {
        visibleCount = totalCount;
    }

    if (visibleCount === totalCount) {
        resultCountEl.textContent = `Showing all ${totalCount} charts`;
    } else {
        resultCountEl.textContent = `Showing ${visibleCount} of ${totalCount} charts`;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('csv-file');
    const loadBtn = document.getElementById('load-btn');
    const searchInput = document.getElementById('search-input');

    // Try to load data.csv if available (when served via HTTP)
    fetch('data.csv')
        .then(response => response.text())
        .then(text => {
            processCSV(text);
        })
        .catch(() => {
            // File not available, wait for user to select file
            console.log('CSV file not found, waiting for file input...');
        });

    // Handle file selection
    loadBtn.addEventListener('click', function () {
        const file = fileInput.files[0];
        if (!file) {
            alert('Please select a CSV file first.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            processCSV(e.target.result);
        };
        reader.onerror = function () {
            alert('Error reading file.');
        };
        reader.readAsText(file);
    });

    // Also allow auto-load on file selection
    fileInput.addEventListener('change', function () {
        if (fileInput.files[0]) {
            loadBtn.click();
        }
    });

    // Handle search input
    searchInput.addEventListener('input', function (e) {
        filterCharts(e.target.value);
    });

    // Clear search on Escape key
    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            e.target.value = '';
            filterCharts('');
        }
    });
});

