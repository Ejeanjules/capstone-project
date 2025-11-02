#!/usr/bin/env python3
"""
Simple script to convert text resume to PDF for testing
"""

try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.units import inch
    
    def create_resume_pdf():
        # Read the text resume
        with open('test_resume.txt', 'r', encoding='utf-8') as f:
            resume_text = f.read()
        
        # Create PDF
        doc = SimpleDocTemplate("john_doe_resume.pdf", pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Split text into paragraphs and add to story
        paragraphs = resume_text.split('\n\n')
        for para in paragraphs:
            if para.strip():
                # Use different styles for headers vs content
                if para.strip().isupper() or '|' in para:
                    p = Paragraph(para.replace('\n', '<br/>'), styles['Heading2'])
                else:
                    p = Paragraph(para.replace('\n', '<br/>'), styles['Normal'])
                story.append(p)
                story.append(Spacer(1, 0.2*inch))
        
        doc.build(story)
        print("PDF resume created: john_doe_resume.pdf")
    
    if __name__ == "__main__":
        create_resume_pdf()

except ImportError:
    print("ReportLab not installed. Creating a simple text-based PDF alternative...")
    
    # Alternative: Create a simple method without reportlab
    def create_simple_pdf():
        # For testing purposes, we'll just use the text file
        # In a real scenario, you could use online converters or other libraries
        print("Using text file for testing. In production, consider installing reportlab:")
        print("pip install reportlab")
        print("\nFor now, you can:")
        print("1. Copy the content from test_resume.txt")
        print("2. Paste it into a Google Doc or Word document")
        print("3. Save/export as PDF")
        print("4. Use that PDF for testing")
    
    create_simple_pdf()