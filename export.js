document.getElementById("export-pdf").addEventListener("click", function () {
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

document.getElementById("export-csv").addEventListener("click", function () {
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
