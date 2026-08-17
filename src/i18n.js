import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

const resources = {
  en: {
    translation: {
      greeting: 'Welcome',
      searchPlaceholder: 'Search doctors, specialties...',
      upcomingConsultation: 'Upcoming Consultation',
      startsIn: 'Starts in {{time}}',
      join: 'Join',
      browseSpecialty: 'Browse by Specialty',
      seeAll: 'See All',
      recentlyConsulted: 'Recently Consulted Doctors',
      book: 'Book Appointment',
      profile: 'View Profile',
      allSpecialties: 'All Specialties',
      searchSpecialties: 'Search specialties...',
      onlineNow: '• Online Now',
      patients: 'Patients',
      consults: 'Consults',
      yearsExp: 'Years Exp',
      onlineFee: 'Online',
      price: '₹{{value}}',
      about: 'About',
      consultationOptions: 'Consultation Options',

      speaks: 'SPEAKS',
      location: 'LOCATION',

      videoConsultation: 'Video Consultation',
      clinicVisit: 'Clinic Visit',
      videoSubtitle: 'Home · 30 min',
      clinicSubtitle: 'Apollo Clinic, Bandra W',

      bookAppointment: 'Book Appointment',

      doctorAbout:
        'Dr. Anita Sharma is a highly experienced General Physician with 12+ years of practice...',
      selectSlot: 'Select Slot',
      doctorName: 'Dr. Anita Sharma',
      generalPhysician: 'General Physician',

      videoMode: 'Video · ₹{{price}}',
      clinicMode: 'Clinic · ₹{{price}}',

      selectDate: 'Select Date',
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',

      videoNote: 'Dashed = booked. Booking confirmed only after payment.',
      clinicNote: 'Clinic Visit selected. You can pay online or at clinic.',

      selected: 'Selected',
      selectedSlot: '{{day}} {{date}} · {{time}} · {{mode}}',

      proceedPayment: 'Proceed to Payment',

      video: 'Video',
      clinic: 'Clinic',

      sun: 'SUN',
      mon: 'MON',
      tue: 'TUE',
      wed: 'WED',
      thu: 'THU',
      fri: 'FRI',
      sat: 'SAT',

      securePayment: 'Secure Payment',
      bookingSummary: 'Booking Summary',

      bookingMeta: '{{mode}} · {{date}} · {{time}}',

      consultationFee: 'Consultation fee',
      platformFee: 'Platform fee',
      total: 'Total',
      free: 'Free',

      paymentMethod: 'Payment Method',

      upi: 'UPI',
      upiDesc: 'PhonePe, Google Pay, BHIM',

      card: 'Credit / Debit Card',
      cardDesc: 'Visa, Mastercard, RuPay',

      netBanking: 'Net Banking',
      netBankingDesc: 'All major Indian banks',

      cashPayment: 'Cash Payment',
      cashDesc: 'Pay at clinic. No online payment needed',

      personToPerson: 'Person to Person',
      personDesc: 'Pay directly at clinic',

      paymentSecurityNote:
        'Secured by Razorpay. Booking confirmed only on webhook success.',

      payNow: 'Pay ₹{{value}}',

      bookingConfirmed: 'Booking Confirmed!',
      confirmationSent: 'WhatsApp + SMS confirmation sent',

      appointmentDate: '{{date}}',

      paymentSummary: '₹{{price}} · {{method}} · {{status}}',
      paid: 'Paid',

      joinInfo:
        'A Join button will appear in Appointments 15 minutes before your consultation starts.',

      viewAppointments: 'View Appointments',
      backToHome: 'Back to Home',

      appointments: 'Appointments',

      tab_all: 'All',
      tab_clinic: 'Clinic Visit',
      tab_upcoming: 'Upcoming',
      tab_completed: 'Completed',
      tab_cancelled: 'Cancelled',

      status_live: 'Live',
      status_scheduled: 'Scheduled',
      status_done: 'Done',
      status_cancelled: 'Cancelled',
      status_clinic: 'Clinic Visit',

      joinNow: 'Join Now',
      details: 'Details',
      cancel: 'Cancel',
      viewRx: 'View Rx',
      reconsult: 'Re-consult',

      refundText: 'Refund in Progress · ₹{{price}} · {{days}} days',
      clinicWait: '{{token}} Your token · Approx. wait ~{{time}} min',

      noAppointments: 'No appointments yet. Book your slot now!',

      cancelAppointment: 'Cancel Appointment?',
      cancelPolicy:
        'Cancellation must be made at least 15 minutes before your slot time.',
      refundPolicy: 'Refund eligibility is subject to admin review.',

      reason: 'REASON *',
      selectReason: 'Select reason',
      confirmCancellation: 'Confirm Cancellation',
      keepAppointment: 'Keep Appointment',

      reason_notAvailable: 'Not available at this time',
      reason_mistake: 'Booked by mistake',
      reason_doctorChanged: 'Doctor changed',
      reason_better: 'Feeling better',
      reason_other: 'Other',

      appointmentDetail: 'Appointment Detail',

      status_upcoming: 'Upcoming',
      dateTime: 'Date & Time',
      todayTime: 'Today · {{time}}',

      type: 'Type',
      amountPaid: 'Amount Paid',
      paymentMethodSummary: '₹{{price}} · {{method}}',

      bookingId: 'Booking ID',

      emergencyWarning:
        'If this is a medical emergency, stop and call 112.\nSymcure is for non-emergency consultations only.',

      consultationStartsIn: 'CONSULTATION STARTS IN',
      joinVideoConsultation: 'Join Video Consultation',

      reportsFiles: 'Reports & Files',
      upload: 'Upload',
      view: 'View',

      healthRecords: 'Health Records',

      prescriptions: 'Prescriptions',
      reports: 'Reports',

      viewPdf: 'View PDF',
      download: 'Download',
      share: 'Share',

      new: 'New',

      noRecords:
        'No records yet. Start by booking an appointment and getting your {{type}} here.',
      recordsInfo:
        'MoHFW 2020-compliant PDFs. Accessed via regenerable S3 signed URLs. Prescriptions are permanently accessible.',

      personalDetails: 'Personal Details',
      notificationPreferences: 'Notification Preferences',
      account: 'Account',

      fullName: 'FULL NAME',
      dob: 'DATE OF BIRTH',
      gender: 'GENDER',
      male: 'Male',
      email: 'EMAIL',
      mobile: 'MOBILE',
      aadhaar: 'AADHAAR',

      saveChanges: 'Save Changes',

      whatsapp: 'WhatsApp',
      whatsappDesc: 'Appointments, reminders, updates',

      sms: 'SMS',
      smsDesc: 'Required — cannot disable',

      reminder24hr: '24hr Reminders',
      reminderDesc: 'Upcoming appointment alerts',

      helpSupport: 'Help & Support',
      helpSupportDesc: 'FAQs, contact us',

      privacyData: 'Privacy & Data',
      privacyDesc: 'DPDP consent',

      signOut: 'Sign Out',
      signOutDesc: 'End your session',
    },
  },
  hi: {
    translation: {
      greeting: 'स्वागत है',
      searchPlaceholder: 'डॉक्टर, विशेषज्ञ खोजें...',
      upcomingConsultation: 'आगामी परामर्श',
      startsIn: '{{time}} में शुरू होगा',
      join: 'जॉइन करें',
      browseSpecialty: 'विशेषता के अनुसार देखें',
      seeAll: 'सभी देखें',
      recentlyConsulted: 'हाल ही में परामर्श किए गए डॉक्टर',
      book: 'बुक ₹{{price}}',
      profile: 'प्रोफ़ाइल',
      allSpecialties: 'सभी विशेषज्ञताएँ',
      searchSpecialties: 'विशेषज्ञ खोजें...',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
