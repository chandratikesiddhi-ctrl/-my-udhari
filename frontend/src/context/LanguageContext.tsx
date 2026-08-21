import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'mr';

export interface Translations {
  // Brand & Header
  appName: string;
  kiranaTag: string;
  staffBadge: string;
  notifications: string;

  // Navigation
  navHome: string;
  navCustomers: string;
  navReports: string;
  navReminders: string;
  navSettings: string;

  // Home Dashboard
  totalOutstanding: string;
  totalCollected: string;
  customersPending: string;
  accountsSettled: string;
  gaveCredit: string;
  gotPayment: string;
  gaveCreditDesc: string;
  gotPaymentDesc: string;
  recentActivity: string;
  viewAll: string;
  noTransactionsYet: string;
  startByRecording: string;
  eightDayAlertTitle: string;
  eightDayAlertDesc: string;
  viewRemindersBtn: string;
  youWillGet: string;
  youWillGive: string;
  settled: string;
  today: string;
  yesterday: string;
  justNow: string;

  // Customer List
  customersTitle: string;
  customersSubtitle: string;
  searchPlaceholder: string;
  clearSearch: string;
  foundCustomers: string;
  filterAll: string;
  filterHasBalance: string;
  filterSettled: string;
  filterAdvance: string;
  sortRecent: string;
  sortHighestDue: string;
  sortNameAZ: string;
  addNewCustomer: string;
  noCustomersFound: string;
  tryDifferentSearch: string;

  // Customer Details
  customerLedger: string;
  balanceDue: string;
  advanceBalance: string;
  accountSettled: string;
  autoReminders8Day: string;
  autoRemindersDesc: string;
  filterAllTx: string;
  filterGave: string;
  filterGot: string;
  callCustomer: string;
  sendReminder: string;
  deleteCustomer: string;
  deleteConfirm: string;
  noTxForFilter: string;

  // Transaction Modal
  recordCreditTitle: string;
  recordPaymentTitle: string;
  enterAmount: string;
  selectCustomer: string;
  searchCustomerPlaceholder: string;
  noteOptional: string;
  quickNotes: string;
  saveCredit: string;
  savePayment: string;
  cancel: string;
  currentBalanceLabel: string;
  newBalanceLabel: string;

  // Add Customer Modal
  addCustomerTitle: string;
  customerNameLabel: string;
  customerPhoneLabel: string;
  openingBalanceLabel: string;
  enable8DayAutoReminder: string;
  notesLabel: string;
  saveCustomerBtn: string;

  // Reminders Screen
  remindersTitle: string;
  remindersSubtitle: string;
  autoRemindersActive: string;
  scheduledQueue: string;
  sentHistory: string;
  failedRetries: string;
  processBatchBtn: string;
  sendNow: string;
  retry: string;
  noScheduledReminders: string;
  allBalancesUpToDate: string;

  // Reminder Modal
  sendPaymentReminderTitle: string;
  recipient: string;
  dueBalance: string;
  standardTemplate: string;
  copyText: string;
  copied: string;
  sendViaWhatsApp: string;
  sendViaSMS: string;
  respectfulPolicyNote: string;

  // Reports
  businessReportsTitle: string;
  businessReportsSubtitle: string;
  exportCSV: string;
  totalCreditGiven: string;
  customerBase: string;
  registered: string;
  sixMonthChartTitle: string;
  sixMonthChartSubtitle: string;
  recoveryRateLabel: string;
  creditAgingTitle: string;
  followUpHealth: string;
  topOutstandingTitle: string;
  creditGivenLabel: string;
  paymentReceivedLabel: string;

  // Settings
  storeSettingsTitle: string;
  storeSettingsSubtitle: string;
  storeProfileSection: string;
  storeNameLabel: string;
  ownerNameLabel: string;
  storeContactLabel: string;
  storeAddressLabel: string;
  upiIdLabel: string;
  showQR: string;
  hideQR: string;
  automatedReminderRules: string;
  enableAutoReminders: string;
  defaultReminderInterval: string;
  activeRoleSimulation: string;
  ownerRole: string;
  staffRole: string;
  saveChanges: string;
  dataManagement: string;
  backupLedger: string;
  resetDemo: string;
  auditLogs: string;
  languageSelect: string;
  // Backup banner translations
  lastBackupDateLabel: string;
  backupOverdueTitle: string;
  backupOverdueDesc: string;
  backupUpToDateTitle: string;
  backupUpToDateDesc: string;
  downloadNewBackupBtn: string;
  backupOverdueBadge: string;
  backupFreshBadge: string;
  noBackupYet: string;
  daysAgoText: string;
  // User Login & Session translations
  userLogin: string;
  login: string;
  logout: string;
  switchUser: string;
  loggedInAs: string;
  enterMobile: string;
  getOtp: string;
  enterOtp: string;
  verifyLogin: string;
  quickLoginProfiles: string;
  ownerAccount: string;
  staffAccount: string;
  customerPassbook: string;
  loginSuccessful: string;
  loggedOutMsg: string;
  selectRole: string;
  // Customer Login Page specific
  customerLoginTitle: string;
  customerLoginSubtitle: string;
  enterMobileNumber: string;
  mobilePlaceholder: string;
  sendOtpBtn: string;
  otpSentTo: string;
  enter4DigitOtp: string;
  verifyAndLoginBtn: string;
  resendOtp: string;
  invalidMobileErr: string;
  customerNotFoundErr: string;
  invalidOtpErr: string;
  storeStaffLoginLink: string;
  switchToCustomerLogin: string;
  // Customer Passbook Dashboard
  customerPassbookTitle: string;
  customerPassbookSubtitle: string;
  yourCurrentBalance: string;
  youOweToStore: string;
  storeOwesYou: string;
  allClear: string;
  totalPaidSoFar: string;
  totalCreditTaken: string;
  storeDetails: string;
  payStoreViaUpi: string;
  scanToPay: string;
  transactionHistory: string;
  filterCreditTx: string;
  filterPaymentTx: string;
  downloadPassbook: string;
  contactStore: string;
  quickTestCustomerHint: string;
  staffLoginTitle: string;
  staffLoginSubtitle: string;
  enterStaffPin: string;
  loginToStoreLedger: string;
  // Additional shared aliases
  customerName: string;
  phoneNumber: string;
  currentBalance: string;
  addNoteOptional: string;
  amount: string;
  confirmCredit: string;
  confirmPayment: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    customerName: 'Customer Full Name',
    phoneNumber: 'Phone Number (WhatsApp)',
    currentBalance: 'Current Balance',
    addNoteOptional: 'Add Note (Optional)',
    amount: 'Amount',
    confirmCredit: 'Confirm Credit',
    confirmPayment: 'Confirm Payment',

    appName: 'My Udhari',
    kiranaTag: 'Kirana Store',
    staffBadge: 'Staff',
    notifications: 'Notifications',

    navHome: 'Home',
    navCustomers: 'Customers',
    navReports: 'Reports',
    navReminders: 'Reminders',
    navSettings: 'Settings',

    totalOutstanding: 'Total Outstanding',
    totalCollected: 'Total Collected',
    customersPending: 'customers pending',
    accountsSettled: 'accounts settled',
    gaveCredit: 'Gave Credit',
    gotPayment: 'Got Payment',
    gaveCreditDesc: 'Record udhari / balance',
    gotPaymentDesc: 'Record cash or UPI payment',
    recentActivity: 'Recent Transactions',
    viewAll: 'View All',
    noTransactionsYet: 'No transactions recorded yet.',
    startByRecording: 'Start by giving credit or recording a payment.',
    eightDayAlertTitle: '8-Day Reminders Ready',
    eightDayAlertDesc: 'customers have unpaid balances over 8 days.',
    viewRemindersBtn: 'Review & Send',
    youWillGet: 'You will get',
    youWillGive: 'You will give',
    settled: 'Settled',
    today: 'Today',
    yesterday: 'Yesterday',
    justNow: 'Just now',

    customersTitle: 'Customers',
    customersSubtitle: 'Manage customer credit accounts',
    searchPlaceholder: 'Search customers by name or phone...',
    clearSearch: 'Clear Search',
    foundCustomers: 'Found customers',
    filterAll: 'All',
    filterHasBalance: 'Has Balance',
    filterSettled: 'Settled',
    filterAdvance: 'Advance',
    sortRecent: 'Recent Activity',
    sortHighestDue: 'Highest Due',
    sortNameAZ: 'Name (A to Z)',
    addNewCustomer: 'Add Customer',
    noCustomersFound: 'No customers found',
    tryDifferentSearch: 'Try adjusting your search query or add a new customer.',

    customerLedger: 'Customer Ledger',
    balanceDue: 'Balance Due',
    advanceBalance: 'Advance Balance',
    accountSettled: 'Account is Settled',
    autoReminders8Day: '8-Day Automated Reminders',
    autoRemindersDesc: 'Polite reminder generated after 8 days of unpaid balance',
    filterAllTx: 'All',
    filterGave: 'You Gave',
    filterGot: 'You Got',
    callCustomer: 'Call Customer',
    sendReminder: 'Send Reminder',
    deleteCustomer: 'Delete Customer',
    deleteConfirm: 'Are you sure you want to delete this customer and their entire ledger history?',
    noTxForFilter: 'No transactions found for this filter.',

    recordCreditTitle: 'Record Credit (You Gave)',
    recordPaymentTitle: 'Record Payment (You Got)',
    enterAmount: 'Enter Amount',
    selectCustomer: 'Select Customer',
    searchCustomerPlaceholder: 'Search customer...',
    noteOptional: 'Note / Items (Optional)',
    quickNotes: 'Quick Items:',
    saveCredit: 'Save Credit (₹)',
    savePayment: 'Save Payment (₹)',
    cancel: 'Cancel',
    currentBalanceLabel: 'Current Balance',
    newBalanceLabel: 'New Balance',

    addCustomerTitle: 'Add New Customer',
    customerNameLabel: 'Customer Full Name *',
    customerPhoneLabel: 'Mobile Phone Number *',
    openingBalanceLabel: 'Opening Balance (₹)',
    enable8DayAutoReminder: 'Enable 8-Day Auto Reminders',
    notesLabel: 'Address or Notes (Optional)',
    saveCustomerBtn: 'Add Customer to Ledger',

    remindersTitle: 'Automated Reminders',
    remindersSubtitle: '8-day smart reminder engine',
    autoRemindersActive: '8-Day Reminders Active',
    scheduledQueue: 'Scheduled',
    sentHistory: 'Sent History',
    failedRetries: 'Failed',
    processBatchBtn: 'Process & Send All Scheduled',
    sendNow: 'Send Now',
    retry: 'Retry',
    noScheduledReminders: 'No scheduled reminders.',
    allBalancesUpToDate: 'All customer balances are up to date or under 8 days.',

    sendPaymentReminderTitle: 'Send Payment Reminder',
    recipient: 'Recipient',
    dueBalance: 'Due Balance',
    standardTemplate: 'Standard Reminder Template',
    copyText: 'Copy Text',
    copied: 'Copied!',
    sendViaWhatsApp: 'Send via WhatsApp',
    sendViaSMS: 'Send via Regular SMS',
    respectfulPolicyNote: 'Template follows respectful tone policy without threatening language.',

    businessReportsTitle: 'Business Reports',
    businessReportsSubtitle: 'Credit recovery & ledger analytics',
    exportCSV: 'Export CSV',
    totalCreditGiven: 'Total Credit Given',
    customerBase: 'Customer Base',
    registered: 'registered',
    sixMonthChartTitle: '6-Month Credit vs. Payments',
    sixMonthChartSubtitle: 'Monthly given credit vs. cash/UPI collected',
    recoveryRateLabel: 'Recovery',
    creditAgingTitle: 'Credit Aging (8-Day Cycles)',
    followUpHealth: 'Follow-Up Health',
    topOutstandingTitle: 'Top Outstanding Balances',
    creditGivenLabel: 'Credit Given',
    paymentReceivedLabel: 'Payments Received',

    storeSettingsTitle: 'Store Settings',
    storeSettingsSubtitle: 'Profile, reminders & data control',
    storeProfileSection: 'Store Profile',
    storeNameLabel: 'Store / Shop Name',
    ownerNameLabel: 'Owner Name',
    storeContactLabel: 'Store Contact Phone',
    storeAddressLabel: 'Store Address',
    upiIdLabel: 'UPI ID (for Customer Payments)',
    showQR: 'Show QR',
    hideQR: 'Hide QR',
    automatedReminderRules: 'Automated Reminder Rules',
    enableAutoReminders: 'Enable Auto Reminders',
    defaultReminderInterval: 'Default Reminder Interval',
    activeRoleSimulation: 'Active Role Simulation',
    ownerRole: 'Store Owner (Full Access)',
    staffRole: 'Store Staff (Transactions Only)',
    saveChanges: 'Save Changes',
    dataManagement: 'Data & Diagnostics',
    backupLedger: 'Backup Ledger',
    resetDemo: 'Reset Demo',
    auditLogs: 'Audit & Activity Logs',
    languageSelect: 'App Language / भाषा',
    lastBackupDateLabel: 'Last Backup Date',
    backupOverdueTitle: 'Backup Recommended',
    backupOverdueDesc: 'Your last backup was downloaded more than 7 days ago. Download a fresh backup to secure your customer ledger records.',
    backupUpToDateTitle: 'Ledger Backup Up-to-Date',
    backupUpToDateDesc: 'Your ledger backup was downloaded recently. Your customer data is safe.',
    downloadNewBackupBtn: 'Download New Backup (JSON)',
    backupOverdueBadge: 'Overdue (> 7 Days)',
    backupFreshBadge: 'Secured',
    noBackupYet: 'Never backed up',
    daysAgoText: 'days ago',
    userLogin: 'User Login & Account',
    login: 'Login',
    logout: 'Logout',
    switchUser: 'Switch User',
    loggedInAs: 'Logged in as',
    enterMobile: 'Mobile Number',
    getOtp: 'Send OTP',
    enterOtp: '4-Digit OTP / PIN',
    verifyLogin: 'Verify & Sign In',
    quickLoginProfiles: 'Quick Login Profiles',
    ownerAccount: 'Store Owner',
    staffAccount: 'Staff / Munim',
    customerPassbook: 'Customer Passbook',
    loginSuccessful: 'Signed in successfully!',
    loggedOutMsg: 'Signed out successfully',
    selectRole: 'Select Role',
    // Customer Login Page specific
    customerLoginTitle: 'Customer Login',
    customerLoginSubtitle: 'Login to view your Udhari balance and transaction history.',
    enterMobileNumber: 'Mobile Number',
    mobilePlaceholder: 'Enter 10-digit mobile number',
    sendOtpBtn: 'Send OTP',
    otpSentTo: 'OTP sent to',
    enter4DigitOtp: 'Enter 4-Digit OTP',
    verifyAndLoginBtn: 'Verify & Login',
    resendOtp: 'Resend OTP',
    invalidMobileErr: 'Please enter a valid 10-digit mobile number.',
    customerNotFoundErr: 'No customer account found for this mobile number. Please check or contact your shopkeeper.',
    invalidOtpErr: 'Invalid OTP. Please check the code and try again.',
    storeStaffLoginLink: 'Store Owner / Staff Login',
    switchToCustomerLogin: 'Customer Login',
    // Customer Passbook Dashboard
    customerPassbookTitle: 'Customer Passbook',
    customerPassbookSubtitle: 'Digital Khata & Account Statement',
    yourCurrentBalance: 'Current Udhari Balance',
    youOweToStore: 'You Owe to Store',
    storeOwesYou: 'Advance / Store Owes You',
    allClear: 'All Settled (No Pending Balance)',
    totalPaidSoFar: 'Total Paid So Far',
    totalCreditTaken: 'Total Udhari Purchases',
    storeDetails: 'Store Information',
    payStoreViaUpi: 'Pay Dues Online via UPI',
    scanToPay: 'Scan QR code to pay your pending dues directly',
    transactionHistory: 'Transaction & Payment History',
    filterCreditTx: 'Udhari (Credit)',
    filterPaymentTx: 'Payment ( जमा )',
    downloadPassbook: 'Download Statement',
    contactStore: 'Call Shopkeeper',
    quickTestCustomerHint: 'Registered numbers in store ledger',
    staffLoginTitle: 'Store Owner & Staff Login',
    staffLoginSubtitle: 'Sign in to access store ledger and udhari management',
    enterStaffPin: 'Enter PIN / Passcode',
    loginToStoreLedger: 'Sign In to Store Ledger',
  },
  mr: {
    customerName: 'ग्राहकाचे पूर्ण नाव',
    phoneNumber: 'मोबाईल नंबर (WhatsApp)',
    currentBalance: 'सध्याची बाकी',
    addNoteOptional: 'टिप / मालाचा तपशील (ऐच्छिक)',
    amount: 'रक्कम',
    confirmCredit: 'उधारी नोंदवा',
    confirmPayment: 'पेमेंट नोंदवा',

    appName: 'माय उधारी',
    kiranaTag: 'किराणा दुकान',
    staffBadge: 'कर्मचारी',
    notifications: 'सूचना',

    navHome: 'मुख्य',
    navCustomers: 'ग्राहक',
    navReports: 'अहवाल',
    navReminders: 'आठवणी',
    navSettings: 'सेटिंग्ज',

    totalOutstanding: 'एकूण येणे बाकी',
    totalCollected: 'एकूण जमा रक्कम',
    customersPending: 'ग्राहकांची उधारी बाकी',
    accountsSettled: 'खाती पूर्ण चुकता',
    gaveCredit: 'उधारी दिली',
    gotPayment: 'रक्कम मिळाली',
    gaveCreditDesc: 'ग्राहकाला उधारीवर माल दिला',
    gotPaymentDesc: 'रोख किंवा UPI पेमेंट जमा करा',
    recentActivity: 'अलीकडील व्यवहार',
    viewAll: 'सर्व पहा',
    noTransactionsYet: 'अद्याप कोणतेही व्यवहार नाहीत.',
    startByRecording: 'उधारी देऊन किंवा पेमेंट जमा करून सुरुवात करा.',
    eightDayAlertTitle: '८-दिवसीय आठवण तयार',
    eightDayAlertDesc: 'ग्राहकांची उधारी ८ दिवसांपेक्षा जास्त काळ बाकी आहे.',
    viewRemindersBtn: 'तपासा आणि पाठवा',
    youWillGet: 'येणे बाकी',
    youWillGive: 'देणे बाकी',
    settled: 'चुकता',
    today: 'आज',
    yesterday: 'काल',
    justNow: 'आत्ताच',

    customersTitle: 'ग्राहक यादी',
    customersSubtitle: 'ग्राहकांचे उधारी खाते व्यवस्थापन',
    searchPlaceholder: 'नावाने किंवा फोन नंबरने शोधा...',
    clearSearch: 'शोध साफ करा',
    foundCustomers: 'ग्राहक सापडले',
    filterAll: 'सर्व',
    filterHasBalance: 'उधारी बाकी',
    filterSettled: 'चुकता',
    filterAdvance: 'अ‍ॅडव्हान्स',
    sortRecent: 'अलीकडील व्यवहार',
    sortHighestDue: 'सर्वात जास्त बाकी',
    sortNameAZ: 'नावानुसार (अ ते ज्ञ / A-Z)',
    addNewCustomer: 'नवीन ग्राहक जोडा',
    noCustomersFound: 'ग्राहक सापडला नाही',
    tryDifferentSearch: 'कृपया दुसरे नाव शोधा किंवा नवीन ग्राहक जोडा.',

    customerLedger: 'ग्राहक खातेवही',
    balanceDue: 'येणे बाकी रक्कम',
    advanceBalance: 'अ‍ॅडव्हान्स जमा',
    accountSettled: 'खाते चुकता झाले आहे',
    autoReminders8Day: '८-दिवसीय स्वयंचलित आठवण',
    autoRemindersDesc: '८ दिवस उधारी न भरल्यास आपोआप आठवण मेसेज तयार होतो',
    filterAllTx: 'सर्व',
    filterGave: 'दिलेली उधारी',
    filterGot: 'मिळालेली रक्कम',
    callCustomer: 'फोन करा',
    sendReminder: 'मेसेज पाठवा',
    deleteCustomer: 'ग्राहक हटवा',
    deleteConfirm: 'तुम्हाला नक्की हा ग्राहक आणि त्यांचे सर्व व्यवहार हटवायचे आहेत का?',
    noTxForFilter: 'या फिल्टरसाठी कोणतेही व्यवहार नाहीत.',

    recordCreditTitle: 'उधारी नोंदवा (दिली)',
    recordPaymentTitle: 'पेमेंट नोंदवा (मिळाले)',
    enterAmount: 'रक्कम टाका',
    selectCustomer: 'ग्राहक निवडा',
    searchCustomerPlaceholder: 'ग्राहक शोधा...',
    noteOptional: 'मालाचा तपशील / टिप (ऐच्छिक)',
    quickNotes: 'झटपट निवडा:',
    saveCredit: 'उधारी सेव्ह करा (₹)',
    savePayment: 'पेमेंट सेव्ह करा (₹)',
    cancel: 'रद्द करा',
    currentBalanceLabel: 'सध्याची बाकी',
    newBalanceLabel: 'नवीन बाकी',

    addCustomerTitle: 'नवीन ग्राहक नोंदणी',
    customerNameLabel: 'ग्राहकाचे पूर्ण नाव *',
    customerPhoneLabel: 'मोबाईल नंबर *',
    openingBalanceLabel: 'सुरुवातीची उधारी बाकी (₹)',
    enable8DayAutoReminder: '८-दिवसीय स्वयंचलित मेसेज सुरू करा',
    notesLabel: 'पत्ता किंवा टिप (ऐच्छिक)',
    saveCustomerBtn: 'ग्राहक सेव्ह करा',

    remindersTitle: 'स्वयंचलित आठवणी',
    remindersSubtitle: '८-दिवसीय स्मार्ट रिमाइंडर सिस्टीम',
    autoRemindersActive: '८-दिवसीय सिस्टीम सुरू आहे',
    scheduledQueue: 'पाठवायचे बाकी',
    sentHistory: 'पाठवलेले मेसेज',
    failedRetries: 'अयशस्वी',
    processBatchBtn: 'सर्व बाकी मेसेज पाठवा',
    sendNow: 'आत्ता पाठवा',
    retry: 'पुन्हा प्रयत्न करा',
    noScheduledReminders: 'पाठवण्यासाठी मेसेज शिल्लक नाहीत.',
    allBalancesUpToDate: 'सर्व ग्राहकांचे व्यवहार अद्ययावत आहेत किंवा ८ दिवसांच्या आत आहेत.',

    sendPaymentReminderTitle: 'पेमेंटची आठवण पाठवा',
    recipient: 'ग्राहक',
    dueBalance: 'एकूण बाकी',
    standardTemplate: 'मानक मेसेज टेम्पलेट',
    copyText: 'मजकूर कॉपी करा',
    copied: 'कॉपी झाले!',
    sendViaWhatsApp: 'WhatsApp द्वारे पाठवा',
    sendViaSMS: 'साध्या SMS द्वारे पाठवा',
    respectfulPolicyNote: 'मेसेज आदरयुक्त भाषेत आणि सन्मानपूर्वक पाठवला जातो.',

    businessReportsTitle: 'व्यवसाय अहवाल',
    businessReportsSubtitle: 'उधारी वसुली आणि जमा-खर्च विश्लेषण',
    exportCSV: 'CSV डाउनलोड करा',
    totalCreditGiven: 'एकूण दिलेली उधारी',
    customerBase: 'एकूण ग्राहक',
    registered: 'नोंदणीकृत',
    sixMonthChartTitle: '६ महिन्यांची उधारी वि. वसुली',
    sixMonthChartSubtitle: 'दर महिन्याला दिलेली उधारी वि. गोळा झालेली रक्कम',
    recoveryRateLabel: 'वसुली दर',
    creditAgingTitle: 'उधारी कालावधी (८-दिवसीय चक्र)',
    followUpHealth: 'वसुली स्थिती',
    topOutstandingTitle: 'सर्वाधिक बाकी असलेले ग्राहक',
    creditGivenLabel: 'दिलेली उधारी',
    paymentReceivedLabel: 'मिळालेली रक्कम',

    storeSettingsTitle: 'दुकान सेटिंग्ज',
    storeSettingsSubtitle: 'प्रोफाइल, रिमाइंडर्स आणि डेटा नियंत्रण',
    storeProfileSection: 'दुकान प्रोफाइल',
    storeNameLabel: 'दुकानाचे नाव',
    ownerNameLabel: 'मालकाचे नाव',
    storeContactLabel: 'संपर्क मोबाईल नंबर',
    storeAddressLabel: 'दुकानाचा पत्ता',
    upiIdLabel: 'UPI आयडी (ग्राहक पेमेंटसाठी)',
    showQR: 'QR कोड पहा',
    hideQR: 'QR कोड लपवा',
    automatedReminderRules: 'स्वयंचलित रिमाइंडर नियम',
    enableAutoReminders: 'ऑटो रिमाइंडर्स सुरू करा',
    defaultReminderInterval: 'रिमाइंडर कालावधी (दिवस)',
    activeRoleSimulation: 'वापरकर्ता रोल (भूमिका)',
    ownerRole: 'दुकान मालक (पूर्ण अधिकार)',
    staffRole: 'कर्मचारी (केवळ व्यवहार नोंदणी)',
    saveChanges: 'बदल सेव्ह करा',
    dataManagement: 'डेटा आणि बॅकअप',
    backupLedger: 'खातेवही बॅकअप डाउनलोड',
    resetDemo: 'डेमो डेटा रीसेट करा',
    auditLogs: 'क्रियाकलाप लॉग्स (Audit Logs)',
    languageSelect: 'अ‍ॅप भाषा / Language',
    lastBackupDateLabel: 'शेवटच्या बॅकअपची तारीख',
    backupOverdueTitle: 'नवीन बॅकअप आवश्यक आहे',
    backupOverdueDesc: 'शेवटचा बॅकअप घेऊन ७ दिवसांपेक्षा जास्त कालावधी झाला आहे. आपली उधारी व जमा खाती सुरक्षित ठेवण्यासाठी नवीन बॅकअप डाउनलोड करा.',
    backupUpToDateTitle: 'खातेवही बॅकअप अद्ययावत आहे',
    backupUpToDateDesc: 'आपला बॅकअप नुकताच घेतला गेला आहे. आपला ग्राहक डेटा सुरक्षित आहे.',
    downloadNewBackupBtn: 'नवीन बॅकअप डाउनलोड करा (JSON)',
    backupOverdueBadge: '७ दिवसांपेक्षा जुना',
    backupFreshBadge: 'सुरक्षित',
    noBackupYet: 'अद्याप बॅकअप घेतलेला नाही',
    daysAgoText: 'दिवसांपूर्वी',
    userLogin: 'वापरकर्ता लॉगिन व खाते',
    login: 'लॉगिन',
    logout: 'लॉगआउट',
    switchUser: 'वापरकर्ता बदला',
    loggedInAs: 'सध्याचे लॉगिन',
    enterMobile: 'मोबाईल नंबर',
    getOtp: 'OTP पाठवा',
    enterOtp: '४ अंकी OTP / पिन',
    verifyLogin: 'सत्यापित करून लॉगिन करा',
    quickLoginProfiles: 'जलद लॉगिन प्रोफाईल',
    ownerAccount: 'दुकान मालक',
    staffAccount: 'कर्मचारी / मुनीम',
    customerPassbook: 'ग्राहक खातेवही',
    loginSuccessful: 'लॉगिन यशस्वी झाले!',
    loggedOutMsg: 'लॉगआउट यशस्वी झाले',
    selectRole: 'भूमिका निवडा',
    // Customer Login Page specific
    customerLoginTitle: 'ग्राहक लॉगिन',
    customerLoginSubtitle: 'आपली उधारी शिल्लक आणि व्यवहारांचा इतिहास पाहण्यासाठी लॉगिन करा.',
    enterMobileNumber: 'मोबाईल नंबर',
    mobilePlaceholder: '१० अंकी मोबाईल नंबर टाका',
    sendOtpBtn: 'OTP पाठवा',
    otpSentTo: 'या नंबरवर OTP पाठवला:',
    enter4DigitOtp: '४ अंकी OTP टाका',
    verifyAndLoginBtn: 'सत्यापित करा आणि लॉगिन करा',
    resendOtp: 'पुन्हा OTP पाठवा',
    invalidMobileErr: 'कृपया वैध १० अंकी मोबाईल नंबर टाका.',
    customerNotFoundErr: 'या मोबाईल नंबरवर कोणतेही खाते आढळले नाही. कृपया नंबर तपासा किंवा दुकानदाराशी संपर्क साधा.',
    invalidOtpErr: 'अवैध OTP. कृपया कोड तपासून पुन्हा टाका.',
    storeStaffLoginLink: 'दुकानदार / कर्मचारी लॉगिन',
    switchToCustomerLogin: 'ग्राहक लॉगिन',
    // Customer Passbook Dashboard
    customerPassbookTitle: 'ग्राहक पासबुक',
    customerPassbookSubtitle: 'डिजिटल खातेवही व व्यवहार विवरण',
    yourCurrentBalance: 'सध्याची उधारी बाकी',
    youOweToStore: 'आपणास दुकानाला द्यायची बाकी',
    storeOwesYou: 'अ‍ॅडव्हान्स / दुकानाकडे जमा',
    allClear: 'सर्व हिशोब पूर्ण (शिल्लक नाही)',
    totalPaidSoFar: 'आतापर्यंत एकूण जमा केलेली रक्कम',
    totalCreditTaken: 'एकूण उधारी खरेदी',
    storeDetails: 'दुकान माहिती',
    payStoreViaUpi: 'UPI द्वारे ऑनलाईन पैसे भरा',
    scanToPay: 'बाकी रक्कम भरण्यासाठी QR कोड स्कॅन करा',
    transactionHistory: 'व्यवहार आणि पेमेंट इतिहास',
    filterCreditTx: 'उधारी (Credit)',
    filterPaymentTx: 'जमा रक्कम (Payment)',
    downloadPassbook: 'खाते विवरण डाउनलोड करा',
    contactStore: 'दुकानदाराला फोन करा',
    quickTestCustomerHint: 'खातेवहीत नोंदणीकृत मोबाईल नंबर',
    staffLoginTitle: 'दुकानदार व कर्मचारी लॉगिन',
    staffLoginSubtitle: 'दुकान खातेवही आणि उधारी व्यवस्थापनासाठी लॉगिन करा',
    enterStaffPin: 'पिन / पासवर्ड टाका',
    loginToStoreLedger: 'दुकान खातेवहीत प्रवेश करा',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  generateLocalizedReminder: (customerName: string, amount: number, shopName: string, upiId?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'my_udhari_language_v1';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return saved === 'mr' ? 'mr' : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const t = translations[language];

  const generateLocalizedReminder = (
    customerName: string,
    amount: number,
    shopName: string,
    upiId?: string
  ): string => {
    if (language === 'mr') {
      let msg = `नमस्कार ${customerName},\n${shopName} कडे तुमची ₹${amount.toLocaleString('en-IN')} ची उधारी बाकी आहे. कृपया लवकरात लवकर पेमेंट करावे ही विनंती. धन्यवाद!`;
      if (upiId) {
        msg += `\n\nUPI द्वारे पेमेंट करा: ${upiId}`;
      }
      return msg;
    }

    let msg = `Hello ${customerName},\nYour outstanding balance of ₹${amount.toLocaleString('en-IN')} is pending with ${shopName}. Please make the payment at your convenience. Thank you.`;
    if (upiId) {
      msg += `\n\nPay via UPI: ${upiId}`;
    }
    return msg;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        generateLocalizedReminder,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
