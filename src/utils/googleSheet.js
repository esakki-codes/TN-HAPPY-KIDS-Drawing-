// Google Sheet integration helper for TN Happy Kids Registrations

export const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit";

export const getGoogleScriptUrl = () => {
  return localStorage.getItem('google_sheet_webapp_url') || '';
};

export const setGoogleScriptUrl = (url) => {
  if (url) {
    localStorage.setItem('google_sheet_webapp_url', url.trim());
  } else {
    localStorage.removeItem('google_sheet_webapp_url');
  }
};

/**
 * Saves registration record to local storage master sheet array
 */
export const saveRegistrationToLocalStorageMaster = (record) => {
  try {
    const existing = JSON.parse(localStorage.getItem('tn_happy_kids_all_registrations') || '[]');
    const newRecord = {
      id: 'REG-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      ...record,
    };

    // Prevent duplicate entries for the same child & phone
    const filtered = existing.filter(
      (r) => !(r.childName === record.childName && r.parentPhone === record.parentPhone)
    );

    const updatedList = [newRecord, ...filtered];
    localStorage.setItem('tn_happy_kids_all_registrations', JSON.stringify(updatedList));
    return updatedList;
  } catch (err) {
    console.error('Error saving to master local storage sheet:', err);
    return [];
  }
};

/**
 * Get all registrations from local storage sheet
 */
export const getAllRegistrations = () => {
  try {
    return JSON.parse(localStorage.getItem('tn_happy_kids_all_registrations') || '[]');
  } catch (err) {
    return [];
  }
};

/**
 * Sends registration record to Google Sheet via Google Apps Script Web App Endpoint
 */
export const sendToGoogleSheet = async (registrationData) => {
  // Always save to master local storage sheet list first
  saveRegistrationToLocalStorageMaster(registrationData);

  const scriptUrl = getGoogleScriptUrl();
  if (!scriptUrl) {
    console.log('Google Apps Script Web App URL not configured yet. Record saved in Master Local Sheet.');
    return { success: true, localOnly: true };
  }

  const payload = {
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    childName: registrationData.childName || '',
    childDob: registrationData.childDob || '',
    childAge: registrationData.childAge || '',
    parentName: registrationData.parentName || '',
    parentPhone: registrationData.parentPhone || '',
    parentEmail: registrationData.parentEmail || '',
    drawingFileName: registrationData.drawingFileName || 'Uploaded',
    videoFileName: registrationData.videoFileName || 'Uploaded',
    rewardPoints: registrationData.rewardPoints || 100,
    status: registrationData.status || 'Registered',
  };

  try {
    // Send to local backend server endpoint
    fetch('/api/google-sheet-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => console.log('Backend logger fallback:', err));

    // Send data to Google Apps Script Web App if configured
    if (scriptUrl) {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors', // Avoid CORS issues with Google Apps Script redirect
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      console.log('Successfully submitted registration data to Google Sheet Webhook!');
    }
    return { success: true };
  } catch (err) {
    console.error('Error sending registration to Google Sheet Web App:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Convert all registrations array to downloadable CSV string
 */
export const exportRegistrationsToCSV = () => {
  const data = getAllRegistrations();
  if (data.length === 0) return;

  const headers = [
    'Registration ID',
    'Timestamp',
    'Child Name',
    'Date of Birth',
    'Age',
    'Parent Name',
    'WhatsApp Phone',
    'Parent Email',
    'Drawing File',
    'Video File',
    'Reward Points',
    'Status',
  ];

  const rows = data.map((r) => [
    `"${r.id || ''}"`,
    `"${r.timestamp || ''}"`,
    `"${r.childName || ''}"`,
    `"${r.childDob || ''}"`,
    `"${r.childAge || ''}"`,
    `"${r.parentName || ''}"`,
    `"${r.parentPhone || ''}"`,
    `"${r.parentEmail || ''}"`,
    `"${r.drawingFileName || 'Uploaded'}"`,
    `"${r.videoFileName || 'Uploaded'}"`,
    `"${r.rewardPoints || 100}"`,
    `"${r.status || 'Completed'}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `TN_Happy_Kids_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
