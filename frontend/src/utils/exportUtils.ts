import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Sanitizes a string to be used as a filename.
 */
const sanitizeFilename = (name: string) => {
    return name.replace(/[/\?%*:|"<>]/g, '-').replace(/\s+/g, '_');
};

/**
 * Exports data to a CSV file and triggers a browser download.
 */
export const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    try {
        if (data.length === 0) {
            console.warn('Export: No data to export');
            return;
        }

        const csvContent = [
            headers.join(','),
            ...data.map(row =>
                headers.map(header => {
                    const val = row[header] || '';
                    // Escape quotes and wrap in quotes if contains comma
                    const cell = String(val).replace(/"/g, '""');
                    return cell.includes(',') ? `"${cell}"` : cell;
                }).join(',')
            )
        ].join('\n');

        const cleanFilename = sanitizeFilename(filename);
        // Add BOM for Excel compatibility
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${cleanFilename}.csv`);
        link.setAttribute('target', '_blank'); // Some browsers need this
        link.style.display = 'none';

        document.body.appendChild(link);
        console.log(`Export: Triggering download for ${cleanFilename}.csv`);
        link.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error('Export: CSV failed', error);
        throw error;
    }
};

/**
 * Exports data to a PDF file using jspdf and jspdf-autotable.
 */
export const exportToPDF = (
    title: string,
    headers: string[],
    data: any[][],
    filename: string,
    summary?: Record<string, string>
) => {
    try {
        const doc = new jsPDF();
        const cleanFilename = sanitizeFilename(filename);

        console.log(`Export: Generating PDF for ${cleanFilename}.pdf`);

        // Add Title
        doc.setFontSize(20);
        doc.setTextColor(40);
        doc.text(title, 14, 22);

        // Add Summary if provided
        let finalStartY = 30;
        if (summary) {
            doc.setFontSize(11);
            doc.setTextColor(100);
            let y = 32;
            Object.entries(summary).forEach(([key, value]) => {
                doc.text(`${key}: ${value}`, 14, y);
                y += 6;
            });
            finalStartY = y + 5;
        }

        // Create table
        autoTable(doc, {
            head: [headers],
            body: data,
            startY: finalStartY,
            theme: 'grid',
            headStyles: { fillColor: [6, 182, 212] }, // cyan-500
            styles: { fontSize: 9 },
            alternateRowStyles: { fillColor: [245, 247, 250] }
        });

        // Footer with Page Number
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(
                `Page ${i} of ${pageCount}`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        doc.save(`${cleanFilename}.pdf`);
        console.log('Export: PDF saved successfully');
    } catch (error) {
        console.error('Export: PDF failed', error);
        throw error;
    }
};
