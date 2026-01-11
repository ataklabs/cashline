import { AlertTriangle, CheckCircle, DollarSign, Calendar } from "lucide-react";

export default function CashLine() {
  const cashToday = 18450;
  const dailyAvgSales = 3200;
  const weeklyPayroll = 9800;
  const nextRent = {
    amount: 7200,
    dueInDays: 6,
  };

  const daysUntilTrouble = 9;
  const status =
    daysUntilTrouble <= 5 ? "risk" : daysUntilTrouble <= 10 ? "watch" : "safe";

  const statusConfig = {
    safe: {
      label: "Safe",
      color: "text-green-600",
      bg: "bg-green-50",
      icon: CheckCircle,
    },
    watch: {
      label: "Watch",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      icon: AlertTriangle,
    },
    risk: {
      label: "Risk",
      color: "text-red-600",
      bg: "bg-red-50",
      icon: AlertTriangle,
    },
  };

  const StatusIcon = statusConfig[status].icon;

  const forecast = Array.from({ length: 14 }).map((_, i) => ({
    day: `Day ${i + 1}`,
    net: dailyAvgSales - 900,
  }));

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">CashLine</h1>
          <span className="text-sm text-gray-500">
            Daily Cash Survival
          </span>
        </header>

        {/* Status Card */}
        <div
          className={`rounded-xl p-4 ${statusConfig[status].bg} border`}
        >
          <div className="flex items-center gap-3">
            <StatusIcon className={`w-6 h-6 ${statusConfig[status].color}`} />
            <div>
              <p className="text-sm text-gray-600">Current Status</p>
              <p className={`text-lg font-semibold ${statusConfig[status].color}`}>
                {statusConfig[status].label}
              </p>
            </div>
          </div>

          <p className="mt-4 text-gray-800 font-medium">
            At this pace, cash becomes critical in{" "}
            <span className="font-bold">{daysUntilTrouble} days</span>.
          </p>
        </div>

        {/* Cash Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>Cash Today</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              ${cashToday.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Weekly Payroll</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              ${weeklyPayroll.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Upcoming Pressure */}
        <div className="bg-white rounded-xl p-4 border">
          <h2 className="font-semibold mb-3">Upcoming Pressure</h2>

          <div className="flex justify-between text-sm">
            <span>Rent due in {nextRent.dueInDays} days</span>
            <span className="font-semibold">
              ${nextRent.amount.toLocaleString()}
            </span>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            Combined payroll + rent will consume{" "}
            <span className="font-semibold">~92%</span> of current cash.
          </div>
        </div>

        {/* 14 Day Forecast */}
        <div className="bg-white rounded-xl p-4 border">
          <h2 className="font-semibold mb-3">Next 14 Days</h2>

          <div className="space-y-2">
            {forecast.map((day, i) => (
              <div
                key={i}
                className="flex justify-between text-sm border-b pb-1 last:border-b-0"
              >
                <span>{day.day}</span>
                <span
                  className={
                    day.net >= 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {day.net >= 0 ? "+" : "-"}${Math.abs(day.net)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
