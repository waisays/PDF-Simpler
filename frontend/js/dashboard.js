// Dashboard JavaScript

const API_BASE = '/api/user';

// Check authentication and load dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (!window.PDFSimplerAuth?.requireAuth()) {
        return;
    }

    loadDashboard();
    loadAnalytics();
    loadStatsSummary();
});

// Load dashboard data
async function loadDashboard() {
    const token = localStorage.getItem('jwt_token');

    try {
        const response = await fetch(`${API_BASE}/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load dashboard');
        }

        const data = await response.json();
        renderDashboard(data);

    } catch (error) {
        console.error('Dashboard error:', error);
        showDashboardError(error.message);
    }
}

// Load analytics data
async function loadAnalytics(period = '7d') {
    const token = localStorage.getItem('jwt_token');

    try {
        const response = await fetch(`${API_BASE}/analytics?period=${period}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load analytics');
        }

        const data = await response.json();
        renderAnalytics(data);

    } catch (error) {
        console.error('Analytics error:', error);
    }
}

// Load statistics summary
async function loadStatsSummary() {
    const token = localStorage.getItem('jwt_token');

    try {
        const response = await fetch(`${API_BASE}/stats-summary`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load stats summary');
        }

        const data = await response.json();
        renderStatsSummary(data);

    } catch (error) {
        console.error('Stats summary error:', error);
    }
}

// Render dashboard
function renderDashboard(data) {
    // Update user info
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const userAvatar = document.getElementById('user-avatar');
    const planBadge = document.getElementById('plan-badge');

    if (data.user && userName) {
        userName.textContent = data.user.name;
    }

    if (data.user && userEmail) {
        userEmail.textContent = data.user.email;
    }

    if (data.user && userAvatar) {
        userAvatar.textContent = data.user.name.charAt(0).toUpperCase();
    }

    if (data.user && planBadge) {
        planBadge.textContent = data.user.plan === 'pro' ? 'Pro' : 'Free';
        planBadge.className = `plan-badge plan-${data.user.plan}`;
    }

    // Update stats
    const tasksToday = document.getElementById('tasks-today');
    const remainingTasks = document.getElementById('remaining-tasks');
    const totalTasks = document.getElementById('total-tasks');

    if (tasksToday && data.user) {
        tasksToday.textContent = data.user.tasks_today || 0;
    }

    if (remainingTasks && data.user) {
        if (data.user.plan === 'pro') {
            remainingTasks.textContent = '∞';
        } else {
            remainingTasks.textContent = data.user.remainingTasks || 20;
        }
    }

    if (totalTasks && data.stats) {
        totalTasks.textContent = data.stats.totalTasks || 0;
    }

    // Render task history
    renderTaskHistory(data.tasks || []);
}

// Render task history table
function renderTaskHistory(tasks) {
    const tableBody = document.getElementById('tasks-table-body');
    const noTasks = document.getElementById('no-tasks');
    const tasksContainer = document.getElementById('tasks-container');

    if (!tableBody) return;

    if (tasks.length === 0) {
        if (tasksContainer) tasksContainer.style.display = 'none';
        if (noTasks) noTasks.style.display = 'block';
        return;
    }

    if (tasksContainer) tasksContainer.style.display = 'block';
    if (noTasks) noTasks.style.display = 'none';

    tableBody.innerHTML = tasks.map(task => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span>${window.PDFSimpler?.getToolIcon?.(task.tool_slug) || '📄'}</span>
                    <span>${formatToolName(task.tool_slug)}</span>
                </div>
            </td>
            <td>${task.input_file || 'Unknown'}</td>
            <td>
                <span class="status-badge status-${task.status}">
                    ${formatStatus(task.status)}
                </span>
            </td>
            <td>${window.PDFSimpler?.formatDate?.(task.created_at) || task.created_at}</td>
            <td>
                ${task.status === 'done' && task.output_file ? `
                    <button onclick="downloadTaskFile('${task.output_file}')" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                        Download
                    </button>
                ` : '-'}
            </td>
        </tr>
    `).join('');
}

// Format tool name for display
function formatToolName(slug) {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Format status for display
function formatStatus(status) {
    const statusMap = {
        'pending': 'Processing',
        'done': 'Completed',
        'error': 'Failed'
    };
    return statusMap[status] || status;
}

// Download task file
async function downloadTaskFile(filename) {
    const token = localStorage.getItem('jwt_token');

    try {
        const response = await fetch(`/api/tools/download/${filename}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Download failed');
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);

        const anchor = document.createElement('a');
        anchor.href = downloadUrl;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
        console.error('Download error:', error);
        alert('Failed to download file. Please try again.');
    }
}

// Show dashboard error
function showDashboardError(message) {
    const dashboardContainer = document.querySelector('.dashboard-container');
    if (dashboardContainer) {
        dashboardContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <h2 style="color: #ef4444; margin-bottom: 1rem;">Error Loading Dashboard</h2>
                <p style="color: #64748B; margin-bottom: 2rem;">${message}</p>
                <button onclick="location.reload()" class="btn btn-primary">Try Again</button>
            </div>
        `;
    }
}

// Add status badge styles
const style = document.createElement('style');
style.textContent = `
    .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 50px;
        font-size: 0.875rem;
        font-weight: 600;
    }

    .status-pending {
        background: #fef3c7;
        color: #92400e;
    }

    .status-done {
        background: #d1fae5;
        color: #065f46;
    }

    .status-error {
        background: #fee2e2;
        color: #991b1b;
    }

    .analytics-section {
        margin-top: 2rem;
        padding: 1.5rem;
        background: var(--brand-white);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-sm);
    }

    .analytics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    }

    .analytics-card {
        padding: 1rem;
        background: var(--brand-light-gray);
        border-radius: var(--border-radius);
        text-align: center;
    }

    .analytics-card h3 {
        font-size: 0.875rem;
        color: var(--brand-gray);
        margin-bottom: 0.5rem;
    }

    .analytics-card .value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--brand-primary);
    }

    .tool-usage-list {
        list-style: none;
        padding: 0;
        margin-top: 1rem;
    }

    .tool-usage-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        border-bottom: 1px solid var(--brand-light-gray);
    }

    .tool-usage-item:last-child {
        border-bottom: none;
    }

    .tool-usage-bar {
        width: 100px;
        height: 8px;
        background: var(--brand-light-gray);
        border-radius: 4px;
        overflow: hidden;
    }

    .tool-usage-bar-fill {
        height: 100%;
        background: var(--brand-primary);
        border-radius: 4px;
        transition: width 0.3s ease;
    }

    .period-selector {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .period-btn {
        padding: 0.5rem 1rem;
        border: 1px solid var(--brand-light-gray);
        background: var(--brand-white);
        border-radius: var(--border-radius);
        cursor: pointer;
        transition: all var(--transition);
    }

    .period-btn:hover,
    .period-btn.active {
        background: var(--brand-primary);
        color: white;
        border-color: var(--brand-primary);
    }
`;
document.head.appendChild(style);

// Render analytics
function renderAnalytics(data) {
    // Check if analytics section exists, if not create it
    let analyticsSection = document.getElementById('analytics-section');
    if (!analyticsSection) {
        analyticsSection = document.createElement('div');
        analyticsSection.id = 'analytics-section';
        analyticsSection.className = 'analytics-section';

        const dashboardContainer = document.querySelector('.dashboard-container');
        if (dashboardContainer) {
            dashboardContainer.appendChild(analyticsSection);
        }
    }

    analyticsSection.innerHTML = `
        <h2>📊 Usage Analytics</h2>
        <div class="period-selector">
            <button class="period-btn" data-period="1d" onclick="changePeriod('1d')">1 Day</button>
            <button class="period-btn active" data-period="7d" onclick="changePeriod('7d')">7 Days</button>
            <button class="period-btn" data-period="30d" onclick="changePeriod('30d')">30 Days</button>
            <button class="period-btn" data-period="90d" onclick="changePeriod('90d')">90 Days</button>
        </div>

        <div class="analytics-grid">
            <div class="analytics-card">
                <h3>Total Tasks</h3>
                <div class="value">${data.usage.total}</div>
            </div>
            <div class="analytics-card">
                <h3>Completed</h3>
                <div class="value">${data.usage.completed}</div>
            </div>
            <div class="analytics-card">
                <h3>Success Rate</h3>
                <div class="value">${data.usage.successRate}%</div>
            </div>
            <div class="analytics-card">
                <h3>Failed</h3>
                <div class="value">${data.usage.failed}</div>
            </div>
        </div>

        <div style="margin-top: 2rem;">
            <h3>🔧 Most Used Tools</h3>
            <ul class="tool-usage-list">
                ${data.tools.map(tool => `
                    <li class="tool-usage-item">
                        <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1;">
                            <span>${window.PDFSimpler?.getToolIcon?.(tool.slug) || '📄'}</span>
                            <span>${tool.name}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <span style="font-weight: 600;">${tool.usage}</span>
                            <div class="tool-usage-bar">
                                <div class="tool-usage-bar-fill" style="width: ${Math.min(tool.usage / data.usage.total * 100, 100)}%"></div>
                            </div>
                        </div>
                    </li>
                `).join('')}
            </ul>
        </div>

        <div style="margin-top: 2rem;">
            <h3>📈 Daily Usage Trend</h3>
            <div style="margin-top: 1rem; padding: 1rem; background: var(--brand-light-gray); border-radius: var(--border-radius);">
                ${data.dailyTrend.map(day => `
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                        <span style="width: 100px; font-size: 0.875rem;">${new Date(day.date).toLocaleDateString()}</span>
                        <div style="flex: 1; height: 20px; background: var(--brand-white); border-radius: 4px; overflow: hidden;">
                            <div style="width: ${Math.min(day.tasks / Math.max(...data.dailyTrend.map(d => d.tasks)) * 100, 100)}%; height: 100%; background: var(--brand-primary);"></div>
                        </div>
                        <span style="font-weight: 600; width: 50px; text-align: right;">${day.tasks}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="margin-top: 2rem;">
            <h3>⏰ Peak Usage Times</h3>
            <ul class="tool-usage-list">
                ${data.peakUsage.map(peak => `
                    <li class="tool-usage-item">
                        <span>${peak.hour}:00 - ${peak.hour + 1}:00</span>
                        <span style="font-weight: 600;">${peak.tasks} tasks</span>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

// Render statistics summary
function renderStatsSummary(data) {
    // Check if stats summary section exists, if not create it
    let statsSection = document.getElementById('stats-summary-section');
    if (!statsSection) {
        statsSection = document.createElement('div');
        statsSection.id = 'stats-summary-section';
        statsSection.className = 'analytics-section';

        const dashboardContainer = document.querySelector('.dashboard-container');
        if (dashboardContainer) {
            dashboardContainer.appendChild(statsSection);
        }
    }

    statsSection.innerHTML = `
        <h2>📈 Statistics Summary</h2>

        <div class="analytics-grid">
            <div class="analytics-card">
                <h3>All-Time Tasks</h3>
                <div class="value">${data.overview.totalTasks}</div>
            </div>
            <div class="analytics-card">
                <h3>This Month</h3>
                <div class="value">${data.overview.monthlyTasks}</div>
            </div>
            <div class="analytics-card">
                <h3>This Week</h3>
                <div class="value">${data.overview.recentTasks}</div>
            </div>
            <div class="analytics-card">
                <h3>Storage Used</h3>
                <div class="value">${formatBytes(data.overview.estimatedStorage)}</div>
            </div>
        </div>

        <div style="margin-top: 2rem;">
            <h3>🏆 Top Tools</h3>
            <ul class="tool-usage-list">
                ${data.topTools.map(tool => `
                    <li class="tool-usage-item">
                        <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1;">
                            <span>${window.PDFSimpler?.getToolIcon?.(tool.slug) || '📄'}</span>
                            <span>${tool.name}</span>
                        </div>
                        <span style="font-weight: 600;">${tool.usage} uses</span>
                    </li>
                `).join('')}
            </ul>
        </div>

        <div style="margin-top: 2rem;">
            <h3>🕐 Recent Activity</h3>
            <ul class="tool-usage-list">
                ${data.recentActivity.map(activity => `
                    <li class="tool-usage-item">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span>${window.PDFSimpler?.getToolIcon?.(activity.tool) || '📄'}</span>
                                <span>${activity.toolName}</span>
                            </div>
                            <div style="font-size: 0.875rem; color: var(--brand-gray); margin-top: 0.25rem;">
                                ${window.PDFSimpler?.formatDate?.(activity.createdAt) || activity.createdAt}
                            </div>
                        </div>
                        <span class="status-badge status-${activity.status}">
                            ${formatStatus(activity.status)}
                        </span>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

// Change analytics period
function changePeriod(period) {
    // Update active button
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.period === period) {
            btn.classList.add('active');
        }
    });

    // Reload analytics with new period
    loadAnalytics(period);
}

// Format bytes to human readable format
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}