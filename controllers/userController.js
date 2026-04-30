const db = require('../config/db');
const paymentService = require('../services/paymentService');

// Get user dashboard
exports.dashboard = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user data
    const [users] = await db.query(
      'SELECT id, name, email, plan, tasks_today, last_reset, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Get task history (last 20 tasks)
    const [tasks] = await db.query(
      `SELECT id, tool_slug, input_file, output_file, status, created_at
       FROM tasks
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 20`,
      [req.user.id]
    );

    // Calculate remaining tasks for today
    const today = new Date().toISOString().slice(0, 10);
    const isToday = user.last_reset === today;
    const dailyLimit = parseInt(process.env.FREE_DAILY_LIMIT) || 20;
    const remainingTasks = user.plan === 'pro' ? -1 : (isToday ? dailyLimit - user.tasks_today : dailyLimit);

    res.json({
      user: {
        ...user,
        remainingTasks,
        isToday
      },
      tasks,
      stats: {
        totalTasks: user.tasks_today,
        plan: user.plan,
        dailyLimit: user.plan === 'pro' ? 'Unlimited' : dailyLimit
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// Upgrade to Pro with Stripe integration
exports.upgrade = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('dummy') || process.env.STRIPE_SECRET_KEY.includes('sk_test_dummy')) {
      return res.status(501).json({
        error: 'Payment integration not configured',
        message: 'Stripe integration is not set up. Please contact support.'
      });
    }

    // Get user email for Stripe checkout
    const [users] = await db.query(
      'SELECT email FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userEmail = users[0].email;

    // Create Stripe checkout session
    const session = await paymentService.createCheckoutSession(req.user.id, userEmail);

    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
};

// Get subscription status
exports.getSubscriptionStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const subscriptionStatus = await paymentService.getSubscriptionStatus(req.user.id);

    res.json({
      success: true,
      subscription: subscriptionStatus
    });

  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({
      error: 'Failed to get subscription status',
      message: error.message
    });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const result = await paymentService.cancelSubscription(req.user.id);

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      cancelAt: result.cancelAt
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      error: 'Failed to cancel subscription',
      message: error.message
    });
  }
};

// Get user analytics
exports.getAnalytics = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id;
    const { period = '7d' } = req.query;

    // Calculate date range based on period
    let startDate;
    const endDate = new Date();

    switch (period) {
      case '1d':
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get usage statistics
    const [usageStats] = await db.query(`
      SELECT
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as failed_tasks,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks
      FROM tasks
      WHERE user_id = ? AND created_at >= ?
    `, [userId, startDate]);

    // Get tool usage breakdown
    const [toolUsage] = await db.query(`
      SELECT
        tool_slug,
        COUNT(*) as usage_count,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as success_count
      FROM tasks
      WHERE user_id = ? AND created_at >= ?
      GROUP BY tool_slug
      ORDER BY usage_count DESC
      LIMIT 10
    `, [userId, startDate]);

    // Get daily usage trend
    const [dailyTrend] = await db.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as task_count,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as success_count
      FROM tasks
      WHERE user_id = ? AND created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [userId, startDate]);

    // Get file size statistics (if we have file size data)
    const [fileSizeStats] = await db.query(`
      SELECT
        AVG(LENGTH(input_file)) as avg_input_size,
        MAX(LENGTH(input_file)) as max_input_size,
        AVG(LENGTH(output_file)) as avg_output_size,
        MAX(LENGTH(output_file)) as max_output_size
      FROM tasks
      WHERE user_id = ? AND created_at >= ? AND status = 'done'
    `, [userId, startDate]);

    // Get peak usage times
    const [peakUsage] = await db.query(`
      SELECT
        HOUR(created_at) as hour,
        COUNT(*) as task_count
      FROM tasks
      WHERE user_id = ? AND created_at >= ?
      GROUP BY HOUR(created_at)
      ORDER BY task_count DESC
      LIMIT 5
    `, [userId, startDate]);

    // Get category breakdown
    const [categoryBreakdown] = await db.query(`
      SELECT
        t.category,
        COUNT(*) as usage_count
      FROM tasks ta
      JOIN tools t ON ta.tool_slug = t.slug
      WHERE ta.user_id = ? AND ta.created_at >= ?
      GROUP BY t.category
      ORDER BY usage_count DESC
    `, [userId, startDate]);

    res.json({
      success: true,
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      usage: {
        total: usageStats[0].total_tasks,
        completed: usageStats[0].completed_tasks,
        failed: usageStats[0].failed_tasks,
        pending: usageStats[0].pending_tasks,
        successRate: usageStats[0].total_tasks > 0
          ? Math.round((usageStats[0].completed_tasks / usageStats[0].total_tasks) * 100)
          : 0
      },
      tools: toolUsage.map(tool => ({
        slug: tool.tool_slug,
        name: formatToolName(tool.tool_slug),
        usage: tool.usage_count,
        successRate: tool.usage_count > 0
          ? Math.round((tool.success_count / tool.usage_count) * 100)
          : 0
      })),
      dailyTrend: dailyTrend.map(day => ({
        date: day.date,
        tasks: day.task_count,
        successful: day.success_count
      })),
      peakUsage: peakUsage.map(peak => ({
        hour: peak.hour,
        tasks: peak.task_count
      })),
      categories: categoryBreakdown.map(cat => ({
        category: cat.category,
        usage: cat.usage_count
      }))
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
};

// Get user statistics summary
exports.getStatsSummary = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id;

    // Get overall statistics
    const [overallStats] = await db.query(`
      SELECT
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as recent_tasks,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as monthly_tasks
      FROM tasks
      WHERE user_id = ?
    `, [userId]);

    // Get most used tools
    const [mostUsedTools] = await db.query(`
      SELECT
        tool_slug,
        COUNT(*) as usage_count
      FROM tasks
      WHERE user_id = ? AND status = 'done'
      GROUP BY tool_slug
      ORDER BY usage_count DESC
      LIMIT 5
    `, [userId]);

    // Get recent activity
    const [recentActivity] = await db.query(`
      SELECT
        tool_slug,
        input_file,
        output_file,
        status,
        created_at
      FROM tasks
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `, [userId]);

    // Get storage usage (estimated based on file names)
    const [storageUsage] = await db.query(`
      SELECT
        SUM(LENGTH(input_file) + LENGTH(output_file)) as estimated_storage
      FROM tasks
      WHERE user_id = ? AND status = 'done'
    `, [userId]);

    res.json({
      success: true,
      overview: {
        totalTasks: overallStats[0].total_tasks,
        completedTasks: overallStats[0].completed_tasks,
        recentTasks: overallStats[0].recent_tasks,
        monthlyTasks: overallStats[0].monthly_tasks,
        estimatedStorage: storageUsage[0].estimated_storage || 0
      },
      topTools: mostUsedTools.map(tool => ({
        slug: tool.tool_slug,
        name: formatToolName(tool.tool_slug),
        usage: tool.usage_count
      })),
      recentActivity: recentActivity.map(activity => ({
        tool: activity.tool_slug,
        toolName: formatToolName(activity.tool_slug),
        inputFile: activity.input_file,
        outputFile: activity.output_file,
        status: activity.status,
        createdAt: activity.created_at
      }))
    });

  } catch (error) {
    console.error('Stats summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics summary',
      message: error.message
    });
  }
};

// Helper function to format tool names
function formatToolName(slug) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
