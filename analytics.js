import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCcStFHPf5AOCZgqMCWq9T7nd4lFXAcA8M",
    authDomain: "stay100-31316.firebaseapp.com",
    databaseURL: "https://stay100-31316-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "stay100-31316",
    storageBucket: "stay100-31316.firebasestorage.app",
    messagingSenderId: "91816784620",
    appId: "1:91816784620:web:45cbf9baa3808fc580ebc9",
    measurementId: "G-4J40FKKDNT"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let rawAnalyticsLogs = [];
let currentFilterType = 'today';
let trafficChartInstance = null;

// Global filter switcher function
window.setAnalyticsFilter = function(filterKey, btnElement) {
    currentFilterType = filterKey;
    document.querySelectorAll('.filter-chip').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');
    
    const labelMapping = {
        'today': 'Today',
        'yesterday': 'Yesterday',
        'weekly': 'This Week',
        'monthly': 'This Month',
        'yearly': 'This Year'
    };
    document.getElementById('current-filter-label').innerText = labelMapping[filterKey] || 'Today';
    
    processAndRenderAnalytics(rawAnalyticsLogs, currentFilterType);
};

// Fetch real-time logs from Firebase endpoint 'site_analytics'
const analyticsRef = ref(db, 'site_analytics');
onValue(analyticsRef, (snapshot) => {
    const data = snapshot.val();
    rawAnalyticsLogs = [];
    if(data) {
        Object.keys(data).forEach(key => {
            rawAnalyticsLogs.push(data[key]);
        });
    }
    processAndRenderAnalytics(rawAnalyticsLogs, currentFilterType);
});

function processAndRenderAnalytics(logs, filter) {
    const now = new Date();
    
    // Filter logs based on timeline criteria
    const filteredLogs = logs.filter(log => {
        if(!log.openTime) return false;
        const logDate = new Date(log.openTime);
        
        if (filter === 'today') {
            return logDate.toDateString() === now.toDateString();
        } else if (filter === 'yesterday') {
            const yesterday = new Date();
            yesterday.setDate(now.getDate() - 1);
            return logDate.toDateString() === yesterday.toDateString();
        } else if (filter === 'weekly') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);
            return logDate >= oneWeekAgo;
        } else if (filter === 'monthly') {
            return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
        } else if (filter === 'yearly') {
            return logDate.getFullYear() === now.getFullYear();
        }
        return true;
    });

    // 1. Calculate Metrics
    const uniqueVisitorsSet = new Set(filteredLogs.map(l => l.userIp || l.visitorId || 'guest'));
    let totalPropViews = 0;
    let totalTimeSpentSeconds = 0;
    let validTimeCount = 0;
    const statesSet = new Set();
    const propertyClicksMap = {};
    const geoMap = {};

    filteredLogs.forEach(log => {
        if(log.propertyClicked) {
            totalPropViews++;
            propertyClicksMap[log.propertyClicked] = (propertyClicksMap[log.propertyClicked] || 0) + 1;
        }
        if(log.timeSpentSeconds) {
            totalTimeSpentSeconds += Number(log.timeSpentSeconds);
            validTimeCount++;
        }
        if(log.state) statesSet.add(log.state);
        
        // Geo breakdown
        const stateKey = log.state || 'Unknown State';
        const districtKey = log.district || log.city || 'Unknown District';
        const geoCompositeKey = `${stateKey}__${districtKey}`;
        geoMap[geoCompositeKey] = (geoMap[geoCompositeKey] || 0) + 1;
    });

    const avgSeconds = validTimeCount > 0 ? Math.round(totalTimeSpentSeconds / validTimeCount) : 0;
    const avgMinutesStr = `${Math.floor(avgSeconds / 60)}m ${avgSeconds % 60}s`;

    document.getElementById('m-total-visitors').innerText = uniqueVisitorsSet.size;
    document.getElementById('m-prop-views').innerText = totalPropViews;
    document.getElementById('m-avg-time').innerText = avgMinutesStr;
    document.getElementById('m-active-states').innerText = statesSet.size;

    // 2. Render Graph
    renderTrafficChart(filteredLogs, filter);

    // 3. Render Clicked Properties Table
    renderClickedPropertiesTable(propertyClicksMap);

    // 4. Render Geo Demographics Table
    renderGeoTable(geoMap);

    // 5. Render Live Sessions Table
    renderLiveSessionsTable(filteredLogs);
}

function renderTrafficChart(logs, filter) {
    const ctx = document.getElementById('trafficTrendChart').getContext('2d');
    
    // Group data by intervals (hours for today/yesterday, days for weekly/monthly)
    const labelDataMap = {};
    
    if (filter === 'today' || filter === 'yesterday') {
        for (let i = 0; i < 24; i += 3) {
            const labelKey = `${i}:00`;
            labelDataMap[labelKey] = 0;
        }
        logs.forEach(log => {
            const hr = new Date(log.openTime).getHours();
            const slotHour = Math.floor(hr / 3) * 3;
            const labelKey = `${slotHour}:00`;
            if(labelDataMap[slotHour !== undefined ? labelKey : '0:00'] !== undefined) {
                labelDataMap[labelKey]++;
            }
        });
    } else {
        // Group by day format
        logs.forEach(log => {
            const dayStr = new Date(log.openTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            labelDataMap[dayStr] = (labelDataMap[dayStr] || 0) + 1;
        });
    }

    const chartLabels = Object.keys(labelDataMap);
    const chartValues = Object.values(labelDataMap);

    if(trafficChartInstance) {
        trafficChartInstance.destroy();
    }

    trafficChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels.length > 0 ? chartLabels : ['No Data'],
            datasets: [{
                label: 'Traffic Visitors',
                data: chartValues.length > 0 ? chartValues : [0],
                borderColor: '#800000',
                backgroundColor: 'rgba(128, 0, 0, 0.08)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#800000'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderClickedPropertiesTable(clicksMap) {
    const tbody = document.getElementById('clicked-properties-tbody');
    const sortedProps = Object.keys(clicksMap).sort((a,b) => clicksMap[b] - clicksMap[a]);

    if(sortedProps.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">No property clicks recorded for this range.</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    sortedProps.forEach(propName => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${propName}</strong></td>
                <td><span style="background:var(--olive-light); color:var(--olive); padding:3px 8px; border-radius:4px; font-weight:700;">${clicksMap[propName]} clicks</span></td>
                <td style="color:var(--text-muted); font-size:12px;">Recently Active</td>
            </tr>
        `;
    });
}

function renderGeoTable(geoMap) {
    const tbody = document.getElementById('geo-location-tbody');
    const sortedGeo = Object.keys(geoMap).sort((a,b) => geoMap[b] - geoMap[a]);

    if(sortedGeo.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">No geographic telemetry logs found.</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    sortedGeo.forEach(composite => {
        const [state, district] = composite.split('__');
        tbody.innerHTML += `
            <tr>
                <td>${state}</td>
                <td><strong>${district}</strong></td>
                <td>${geoMap[composite]} visits</td>
            </tr>
        `;
    });
}

function renderLiveSessionsTable(logs) {
    const tbody = document.getElementById('live-sessions-tbody');
    
    if(logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No active sessions found for this timeframe.</td></tr>`;
        return;
    }

    // Sort latest first
    const sortedLogs = [...logs].reverse().slice(0, 15);

    tbody.innerHTML = "";
    sortedLogs.forEach(log => {
        const timeOpenFormatted = log.openTime ? new Date(log.openTime).toLocaleTimeString() : 'N/A';
        const durationMin = log.timeSpentSeconds ? `${Math.floor(log.timeSpentSeconds / 60)}m ${log.timeSpentSeconds % 60}s` : 'Active / < 1m';
        
        tbody.innerHTML += `
            <tr>
                <td><code style="background:#f1f5f9; padding:2px 6px; border-radius:4px;">${log.userIp || 'Visitor-' + Math.floor(Math.random()*1000)}</code></td>
                <td>${log.district || 'Jaipur'}, ${log.state || 'Rajasthan'}</td>
                <td>${timeOpenFormatted}</td>
                <td><span style="color:var(--success); font-weight:700;">${durationMin}</span></td>
                <td>${log.propertyClicked ? `<span style="color:var(--mehrum); font-weight:600;"><i class="fa-solid fa-arrow-pointer"></i> ${log.propertyClicked}</span>` : '<span style="color:var(--text-muted);">Browsing Home</span>'}</td>
            </tr>
        `;
    });
}