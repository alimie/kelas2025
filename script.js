const sheetURL = "https://script.google.com/macros/s/AKfycbyBERYk1wIGq5_lPSUYljSCOxUx-TG5rvO4xobwAmc2o3CeqAES9m0D5toz7FpeXOvL/exec";  // Replace with your Web App URL

document.addEventListener("DOMContentLoaded", function () {
    const classSelect = document.getElementById("class");
    const tableBody = document.querySelector("#attendance-table tbody");
    const saveButton = document.getElementById("save");
    const exportPdfButton = document.getElementById("export-pdf");
    const exportCsvButton = document.getElementById("export-csv");
    const dateInput = document.getElementById("date");

    let studentData = {};

    // Load student data
    fetch("students.json")
        .then(response => response.json())
        .then(data => {
            studentData = data;
            populateClassOptions();
        });

    function populateClassOptions() {
        classSelect.innerHTML = "";
        for (let className in studentData) {
            let option = document.createElement("option");
            option.value = className;
            option.textContent = className;
            classSelect.appendChild(option);
        }
        loadStudents();
    }

    function loadStudents() {
        tableBody.innerHTML = "";
        let selectedClass = classSelect.value;
        let students = studentData[selectedClass] || [];

        students.forEach(student => {
            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${student.name}</td>
                <td><input type="checkbox" class="attendance"></td>
            `;
            tableBody.appendChild(row);
        });

        fetchAttendance(); // Load previous records
    }

    classSelect.addEventListener("change", loadStudents);
    dateInput.addEventListener("change", loadStudents);

    // Save attendance to Google Sheets
    saveButton.addEventListener("click", function () {
        let date = dateInput.value;
        let className = classSelect.value;
        let attendanceData = [];

        document.querySelectorAll(".attendance").forEach((checkbox, index) => {
            let record = {
                date: date,
                class: className,
                name: studentData[className][index].name,
                attendance: checkbox.checked ? "Present" : "Absent"
            };
            attendanceData.push(record);

            fetch(sheetURL, {
                method: "POST",
                body: JSON.stringify(record),
                headers: { "Content-Type": "application/json" }
            })
            .then(response => response.text())
            .then(data => console.log("Saved:", data));
        });

        alert("Attendance saved to Google Sheets!");
    });

    // Fetch past attendance from Google Sheets
    function fetchAttendance() {
        let date = dateInput.value;
        let className = classSelect.value;

        fetch(sheetURL)
            .then(response => response.json())
            .then(records => {
                records.forEach(record => {
                    if (record[0] === date && record[1] === className) {
                        document.querySelectorAll(".attendance").forEach((checkbox, index) => {
                            if (record[2] === studentData[className][index].name) {
                                checkbox.checked = (record[3] === "Present");
                            }
                        });
                    }
                });
            });
    }

    // Export to PDF
    exportPdfButton.addEventListener("click", function () {
        let doc = new jsPDF();
        doc.text("Attendance Report", 10, 10);

        let rows = [];
        document.querySelectorAll("#attendance-table tbody tr").forEach(row => {
            let name = row.cells[0].textContent;
            let present = row.cells[1].querySelector("input").checked ? "Present" : "Absent";
            rows.push([name, present]);
        });

        doc.autoTable({
            head: [["Name", "Attendance"]],
            body: rows
        });

        doc.save("attendance.pdf");
    });

    // Export to CSV
    exportCsvButton.addEventListener("click", function () {
        let csvContent = "Name,Attendance\n";

        document.querySelectorAll("#attendance-table tbody tr").forEach(row => {
            let name = row.cells[0].textContent;
            let present = row.cells[1].querySelector("input").checked ? "Present" : "Absent";
            csvContent += `${name},${present}\n`;
        });

        let blob = new Blob([csvContent], { type: "text/csv" });
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "attendance.csv";
        link.click();
    });
});
