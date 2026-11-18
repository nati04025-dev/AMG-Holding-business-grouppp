const SUPABASE_URL = "YOUR_PROJECT_URL";
const SUPABASE_KEY = "YOUR_PUBLISHABLE_KEY";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);const JOBS_STORAGE_KEY = "amg_holding_jobs_v1";
const APPLICANTS_STORAGE_KEY = "amg_holding_applicants_v1";

const DEFAULT_JOBS = [
  {
    id: "job-1",
    title: "Junior Accountant",
    department: "Finance",
    location: "Addis Ababa",
    type: "Full-time",
    description: "Support daily bookkeeping, ledger reconciliation, and financial reporting."
  },
  {
    id: "job-2",
    title: "HR Officer",
    department: "Human Resources",
    location: "Addis Ababa",
    type: "Full-time",
    description: "Manage recruitment pipelines, employee onboarding, and HR records."
  },
  {
    id: "job-3",
    title: "Operations Coordinator",
    department: "Operations",
    location: "Addis Ababa",
    type: "Full-time",
    description: "Coordinate cross-departmental workflows and operational schedules."
  }
];

function getJobs() {
  const raw = localStorage.getItem(JOBS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(DEFAULT_JOBS));
    return DEFAULT_JOBS;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_JOBS;
  } catch {
    return DEFAULT_JOBS;
  }
}

function getApplicants() {
  const raw = localStorage.getItem(APPLICANTS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveApplicant(applicant) {
  const current = getApplicants();
  current.unshift(applicant);
  localStorage.setItem(APPLICANTS_STORAGE_KEY, JSON.stringify(current));
}

const jobsListEl = document.getElementById("jobsList");
const searchInputEl = document.getElementById("searchInput");
const openRolesCountEl = document.getElementById("openRolesCount");
const positionSelectEl = document.getElementById("position");
const selectedJobLabelEl = document.getElementById("selectedJobLabel");
const clearSelectionBtn = document.getElementById("clearSelectionBtn");
const applicationFormEl = document.getElementById("applicationForm");
const formFeedbackEl = document.getElementById("formFeedback");

function populatePositionSelect(jobs) {
  const currentVal = positionSelectEl.value;
  positionSelectEl.innerHTML = `<option value="">-- Select Position --</option>`;
  jobs.forEach((job) => {
    const opt = document.createElement("option");
    opt.value = job.title;
    opt.textContent = `${job.title} (${job.department})`;
    positionSelectEl.appendChild(opt);
  });
  if (jobs.some((j) => j.title === currentVal)) {
    positionSelectEl.value = currentVal;
  }
}

function renderJobs(filterText = "") {
  const jobs = getJobs();
  openRolesCountEl.textContent = jobs.length;
  populatePositionSelect(jobs);

  const q = filterText.trim().toLowerCase();
  const filtered = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(q) ||
      job.department.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q)
  );

  if (!filtered.length) {
    jobsListEl.innerHTML = `<p class="muted">No matching job vacancies found.</p>`;
    return;
  }

  jobsListEl.innerHTML = filtered
    .map(
      (job) => `
      <article class="job-card">
        <div>
          <h4>${escapeHtml(job.title)}</h4>
          <div class="job-meta">
            <span>${escapeHtml(job.department)}</span>
            <span>${escapeHtml(job.location)}</span>
            <span>${escapeHtml(job.type || "Full-time")}</span>
          </div>
          <p class="muted" style="margin-top: 10px;">${escapeHtml(job.description || "")}</p>
        </div>
        <button type="button" class="btn btn-primary apply-role-btn" data-role="${escapeHtml(job.title)}">
          Apply Now
        </button>
      </article>
    `
    )
    .join("");

  document.querySelectorAll(".apply-role-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const role = btn.getAttribute("data-role");
      positionSelectEl.value = role;
      selectedJobLabelEl.textContent = `Applying for: ${role}`;
      clearSelectionBtn.classList.remove("hidden");
      document.getElementById("applySection").scrollIntoView({ behavior: "smooth" });
    });
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

clearSelectionBtn.addEventListener("click", () => {
  positionSelectEl.value = "";
  selectedJobLabelEl.textContent = "Select a job above or fill out your details below.";
  clearSelectionBtn.classList.add("hidden");
});

searchInputEl.addEventListener("input", (e) => {
  renderJobs(e.target.value);
});

applicationFormEl.addEventListener("submit", (e) => {
  e.preventDefault();
  formFeedbackEl.className = "feedback";
  formFeedbackEl.textContent = "";

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const position = positionSelectEl.value.trim();
  const experience = document.getElementById("experience").value.trim();
  const expectedSalary = document.getElementById("expectedSalary").value.trim();
  const coverLetter = document.getElementById("coverLetter").value.trim();
  const telegramVerificationCode = document
    .getElementById("telegramVerificationCode")
    .value.trim();

  if (
    !fullName ||
    !email ||
    !phone ||
    !position ||
    !experience ||
    !coverLetter ||
    !telegramVerificationCode
  ) {
    formFeedbackEl.classList.add("error");
    formFeedbackEl.textContent = "Please fill in all required fields.";
    return;
  }

  const newApplicant = {
    id: "app-" + Date.now(),
    fullName,
    email,
    phone,
    position,
    experience: Number(experience),
    expectedSalary: expectedSalary || "Not specified",
    coverLetter,
    telegramVerificationCode,
    status: "New",
    submittedAt: new Date().toLocaleString()
  };

  saveApplicant(newApplicant);
  applicationFormEl.reset();
  clearSelectionBtn.classList.add("hidden");
  selectedJobLabelEl.textContent = "Select a job above or fill out your details below.";

  formFeedbackEl.classList.add("success");
  formFeedbackEl.textContent = "Application submitted successfully! HR will review your profile.";
});

renderJobs();
