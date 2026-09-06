'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  jobsApi,
  tasksApi,
  paymentsApi,
  Job,
  JobStats,
  TodayTasksResponse,
  PaymentStats,
} from '../../lib/api';
import { JOB_STATUS_STYLES } from '../../constants';

const STATUS_STYLES = JOB_STATUS_STYLES;

const QUICK_ACTIONS = [
  { href: '/jobs/new', label: '+ Tạo job mới', primary: true },
  { href: '/brands', label: '🏷️ Quản lý nhãn hàng', primary: false },
  { href: '/templates', label: '📋 Mẫu việc', primary: false },
  { href: '/payments', label: '💰 Thanh toán', primary: false },
];

function fmtDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function fmtCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [jobStats, setJobStats] = useState<JobStats | null>(null);
  const [todayTasks, setTodayTasks] = useState<TodayTasksResponse | null>(null);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);

  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [statsRes, tasksRes, payRes, jobsRes] = await Promise.all([
        jobsApi.getStats(),
        tasksApi.getToday(),
        paymentsApi.getStats(),
        jobsApi.getAll({ limit: 5 }),
      ]);

      setJobStats(statsRes.data ?? { total: 0, inProgress: 0, completed: 0 });
      setTodayTasks(tasksRes.data ?? { count: 0, tasks: [] });
      setPaymentStats(payRes.data ?? { monthRevenue: 0, pendingRevenue: 0 });

      const rawJobs = jobsRes as any;
      setRecentJobs(rawJobs.data ?? []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu bảng điều khiển');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Quick toggle task completion directly from dashboard
  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    setTogglingTaskId(taskId);
    try {
      await tasksApi.update(taskId, { status: nextStatus });
      // Optimistically update todayTasks
      setTodayTasks((prev) => {
        if (!prev) return null;
        const updatedTasks = prev.tasks.map((t) =>
          t.id === taskId ? { ...t, status: nextStatus } : t
        );
        const newCount = updatedTasks.filter((t) => t.status !== 'COMPLETED').length;
        return { count: newCount, tasks: updatedTasks };
      });
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật trạng thái nhiệm vụ');
    } finally {
      setTogglingTaskId(null);
    }
  };

  const statCards = [
    {
      label: 'Tổng jobs',
      value: loading ? '…' : (jobStats?.total ?? 0),
      icon: '💼',
      color: 'bg-primary/10 text-primary',
      note: loading ? 'Đang tải...' : `${jobStats?.completed ?? 0} đã hoàn thành`,
    },
    {
      label: 'Đang thực hiện',
      value: loading ? '…' : (jobStats?.inProgress ?? 0),
      icon: '🔄',
      color: 'bg-secondary/20 text-secondary-foreground',
      note: 'Jobs đang cần xử lý',
    },
    {
      label: 'Việc đến hạn hôm nay',
      value: loading ? '…' : (todayTasks?.count ?? 0),
      icon: '⏰',
      color: (todayTasks?.count ?? 0) > 0 ? 'bg-destructive/20 text-destructive-foreground' : 'bg-warning/60 text-warning-foreground',
      note: (todayTasks?.count ?? 0) > 0 ? 'Cần hoàn thành gấp' : 'Không có việc tồn đọng',
    },
    {
      label: 'Doanh thu tháng này',
      value: loading ? '…' : fmtCurrency(paymentStats?.monthRevenue ?? 0),
      icon: '💰',
      color: 'bg-soft-sage/60 text-soft-sage-foreground',
      note: (paymentStats?.pendingRevenue ?? 0) > 0
        ? `+ ${fmtCurrency(paymentStats?.pendingRevenue ?? 0)} chờ thanh toán`
        : 'Đã hoàn tất thanh toán',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-pale-pink/20 to-secondary/10 border border-card-border px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tổng quan công việc</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Theo dõi tất cả jobs, nhiệm vụ và doanh thu của bạn tại đây.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-white/70 border border-card-border rounded-xl hover:bg-white transition-colors"
            title="Làm mới dữ liệu"
          >
            🔄 {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
          <Link
            href="/jobs/new"
            className="px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl shadow-sm shadow-primary/20 hover:bg-primary-hover active:bg-primary-active transition-colors whitespace-nowrap text-center"
          >
            + Tạo job mới
          </Link>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 flex items-center justify-between">
          <p className="text-sm text-destructive-foreground font-medium">{error}</p>
          <button
            onClick={loadDashboardData}
            className="text-xs font-semibold underline text-destructive-foreground hover:opacity-80"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="bg-card border border-card-border rounded-2xl p-5 flex flex-col gap-3 shadow-xs hover:border-primary/40 transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tracking-tight">{s.value}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate" title={s.note}>
                {s.note}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2 cols): Recent jobs + Today's tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent jobs */}
          <div className="bg-card border border-card-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">Jobs gần đây</h2>
                {!loading && (
                  <span className="text-xs text-muted-foreground">({recentJobs.length})</span>
                )}
              </div>
              <Link
                href="/jobs"
                className="text-xs text-primary hover:text-primary-hover font-medium transition-colors"
              >
                Xem tất cả →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3 py-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : recentJobs.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-xl mb-3">
                  📋
                </div>
                <p className="text-sm font-medium text-foreground">Chưa có job nào</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Tạo nhãn hàng và job đầu tiên để bắt đầu theo dõi công việc KOC của bạn.
                </p>
                <Link
                  href="/jobs/new"
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors"
                >
                  + Tạo job đầu tiên
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentJobs.map((j) => {
                  const style = STATUS_STYLES[j.status] ?? {
                    label: j.status,
                    className: 'bg-muted text-muted-foreground',
                  };
                  return (
                    <Link
                      key={j.id}
                      href={`/jobs/${j.id}`}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-muted/40 px-2 rounded-xl transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {j.name}
                          </p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium text-muted-foreground shrink-0">
                            {j.brand?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {j.postDate && <span>Đăng bài: {fmtDate(j.postDate)}</span>}
                          {j._count?.tasks !== undefined && (
                            <span>{j._count.tasks} công việc</span>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${style.className}`}>
                        {style.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Today's Tasks Checklist */}
          <div className="bg-card border border-card-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">Nhiệm vụ cần làm hôm nay</h2>
                {!loading && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      (todayTasks?.count ?? 0) > 0
                        ? 'bg-destructive/15 text-destructive-foreground'
                        : 'bg-soft-sage/60 text-soft-sage-foreground'
                    }`}
                  >
                    {todayTasks?.count ?? 0} việc
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <div className="space-y-2 py-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : !todayTasks?.tasks || todayTasks.tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <div className="text-2xl mb-1">🎉</div>
                <p className="text-xs font-medium">Bạn đã hoàn thành hết nhiệm vụ cần làm hôm nay!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayTasks.tasks.map((task) => {
                  const isCompleted = task.status === 'COMPLETED';
                  const isToggling = togglingTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                        isCompleted
                          ? 'bg-muted/50 border-border opacity-60'
                          : 'bg-card border-card-border hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id, task.status)}
                          disabled={isToggling}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                            isCompleted
                              ? 'bg-primary border-primary text-primary-foreground text-xs'
                              : 'border-card-border hover:border-primary bg-white'
                          }`}
                        >
                          {isCompleted ? '✓' : ''}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-medium truncate ${
                              isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            Job: <span className="font-medium text-foreground">{task.job?.name}</span> ({task.job?.brand?.name})
                          </p>
                        </div>
                      </div>

                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {fmtDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column (1 col): Quick actions + Payment Summary */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div className="bg-card border border-card-border rounded-2xl p-5 shadow-xs">
            <h2 className="text-sm font-semibold text-foreground mb-3">Thao tác nhanh</h2>
            <div className="flex flex-col gap-2">
              {QUICK_ACTIONS.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className={`block w-full text-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    a.primary
                      ? 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs shadow-primary/15'
                      : 'bg-muted text-foreground hover:bg-card-border'
                  }`}
                >
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Payment breakdown widget */}
          <div className="bg-card border border-card-border rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Dòng tiền tháng này</h2>
              <Link
                href="/payments"
                className="text-xs text-primary hover:text-primary-hover font-medium transition-colors"
              >
                Chi tiết →
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-soft-sage/40 border border-soft-sage flex items-center justify-between">
                <div>
                  <p className="text-xs text-soft-sage-foreground font-medium">Đã thực nhận</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">
                    {loading ? '…' : fmtCurrency(paymentStats?.monthRevenue ?? 0)}
                  </p>
                </div>
                <div className="text-xl">✅</div>
              </div>

              <div className="p-3 rounded-xl bg-warning/30 border border-warning/60 flex items-center justify-between">
                <div>
                  <p className="text-xs text-warning-foreground font-medium">Đang chờ thu</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">
                    {loading ? '…' : fmtCurrency(paymentStats?.pendingRevenue ?? 0)}
                  </p>
                </div>
                <div className="text-xl">⏳</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
