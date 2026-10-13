import re
import sys
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(36, 762, "PromptX — SEO Strategy & Competitive Intelligence Report")
            self.drawRightString(576, 762, "October 2026")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(36, 756, 576, 756)
        
        # Footer
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(36, 42, 576, 42)
        
        self.setFont("Helvetica", 8)
        self.drawString(36, 30, "PromptX Confidential • Production SEO Blueprint")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(576, 30, page_text)
        self.restoreState()

def clean_inline_md(text):
    # Protect escaped pipes
    text = text.replace(r'\|', '___ESCAPED_PIPE___')
    # Escape raw ampersands and angle brackets
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;').replace('>', '&gt;')
    
    # Process markdown links [text](url) -> <b>text</b>
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'<b>\1</b>', text)
    # Process bold **text** -> <b>text</b>
    text = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', text)
    # Process italic *text* -> <i>text</i>
    text = re.sub(r'\*([^*]+)\*', r'<i>\1</i>', text)
    # Process code `code` -> <font face="Courier" color="#1E293B"><b>\1</b></font>
    text = re.sub(r'`([^`]+)`', r'<font face="Courier" color="#1E293B"><b>\1</b></font>', text)
    # Restore pipe
    text = text.replace('___ESCAPED_PIPE___', '|')
    
    return text

def parse_md_to_flowables(md_path, styles, doc_width):
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    flowables = []
    
    # Title Cover Banner
    flowables.append(Spacer(1, 10))
    flowables.append(Paragraph("PROMPTX SEO & COMPETITIVE INTELLIGENCE", styles["DocCategory"]))
    flowables.append(Paragraph("Strategic Playbook to Outrank Competitors in AI Prompt Generation", styles["DocTitle"]))
    flowables.append(Paragraph("<b>Stack:</b> Next.js 16 • React 19 • Tailwind CSS &nbsp;&nbsp;|&nbsp;&nbsp; <b>Market:</b> Global &amp; India &nbsp;&nbsp;|&nbsp;&nbsp; <b>Audit Date:</b> October 2026", styles["DocSubtitle"]))
    flowables.append(HRFlowable(width="100%", thickness=2.5, color=colors.HexColor("#4F46E5"), spaceAfter=15, spaceBefore=8))

    in_table = False
    table_lines = []
    in_code = False
    code_lines = []
    
    def process_table(raw_lines):
        if not raw_lines:
            return None
        rows_data = []
        for line in raw_lines:
            line_str = line.strip()
            if not line_str or line_str.startswith('| :---') or line_str.startswith('|:---') or line_str.startswith('|---'):
                continue
            
            # Temporarily protect escaped pipes before splitting
            protected = line_str.replace(r'\|', '___ESCAPED_PIPE___')
            cells = [c.strip().replace('___ESCAPED_PIPE___', '|') for c in protected.split('|')]
            if len(cells) >= 2:
                # Remove empty edges from leading/trailing pipe
                if cells[0] == '':
                    cells = cells[1:]
                if cells and cells[-1] == '':
                    cells = cells[:-1]
                rows_data.append(cells)
        
        if not rows_data:
            return None
            
        num_cols = max(len(r) for r in rows_data)
        for r in rows_data:
            while len(r) < num_cols:
                r.append("")
        
        header_text = " ".join(rows_data[0])
        col_w = doc_width / float(num_cols)
        col_widths = [col_w] * num_cols

        if num_cols == 3:
            # e.g. Query Type | Winning Page Type | Why It Wins
            col_widths = [doc_width * 0.25, doc_width * 0.35, doc_width * 0.40]
        elif num_cols == 5:
            if "Site Name" in header_text:
                # Rank | Site Name | URL | Page Type | Cross-Query
                col_widths = [doc_width * 0.08, doc_width * 0.22, doc_width * 0.34, doc_width * 0.21, doc_width * 0.15]
            elif "Competitor Domain" in header_text:
                # Competitor Domain | Appearances | Strategy | Architecture | Threat
                col_widths = [doc_width * 0.22, doc_width * 0.12, doc_width * 0.28, doc_width * 0.22, doc_width * 0.16]
            elif "Target Keyword" in header_text:
                # # | Page Title | Target Keyword | Category | Primary Tool
                col_widths = [doc_width * 0.06, doc_width * 0.30, doc_width * 0.26, doc_width * 0.18, doc_width * 0.20]
            else:
                col_widths = [doc_width * 0.08, doc_width * 0.25, doc_width * 0.27, doc_width * 0.20, doc_width * 0.20]
        elif num_cols == 6:
            if "Audit Parameter" in header_text:
                # Audit Parameter | PromptBuilder | PromptFolder | PromptPrepare | Feedough | PromptingGuide
                col_widths = [doc_width * 0.20, doc_width * 0.16, doc_width * 0.16, doc_width * 0.16, doc_width * 0.16, doc_width * 0.16]
            elif "Priority" in header_text or "Difficulty" in header_text:
                # Keyword | Intent | Target Page | Diff | Reason | Priority
                col_widths = [doc_width * 0.23, doc_width * 0.15, doc_width * 0.18, doc_width * 0.12, doc_width * 0.22, doc_width * 0.10]
            else:
                col_widths = [doc_width / 6.0] * 6

        table_flowable_data = []
        for row_idx, r in enumerate(rows_data):
            row_flowables = []
            is_header = (row_idx == 0)
            for cell_text in r:
                cleaned = clean_inline_md(cell_text)
                style = styles["TableHeader"] if is_header else styles["TableCell"]
                row_flowables.append(Paragraph(cleaned, style))
            table_flowable_data.append(row_flowables)

        t = Table(table_flowable_data, colWidths=col_widths, repeatRows=1)
        t_style = [
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E293B")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ]
        for row_i in range(1, len(rows_data)):
            if row_i % 2 == 0:
                t_style.append(('BACKGROUND', (0, row_i), (-1, row_i), colors.HexColor("#F8FAFC")))
        t.setStyle(TableStyle(t_style))
        return t

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Handle mermaid block
        if stripped.startswith("```mermaid"):
            mermaid_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                mermaid_lines.append(lines[i].strip())
                i += 1
            i += 1 # skip closing ```

            phase_data = [
                [
                    Paragraph("<b>PHASE 1 (Days 1–30)</b><br/><font color='#4F46E5'>Foundation &amp; Quick Wins</font>", styles["TableHeader"]),
                    Paragraph("<b>PHASE 2 (Days 31–60)</b><br/><font color='#4F46E5'>Scale &amp; Distribution</font>", styles["TableHeader"]),
                    Paragraph("<b>PHASE 3 (Days 61–90)</b><br/><font color='#4F46E5'>Moat &amp; Conversions</font>", styles["TableHeader"]),
                ],
                [
                    Paragraph("• Above-the-fold generator<br/>• SoftwareApp &amp; FAQ schema<br/>• Submit to 15 AI directories<br/>• Launch top 10 video/FLUX pages", styles["TableCell"]),
                    Paragraph("• 20 programmatic pages<br/>• Product Hunt &amp; Reddit launch<br/>• 3,500w /prompt-engineering pillar<br/>• 5 GitHub 'Awesome' PRs", styles["TableCell"]),
                    Paragraph("• 6 high-intent guide articles<br/>• Launch 'Prompt Optimizer' tool<br/>• Optimize Pro plan funnel<br/>• Search Console query optimization", styles["TableCell"]),
                ]
            ]
            t_phase = Table(phase_data, colWidths=[doc_width/3.0, doc_width/3.0, doc_width/3.0])
            t_phase.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E293B")),
                ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor("#F8FAFC")),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#4F46E5")),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ]))
            flowables.append(Spacer(1, 6))
            flowables.append(t_phase)
            flowables.append(Spacer(1, 10))
            continue

        # Handle generic code blocks
        if stripped.startswith("```"):
            if in_code:
                # End of code block
                in_code = False
                code_text = "<br/>".join([clean_inline_md(l) for l in code_lines])
                code_p = Paragraph(f"<font face='Courier' color='#0F172A'>{code_text}</font>", styles["CodeBlock"])
                t_code = Table([[code_p]], colWidths=[doc_width])
                t_code.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
                    ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                    ('TOPPADDING', (0, 0), (-1, -1), 4),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                    ('LEFTPADDING', (0, 0), (-1, -1), 8),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
                ]))
                flowables.append(Spacer(1, 4))
                flowables.append(t_code)
                flowables.append(Spacer(1, 6))
                code_lines = []
            else:
                in_code = True
                code_lines = []
            i += 1
            continue

        if in_code:
            code_lines.append(stripped)
            i += 1
            continue

        # Handle tables
        if stripped.startswith("|"):
            table_lines.append(stripped)
            i += 1
            while i < len(lines) and lines[i].strip().startswith("|"):
                table_lines.append(lines[i].strip())
                i += 1
            tbl = process_table(table_lines)
            if tbl:
                flowables.append(Spacer(1, 4))
                flowables.append(tbl)
                flowables.append(Spacer(1, 8))
            table_lines = []
            continue

        if not stripped:
            i += 1
            continue

        # Headings
        if stripped.startswith("# "):
            text = clean_inline_md(stripped[2:])
            flowables.append(Spacer(1, 14))
            flowables.append(Paragraph(text, styles["Heading1"]))
            flowables.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E2E8F0"), spaceAfter=8, spaceBefore=4))
        elif stripped.startswith("## "):
            text = clean_inline_md(stripped[3:])
            flowables.append(Spacer(1, 12))
            flowables.append(Paragraph(text, styles["Heading2"]))
            flowables.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CBD5E1"), spaceAfter=6, spaceBefore=3))
        elif stripped.startswith("### "):
            text = clean_inline_md(stripped[4:])
            flowables.append(Spacer(1, 8))
            flowables.append(Paragraph(text, styles["Heading3"]))
        elif stripped.startswith("#### "):
            text = clean_inline_md(stripped[5:])
            flowables.append(Spacer(1, 6))
            flowables.append(Paragraph(text, styles["Heading4"]))
        elif stripped.startswith("---"):
            flowables.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E2E8F0"), spaceAfter=8, spaceBefore=8))
        elif re.match(r'^\d+\.\s', stripped):
            # Numbered list
            cleaned = clean_inline_md(stripped)
            flowables.append(Paragraph(cleaned, styles["NumberedItem"]))
        elif stripped.startswith("* [x] ") or stripped.startswith("- [x] "):
            cleaned = clean_inline_md(stripped[6:])
            flowables.append(Paragraph(f"<font color='#10B981'><b>[✓]</b></font> &nbsp; {cleaned}", styles["BulletItem"]))
        elif stripped.startswith("* [ ] ") or stripped.startswith("- [ ] "):
            cleaned = clean_inline_md(stripped[6:])
            flowables.append(Paragraph(f"<font color='#64748B'><b>[ ]</b></font> &nbsp; {cleaned}", styles["BulletItem"]))
        elif stripped.startswith("* ") or stripped.startswith("- "):
            cleaned = clean_inline_md(stripped[2:])
            flowables.append(Paragraph(f"• &nbsp; {cleaned}", styles["BulletItem"]))
        elif stripped.startswith("> "):
            cleaned = clean_inline_md(stripped[2:])
            p_callout = Paragraph(cleaned, styles["Callout"])
            t_callout = Table([[p_callout]], colWidths=[doc_width])
            t_callout.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
                ('RIGHTPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('LINEBEFORE', (0, 0), (0, -1), 3, colors.HexColor("#4F46E5")),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ]))
            flowables.append(Spacer(1, 3))
            flowables.append(t_callout)
            flowables.append(Spacer(1, 4))
        else:
            cleaned = clean_inline_md(stripped)
            flowables.append(Paragraph(cleaned, styles["BodyText"]))

        i += 1

    return flowables

def build_pdf():
    pdf_path = "/Users/Jaypatel/Desktop/project/promptx/SEO_STRATEGY_COMPETITIVE_ANALYSIS.pdf"
    md_path = "/Users/Jaypatel/Desktop/project/promptx/SEO_STRATEGY_COMPETITIVE_ANALYSIS.md"
    
    # 0.5 in margins (36 pt)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=48,
        bottomMargin=48
    )
    doc_width = doc.width  # 540 pt
    
    styles = getSampleStyleSheet()
    
    styles.add(ParagraphStyle(
        'DocCategory',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=colors.HexColor("#4F46E5"),
        spaceAfter=4
    ))
    styles.add(ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=6
    ))
    styles.add(ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#475569"),
        spaceAfter=8
    ))
    styles['Heading1'].fontName = 'Helvetica-Bold'
    styles['Heading1'].fontSize = 14
    styles['Heading1'].leading = 17
    styles['Heading1'].textColor = colors.HexColor("#0F172A")
    styles['Heading1'].keepWithNext = True
    styles['Heading1'].spaceAfter = 4
    styles['Heading1'].spaceBefore = 10

    styles['Heading2'].fontName = 'Helvetica-Bold'
    styles['Heading2'].fontSize = 11.5
    styles['Heading2'].leading = 14
    styles['Heading2'].textColor = colors.HexColor("#1E293B")
    styles['Heading2'].keepWithNext = True
    styles['Heading2'].spaceAfter = 3
    styles['Heading2'].spaceBefore = 8

    styles['Heading3'].fontName = 'Helvetica-Bold'
    styles['Heading3'].fontSize = 10
    styles['Heading3'].leading = 12.5
    styles['Heading3'].textColor = colors.HexColor("#4338CA")
    styles['Heading3'].keepWithNext = True
    styles['Heading3'].spaceAfter = 3
    styles['Heading3'].spaceBefore = 6

    styles['Heading4'].fontName = 'Helvetica-Bold'
    styles['Heading4'].fontSize = 9
    styles['Heading4'].leading = 11.5
    styles['Heading4'].textColor = colors.HexColor("#1E293B")
    styles['Heading4'].keepWithNext = True
    styles['Heading4'].spaceAfter = 2
    styles['Heading4'].spaceBefore = 4

    styles['BodyText'].fontName = 'Helvetica'
    styles['BodyText'].fontSize = 8
    styles['BodyText'].leading = 11
    styles['BodyText'].textColor = colors.HexColor("#1F2937")
    styles['BodyText'].spaceAfter = 3.5
    
    styles.add(ParagraphStyle(
        'NumberedItem',
        parent=styles['BodyText'],
        leftIndent=10,
        spaceAfter=2.5
    ))
    styles.add(ParagraphStyle(
        'BulletItem',
        parent=styles['BodyText'],
        leftIndent=10,
        spaceAfter=2
    ))
    styles.add(ParagraphStyle(
        'Callout',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#334155"),
        spaceAfter=0
    ))
    styles.add(ParagraphStyle(
        'CodeBlock',
        parent=styles['BodyText'],
        fontName='Courier',
        fontSize=7,
        leading=9,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=0
    ))
    styles.add(ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=9,
        textColor=colors.white
    ))
    styles.add(ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=6.5,
        leading=8,
        textColor=colors.HexColor("#1E293B")
    ))

    flowables = parse_md_to_flowables(md_path, styles, doc_width)
    doc.build(flowables, canvasmaker=NumberedCanvas)
    print(f"PDF generated successfully at {pdf_path}")

if __name__ == '__main__':
    build_pdf()
