const STORAGE_KEY = "facturation-data-v1";

const translations = {
  fr: {
    appTitle: "Application de facturation",
    languageLabel: "Langue",
    newInvoice: "Créer une facture",
    client: "Client",
    description: "Description",
    amount: "Montant (MAD)",
    invoiceDate: "Date",
    create: "Créer",
    clients: "Liste clients",
    addClient: "Ajouter",
    dashboard: "Tableau de bord mensuel",
    totalInvoices: "Factures du mois",
    paidAmount: "Montant payé",
    unpaidAmount: "Montant non payé",
    invoices: "Factures",
    status: "Statut",
    actions: "Actions",
    paid: "Payé",
    unpaid: "Non payé",
    markPaid: "Marquer payé",
    markUnpaid: "Marquer non payé",
    sendWhatsApp: "Envoyer WhatsApp",
    delete: "Supprimer",
    noClients: "Aucun client",
  },
  ar: {
    appTitle: "تطبيق الفوترة",
    languageLabel: "اللغة",
    newInvoice: "إنشاء فاتورة",
    client: "العميل",
    description: "الوصف",
    amount: "المبلغ (درهم)",
    invoiceDate: "التاريخ",
    create: "إنشاء",
    clients: "قائمة العملاء",
    addClient: "إضافة",
    dashboard: "لوحة الإحصائيات الشهرية",
    totalInvoices: "فواتير هذا الشهر",
    paidAmount: "المبلغ المدفوع",
    unpaidAmount: "المبلغ غير المدفوع",
    invoices: "الفواتير",
    status: "الحالة",
    actions: "إجراءات",
    paid: "مدفوع",
    unpaid: "غير مدفوع",
    markPaid: "تحديد كمدفوع",
    markUnpaid: "تحديد كغير مدفوع",
    sendWhatsApp: "إرسال عبر واتساب",
    delete: "حذف",
    noClients: "لا يوجد عملاء",
  },
};

const state = loadState();
const languageEl = document.getElementById("language");
const invoiceForm = document.getElementById("invoiceForm");
const clientForm = document.getElementById("clientForm");
const invoiceClientEl = document.getElementById("invoiceClient");
const invoicesBody = document.getElementById("invoicesBody");
const clientsList = document.getElementById("clientsList");
const rowTemplate = document.getElementById("invoiceRowTemplate");

const statInvoices = document.getElementById("statInvoices");
const statPaid = document.getElementById("statPaid");
const statUnpaid = document.getElementById("statUnpaid");

init();

function init() {
  languageEl.value = state.language;
  document.getElementById("invoiceDate").valueAsDate = new Date();
  applyLanguage();
  renderAll();

  languageEl.addEventListener("change", () => {
    state.language = languageEl.value;
    applyLanguage();
    saveState();
    renderAll();
  });

  clientForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("clientName").value.trim();
    const phone = document.getElementById("clientPhone").value.trim();
    if (!name || !phone) return;

    state.clients.push({ id: crypto.randomUUID(), name, phone });
    clientForm.reset();
    saveState();
    renderAll();
  });

  invoiceForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!invoiceClientEl.value) return;

    const invoice = {
      id: crypto.randomUUID(),
      clientId: invoiceClientEl.value,
      description: document.getElementById("invoiceDescription").value.trim(),
      amount: Number(document.getElementById("invoiceAmount").value),
      date: document.getElementById("invoiceDate").value,
      paid: false,
      createdAt: new Date().toISOString(),
    };

    state.invoices.unshift(invoice);
    invoiceForm.reset();
    document.getElementById("invoiceDate").valueAsDate = new Date();
    saveState();
    renderAll();
  });
}

function applyLanguage() {
  const t = translations[state.language];
  document.documentElement.lang = state.language;
  document.documentElement.dir = state.language === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t[el.dataset.i18n] || el.textContent;
  });

  document.getElementById("clientName").placeholder = state.language === "ar" ? "اسم العميل" : "Nom";
  document.getElementById("clientPhone").placeholder =
    state.language === "ar" ? "واتساب (+212...)" : "WhatsApp (+212...)";
}

function renderAll() {
  renderClientSelect();
  renderClientsList();
  renderInvoices();
  renderStats();
}

function renderClientSelect() {
  invoiceClientEl.innerHTML = "";
  state.clients.forEach((client) => {
    const option = document.createElement("option");
    option.value = client.id;
    option.textContent = `${client.name} (${client.phone})`;
    invoiceClientEl.append(option);
  });
}

function renderClientsList() {
  const t = translations[state.language];
  clientsList.innerHTML = "";

  if (!state.clients.length) {
    const li = document.createElement("li");
    li.textContent = t.noClients;
    clientsList.append(li);
    return;
  }

  state.clients.forEach((client) => {
    const li = document.createElement("li");
    li.textContent = `${client.name} • ${client.phone}`;
    clientsList.append(li);
  });
}

function renderInvoices() {
  const t = translations[state.language];
  invoicesBody.innerHTML = "";

  state.invoices.forEach((invoice) => {
    const client = state.clients.find((item) => item.id === invoice.clientId);
    if (!client) return;

    const row = rowTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector(".col-client").textContent = client.name;
    row.querySelector(".col-description").textContent = invoice.description;
    row.querySelector(".col-amount").textContent = `${invoice.amount.toFixed(2)} MAD`;
    row.querySelector(".col-date").textContent = new Date(invoice.date).toLocaleDateString(state.language);

    const badge = document.createElement("span");
    badge.className = `badge ${invoice.paid ? "paid" : "unpaid"}`;
    badge.textContent = invoice.paid ? t.paid : t.unpaid;
    row.querySelector(".col-status").append(badge);

    const statusBtn = document.createElement("button");
    statusBtn.className = "status";
    statusBtn.textContent = invoice.paid ? t.markUnpaid : t.markPaid;
    statusBtn.addEventListener("click", () => {
      invoice.paid = !invoice.paid;
      saveState();
      renderAll();
    });

    const waBtn = document.createElement("button");
    waBtn.className = "whatsapp";
    waBtn.textContent = t.sendWhatsApp;
    waBtn.addEventListener("click", () => {
      const message = buildWhatsAppMessage(client, invoice);
      const phone = client.phone.replace(/[^\d+]/g, "").replace(/^0/, "212");
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "secondary";
    deleteBtn.textContent = t.delete;
    deleteBtn.addEventListener("click", () => {
      state.invoices = state.invoices.filter((item) => item.id !== invoice.id);
      saveState();
      renderAll();
    });

    row.querySelector(".actions").append(statusBtn, waBtn, deleteBtn);
    invoicesBody.append(row);
  });
}

function buildWhatsAppMessage(client, invoice) {
  if (state.language === "ar") {
    return `مرحبًا ${client.name}،\nفاتورة جديدة: ${invoice.description}\nالمبلغ: ${invoice.amount.toFixed(
      2
    )} درهم\nالتاريخ: ${invoice.date}`;
  }
  return `Bonjour ${client.name},\nNouvelle facture: ${invoice.description}\nMontant: ${invoice.amount.toFixed(
    2
  )} MAD\nDate: ${invoice.date}`;
}

function renderStats() {
  const now = new Date();
  const monthly = state.invoices.filter((invoice) => {
    const date = new Date(invoice.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const paid = monthly.filter((item) => item.paid).reduce((sum, item) => sum + item.amount, 0);
  const unpaid = monthly.filter((item) => !item.paid).reduce((sum, item) => sum + item.amount, 0);

  statInvoices.textContent = String(monthly.length);
  statPaid.textContent = `${paid.toFixed(2)} MAD`;
  statUnpaid.textContent = `${unpaid.toFixed(2)} MAD`;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      language: "fr",
      clients: [
        { id: crypto.randomUUID(), name: "Client Démo", phone: "+212600000000" },
        { id: crypto.randomUUID(), name: "مشتري تجريبي", phone: "+212611111111" },
      ],
      invoices: [],
    };
  }

  try {
    return JSON.parse(raw);
  } catch {
    return { language: "fr", clients: [], invoices: [] };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
