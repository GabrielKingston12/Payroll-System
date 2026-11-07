// --- Default (Permanent) Employees ---
let defaultEmployees = [
  { id: 1, name: "Reinier Kyle", rate: 9000 },
  { id: 2, name: "Paul Benedict", rate: 6000 },
  { id: 3, name: "Syron Lee", rate: 30000 }
];

let employees = [...defaultEmployees];
let employeeId = employees.length + 1;

let dtrRecords = [];
let dtrId = 1; // Unique ID for each DTR record

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
}

// --- Employee Management ---
function addEmployee() {
  let name = document.getElementById('empName').value.trim();
  let rate = parseFloat(document.getElementById('hourlyRate').value);

  if (name && rate > 0) {
    // ✅ Auto assign next ID properly
    let newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    employees.push({ id: newId, name, rate });
    updateEmployeeTable();
    updateEmployeeDropdown();
    populateEmployeeSelections();
    document.getElementById('empName').value = "";
    document.getElementById('hourlyRate').value = "";
  } else {
    alert("⚠️ Please enter a valid name and hourly rate.");
  }
}

function deleteEmployee(id) {
  if (confirm("⚠️ Are you sure you want to delete this employee?")) {
    employees = employees.filter(e => e.id !== id);
    dtrRecords = dtrRecords.filter(r => r.employeeId !== id);

    // ✅ Reassign IDs to start again from 1
    employees = employees.map((e, index) => ({ ...e, id: index + 1 }));

    updateEmployeeTable();
    updateEmployeeDropdown();
    populateEmployeeSelections();
    renderDtrTable();

    alert("✅ Employee has been deleted successfully.");
  } else {
    alert("❎ Deletion cancelled.");
  }
}


function updateEmployeeTable() {
    const tableBody = document.getElementById('employeeTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ""; // Clear existing rows
    employees.forEach(emp => {
        let row = `
          <tr id="row-${emp.id}">
            <td>${emp.id}</td>
            <td>${emp.name}</td>
            <td>${emp.rate}</td>
            <td><button class="delete-btn" onclick="deleteEmployee(${emp.id})">Delete</button></td>
          </tr>
        `;
        tableBody.innerHTML += row;
    });
}

function updateEmployeeDropdown() {
  const select = document.getElementById("employeeSelect"); // match your actual dropdown ID
  if (!select) return;

  select.innerHTML = '<option value="">-- Select Employee --</option>';
  employees.forEach(emp => {
    const opt = document.createElement("option");
    opt.value = emp.name;
    opt.textContent = emp.name;
    select.appendChild(opt);
  });
}

// --- DTR Management ---
function addDtrRecord() {
    const empId = parseInt(document.getElementById('dtrEmployeeSelect').value);
    const date = document.getElementById('dtrDate').value;
    const timeIn = document.getElementById('dtrTimeIn').value;
    const timeOut = document.getElementById('dtrTimeOut').value;
    const employee = employees.find(e => e.id === empId);

    if (!employee || !date || !timeIn || !timeOut) {
        alert("⚠️ Please fill in all fields.");
        return;
    }
    if (timeOut <= timeIn) {
        alert("⚠️ Time Out must be after Time In.");
        return;
    }
    dtrRecords.push({
        id: dtrId++,
        employeeId: empId,
        employeeName: employee.name,
        date: date,
        timeIn: timeIn,
        timeOut: timeOut
    });
    renderDtrTable();
    clearDtrInputs();
}

function renderDtrTable() {
    const tableBody = document.getElementById('dtrTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = "";

    if (dtrRecords.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No records found.</td></tr>';
        return;
    }
    dtrRecords.forEach(record => {
        let row = `
            <tr>
                <td>${record.employeeName}</td>
                <td>${record.date}</td>
                <td>${record.timeIn}</td>
                <td>${record.timeOut}</td>
                <td><button class="delete-btn" onclick="deleteDtrRecord(${record.id})">Delete</button></td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

function deleteDtrRecord(id) {
    if (confirm("⚠️ Are you sure you want to delete this time record?")) {
        dtrRecords = dtrRecords.filter(r => r.id !== id);
        renderDtrTable();
    }
}

function clearDtrInputs() {
    document.getElementById('dtrEmployeeSelect').value = "";
    document.getElementById('dtrDate').value = "";
    document.getElementById('dtrTimeIn').value = "";
    document.getElementById('dtrTimeOut').value = "";
}

// --- Payroll Generation (Corrected) ---
function generatePayroll() {
  let id = parseInt(document.getElementById('empId').value);
  let emp = employees.find(e => e.id === id);
  if (!emp) {
    alert("Employee not found!");
    return;
  }

  const relevantRecords = dtrRecords.filter(r => r.employeeId === id);

  if (relevantRecords.length === 0) {
      alert("No attendance records found for this employee.");
      document.getElementById('payrollResult').innerHTML = "";
      return;
  }

  if (!confirm(`This will process and clear all ${relevantRecords.length} attendance records for ${emp.name}.\n\nDo you want to continue?`)) {
      alert("Payroll generation cancelled.");
      return;
  }

  let totalHoursWorked = 0;
  relevantRecords.forEach(record => {
      let timeIn = new Date(`1970-01-01T${record.timeIn}`);
      let timeOut = new Date(`1970-01-01T${record.timeOut}`);
      totalHoursWorked += (timeOut - timeIn) / (1000 * 60 * 60);
  });

  let grossPay = emp.rate * totalHoursWorked;

  // === CORRECTED DEDUCTIONS LOGIC ===
  // Uses fixed percentages instead of reading from input fields.
  let sss = grossPay * 0.04;        // 4%
  let philhealth = grossPay * 0.03; // 3%
  let pagibig = grossPay * 0.01;    // 1%
  let wtax = grossPay * 0.08;       // 8%
  // ===================================

  let totalDeduction = sss + philhealth + pagibig + wtax;
  let netPay = grossPay - totalDeduction;

  document.getElementById('payrollResult').innerHTML = `
    <p><b>Employee:</b> ${emp.name}</p>
    <p><b>Total Hours Processed:</b> ${totalHoursWorked.toFixed(2)}</p>
    <p><b>Gross Pay:</b> ₱${grossPay.toFixed(2)}</p>
    <p><b>SSS (4%):</b> ₱${sss.toFixed(2)}</p>
    <p><b>PhilHealth (3%):</b> ₱${philhealth.toFixed(2)}</p>
    <p><b>PAG-IBIG (1%):</b> ₱${pagibig.toFixed(2)}</p>
    <p><b>W/Tax (8%):</b> ₱${wtax.toFixed(2)}</p>
    <p><b>Total Deductions:</b> ₱${totalDeduction.toFixed(2)}</p>
    <p><b>Net Pay:</b> ₱${netPay.toFixed(2)}</p>
  `;

  let payrollDate = new Date().toLocaleDateString();
  const payslipTableBody = document.getElementById('payslipTable').getElementsByTagName('tbody')[0];
  let row = `<tr>
    <td>${payrollDate}</td>
    <td>${emp.name}</td>
    <td>₱${grossPay.toFixed(2)}</td>
    <td>₱${sss.toFixed(2)}</td>
    <td>₱${philhealth.toFixed(2)}</td>
    <td>₱${pagibig.toFixed(2)}</td>
    <td>₱${wtax.toFixed(2)}</td>
    <td>₱${totalDeduction.toFixed(2)}</td>
    <td>₱${netPay.toFixed(2)}</td>
    <td><button class="print-btn" onclick="printPayslip(this)">🖨️ Print</button></td>
  </tr>`;
  payslipTableBody.innerHTML += row;

  dtrRecords = dtrRecords.filter(r => r.employeeId !== id);
  renderDtrTable();
  document.getElementById('empId').value = "";
}

// --- Print Payslip ---
function printPayslip(button) {
  const row = button.closest("tr").cloneNode(true);
  row.querySelector(".print-btn")?.remove();

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Employee Payslip</title>
        <style>
          body { font-family: "Segoe UI", Arial, sans-serif; display: flex; justify-content: center; }
          .receipt-container { width: 420px; border: 1px solid #000; border-radius: 8px; padding: 20px 25px; margin-top: 20px; }
          .receipt-header { text-align: center; margin-bottom: 10px; }
          .receipt-header h2 { margin: 0; font-size: 20px; color: #0033cc; }
          .receipt-body table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .receipt-body th, .receipt-body td { padding: 4px 6px; text-align: left; border-bottom: 1px dotted #000; }
          .receipt-body th { text-align: right; width: 40%; }
          .netpay { text-align: center; margin-top: 15px; padding: 10px; background-color: #e6f0ff; border: 1px solid #0033cc; border-radius: 5px; font-weight: bold; font-size: 16px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #555; font-style: italic; }
          @media print { button { display: none !important; } }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-header">
            <h2>Employee Payslip</h2><hr>
          </div>
          <div class="receipt-body">
            <table>
              <tr><th>Payroll Date:</th><td>${row.cells[0].innerText}</td></tr>
              <tr><th>Name:</th><td>${row.cells[1].innerText}</td></tr>
              <tr><th>Gross Pay:</th><td>${row.cells[2].innerText}</td></tr>
              <tr><th>SSS:</th><td>${row.cells[3].innerText}</td></tr>
              <tr><th>PhilHealth:</th><td>${row.cells[4].innerText}</td></tr>
              <tr><th>PAG-IBIG:</th><td>${row.cells[5].innerText}</td></tr>
              <tr><th>W/Tax:</th><td>${row.cells[6].innerText}</td></tr>
              <tr><th>Total Deduction:</th><td>${row.cells[7].innerText}</td></tr>
            </table>
            <div class="netpay">Net Pay: ${row.cells[8].innerText}</div>
          </div>
          <div class="footer">Thank you for your service!</div>
        </div>
        <script>window.onload = () => window.print();</script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

window.onload = function () {
  updateEmployeeTable();
  updateEmployeeDropdown();
  populateEmployeeSelections(); 
};
// ✅ Populate DTR and Payroll dropdowns with default employees
function populateEmployeeSelections() {
  // DTR dropdown
  const dtrSelect = document.getElementById("dtrEmployeeSelect");
  if (dtrSelect) {
    dtrSelect.innerHTML = '<option value="">Select Employee</option>';
    employees.forEach(emp => {
      const opt = document.createElement("option");
      opt.value = emp.id;
      opt.textContent = emp.name;
      dtrSelect.appendChild(opt);
    });
  }

  // Payroll input (if it's a <select>, not a text box)
  const empIdInput = document.getElementById("empId");
  if (empIdInput && empIdInput.tagName.toLowerCase() === "select") {
    empIdInput.innerHTML = '<option value="">Select Employee</option>';
    employees.forEach(emp => {
      const opt = document.createElement("option");
      opt.value = emp.id;
      opt.textContent = emp.name;
      empIdInput.appendChild(opt);
    });
  }
}

document.addEventListener("keydown", function (e) {
  if (e.key !== "Enter") return; // only trigger on Enter
  e.preventDefault(); // prevent accidental form submits or reloads

  // Employee section active -> add employee
  if (document.getElementById("employee")?.classList.contains("active")) {
    addEmployee();
    return;
  }

  // DTR Records section active -> add DTR record
  if (document.getElementById("dtr")?.classList.contains("active")) {
    addDtrRecord();
    return;
  }

  // Payroll section active -> generate payroll
  if (document.getElementById("payroll")?.classList.contains("active")) {
    generatePayroll();
    return;
  }
});

