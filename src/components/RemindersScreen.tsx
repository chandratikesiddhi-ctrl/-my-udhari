import React, { useState } from 'react';
import { 
  BellRing, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  MessageSquare, 
  Phone, 
  Sparkles, 
  Clock, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Customer, ReminderJob, StoreProfile } from '../types';
import { formatCurrency, getInitials, generateReminderMessage, getWhatsAppUrl } from '../utils/formatters';

interface RemindersScreenProps {
  store: StoreProfile;
  customers: Customer[];
  reminderJobs: ReminderJob[];
  onTriggerBatchReminders: () => void;
  onSendSingleReminder: (jobId: string) => void;
  onRetryReminder: (jobId: string) => void;
  onSelectCustomer: (customerId: string) => void;
}

type TabMode = 'scheduled' | 'sent' | 'failed';

export const RemindersScreen: React.FC<RemindersScreenProps> = ({
  store,
  customers,
  reminderJobs,
  onTriggerBatchReminders,
  onSendSingleReminder,
  onRetryReminder,
  onSelectCustomer,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('scheduled');

  const scheduledJobs = reminderJobs.filter((r) => r.status === 'SCHEDULED');
  const sentJobs = reminderJobs.filter((r) => r.status === 'SENT' || r.status === 'DELIVERED');
  const failedJobs = reminderJobs.filter((r) => r.status === 'FAILED');

  // Calculate customers who have pending balance > 0 and reminders enabled
  const overdueCustomers = customers.filter((c) => {
    if (c.balance <= 0 || !c.reminderEnabled) return false;
    const lastDate = new Date(c.lastTransactionDate).getTime();
    const daysSince = (Date.now() - lastDate) / (1000 * 60 * 60 * 24);
    return daysSince >= (c.reminderIntervalDays || 8);
  });

  return (
    <main className="flex-1 px-4 py-4 flex flex-col gap-4 pb-28 max-w-md mx-auto w-full">
      {/* 8-Day Rule Hero Banner */}
      <div className="bg-gradient-to-br from-[#1a237e] to-[#000666] text-white rounded-2xl p-4 shadow-lg flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#8df5e4]/20 text-[#8df5e4] flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">8-Day Automated Reminders</h2>
              <p className="text-[11px] text-[#bdc2ff]">PRD Core Automated Follow-Up Engine</p>
            </div>
          </div>
          <span className="bg-[#8df5e4] text-[#00201c] text-[10px] font-bold px-2 py-0.5 rounded-full">
            Active
          </span>
        </div>

        <p className="text-xs text-[#e0e0ff] leading-relaxed">
          The system scans customer ledger records every 8 days and generates polite, respectful WhatsApp payment nudges with your store's UPI payment details.
        </p>

        <div className="flex items-center justify-between pt-1 border-t border-white/10">
          <div className="text-left">
            <span className="text-[10px] text-[#bdc2ff] block uppercase tracking-wider">Eligible Now</span>
            <span className="text-base font-bold font-display">{scheduledJobs.length} Customers</span>
          </div>

          <button
            id="btn-run-batch-reminders"
            onClick={onTriggerBatchReminders}
            disabled={scheduledJobs.length === 0}
            className="px-3.5 py-1.5 bg-[#8df5e4] hover:bg-[#70d8c8] text-[#00201c] text-xs font-bold rounded-xl shadow active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Process Reminders</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="grid grid-cols-3 bg-[#eceef1] p-1 rounded-xl gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`py-2 rounded-lg transition-all ${
            activeTab === 'scheduled'
              ? 'bg-white text-[#000666] shadow-sm'
              : 'text-[#454652] hover:text-[#191c1e]'
          }`}
        >
          Scheduled ({scheduledJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`py-2 rounded-lg transition-all ${
            activeTab === 'sent'
              ? 'bg-white text-[#000666] shadow-sm'
              : 'text-[#454652] hover:text-[#191c1e]'
          }`}
        >
          Sent ({sentJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('failed')}
          className={`py-2 rounded-lg transition-all ${
            activeTab === 'failed'
              ? 'bg-white text-[#000666] shadow-sm'
              : 'text-[#454652] hover:text-[#191c1e]'
          }`}
        >
          Failed ({failedJobs.length})
        </button>
      </div>

      {/* List content */}
      <div className="flex flex-col gap-2.5">
        {activeTab === 'scheduled' && (
          <>
            {scheduledJobs.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-[#c6c5d4]/40 text-center flex flex-col items-center justify-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#191c1e]">All Caught Up!</h4>
                <p className="text-xs text-[#767683] mt-1 max-w-[240px]">
                  No customers currently exceed the 8-day unpaid credit threshold.
                </p>
              </div>
            ) : (
              scheduledJobs.map((job) => (
                <div
                  key={job.id}
                  id={`reminder-job-${job.id}`}
                  className="bg-white rounded-2xl p-3.5 border border-[#c6c5d4]/50 shadow-sm flex flex-col gap-2.5 hover:border-[#1a237e]/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div 
                      onClick={() => onSelectCustomer(job.customerId)}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#e0e3e6] flex items-center justify-center font-bold text-sm text-[#191c1e] group-hover:bg-[#bdc2ff] transition-colors">
                        {getInitials(job.customerName)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#191c1e] group-hover:text-[#000666]">
                          {job.customerName}
                        </h4>
                        <p className="text-xs text-[#767683]">{job.phone}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-[#ba1a1a] font-display">
                        ₹ {formatCurrency(job.amount)}
                      </p>
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        8-Day Due
                      </span>
                    </div>
                  </div>

                  {/* Message Preview Quote */}
                  <div className="bg-[#f7f9fc] rounded-xl p-2.5 text-[11px] text-[#454652] italic border border-[#eceef1]">
                    "{job.messageText.split('\n')[0]} {job.messageText.split('\n')[1]}"
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1">
                    <a
                      href={getWhatsAppUrl(job.phone, job.messageText)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onSendSingleReminder(job.id)}
                      className="flex-1 bg-[#006b5f] hover:bg-[#00554c] text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Send WhatsApp</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'sent' && (
          <>
            {sentJobs.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-[#c6c5d4]/40 text-center text-[#767683] text-xs">
                No reminders sent in this session yet.
              </div>
            ) : (
              sentJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl p-3.5 border border-[#c6c5d4]/40 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#191c1e]">{job.customerName}</h4>
                      <p className="text-xs text-[#767683]">
                        Sent at {new Date(job.sentAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • WhatsApp
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-[#ba1a1a]">₹ {formatCurrency(job.amount)}</p>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                      Delivered
                    </span>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'failed' && (
          <>
            {failedJobs.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-[#c6c5d4]/40 text-center text-[#767683] text-xs">
                No failed reminder deliveries.
              </div>
            ) : (
              failedJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl p-3.5 border border-red-200 bg-red-50/30 shadow-sm flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-red-100 text-[#ba1a1a] flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#191c1e]">{job.customerName}</h4>
                        <p className="text-xs text-red-700 font-medium">{job.failureReason}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#ba1a1a]">₹ {formatCurrency(job.amount)}</span>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => onRetryReminder(job.id)}
                      className="px-3 py-1.5 bg-[#000666] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-[#1a237e] active:scale-95 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Delivery</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </main>
  );
};
