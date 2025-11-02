"""
Script to create 5 test resumes in PDF format ranging from best to worst match
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER

def create_resume_pdf(filename, content_data):
    """Create a PDF resume with the given content"""
    doc = SimpleDocTemplate(filename, pagesize=letter,
                           rightMargin=0.75*inch, leftMargin=0.75*inch,
                           topMargin=0.75*inch, bottomMargin=0.75*inch)
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor='#000000',
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor='#333333',
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Helvetica'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor='#000000',
        spaceAfter=6,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        textColor='#333333',
        spaceAfter=6,
        alignment=TA_LEFT,
        fontName='Helvetica'
    )
    
    # Add content
    for item in content_data:
        if item['type'] == 'title':
            elements.append(Paragraph(item['text'], title_style))
        elif item['type'] == 'subtitle':
            elements.append(Paragraph(item['text'], subtitle_style))
        elif item['type'] == 'heading':
            elements.append(Paragraph(item['text'], heading_style))
        elif item['type'] == 'text':
            elements.append(Paragraph(item['text'], normal_style))
        elif item['type'] == 'spacer':
            elements.append(Spacer(1, 0.2*inch))
    
    # Build PDF
    doc.build(elements)
    print(f"Created: {filename}")

# Resume 1: Excellent Match (90-95% expected)
resume1_content = [
    {'type': 'title', 'text': 'JOHN EXCELLENT'},
    {'type': 'subtitle', 'text': 'Senior Full-Stack Developer'},
    {'type': 'subtitle', 'text': 'Email: john.excellent@email.com | Phone: (555) 123-4567'},
    {'type': 'spacer', 'text': ''},
    
    {'type': 'heading', 'text': 'PROFESSIONAL SUMMARY'},
    {'type': 'text', 'text': 'Senior Full-Stack Developer with 8+ years of experience in full-stack development. Expert in JavaScript, React, Node.js, Python, and Django. Proven track record of building scalable web applications using modern technologies and best practices.'},
    
    {'type': 'heading', 'text': 'TECHNICAL SKILLS'},
    {'type': 'text', 'text': '<b>Frontend:</b> JavaScript, React, Redux, HTML, CSS, Bootstrap'},
    {'type': 'text', 'text': '<b>Backend:</b> Python, Django, Node.js, Express, REST APIs'},
    {'type': 'text', 'text': '<b>Databases:</b> PostgreSQL, MySQL, MongoDB, Redis'},
    {'type': 'text', 'text': '<b>DevOps &amp; Cloud:</b> AWS, Docker, Git, GitHub, CI/CD'},
    {'type': 'text', 'text': '<b>Methodologies:</b> Agile, Scrum, Test-Driven Development'},
    {'type': 'text', 'text': '<b>Tools:</b> Git, VS Code, Postman, Jenkins'},
    
    {'type': 'heading', 'text': 'PROFESSIONAL EXPERIENCE'},
    {'type': 'text', 'text': '<b>Senior Full-Stack Developer | Tech Solutions Inc. | 2020 - Present</b>'},
    {'type': 'text', 'text': '- Developed full-stack web applications using React, Node.js, Python, and Django'},
    {'type': 'text', 'text': '- Built RESTful APIs serving 100K+ daily active users'},
    {'type': 'text', 'text': '- Worked with PostgreSQL and MongoDB databases for data persistence'},
    {'type': 'text', 'text': '- Deployed applications to AWS using Docker containers'},
    {'type': 'text', 'text': '- Collaborated with cross-functional teams using Agile/Scrum methodologies'},
    {'type': 'text', 'text': '- Used Git for version control and code collaboration'},
    {'type': 'text', 'text': '- Implemented strong problem-solving solutions for complex technical challenges'},
    {'type': 'text', 'text': '- Excellent communication skills working with stakeholders and team members'},
    {'type': 'spacer', 'text': ''},
    
    {'type': 'text', 'text': '<b>Full-Stack Developer | Digital Agency | 2017 - 2020</b>'},
    {'type': 'text', 'text': '- Developed web applications using JavaScript, React, Python, and Django'},
    {'type': 'text', 'text': '- Managed MySQL and PostgreSQL databases'},
    {'type': 'text', 'text': '- Utilized Docker for containerization and AWS for cloud hosting'},
    {'type': 'text', 'text': '- Participated in daily Scrum meetings and sprint planning'},
    {'type': 'text', 'text': '- Strong problem-solving and communication abilities'},
    {'type': 'spacer', 'text': ''},
    
    {'type': 'text', 'text': '<b>Junior Developer | StartupXYZ | 2015 - 2017</b>'},
    {'type': 'text', 'text': '- Built web applications with JavaScript and Node.js'},
    {'type': 'text', 'text': '- Worked with MongoDB and MySQL databases'},
    {'type': 'text', 'text': '- Used Git for version control'},
    
    {'type': 'heading', 'text': 'EDUCATION'},
    {'type': 'text', 'text': '<b>Bachelor of Science in Computer Science</b>'},
    {'type': 'text', 'text': 'University of Technology | 2015'},
    
    {'type': 'heading', 'text': 'KEY ACHIEVEMENTS'},
    {'type': 'text', 'text': '- Led migration of legacy system to modern React and Django stack'},
    {'type': 'text', 'text': '- Reduced application load time by 60% through optimization'},
    {'type': 'text', 'text': '- Mentored 5 junior developers in Agile best practices'},
]

# Resume 2: Good Match (70-80% expected)
resume2_content = [
    {'type': 'title', 'text': 'SARAH GOODMATCH'},
    {'type': 'subtitle', 'text': 'Full-Stack Developer'},
    {'type': 'subtitle', 'text': 'Email: sarah.good@email.com | Phone: (555) 234-5678'},
    {'type': 'spacer', 'text': ''},
    
    {'type': 'heading', 'text': 'SUMMARY'},
    {'type': 'text', 'text': 'Dedicated Full-Stack Developer with 5 years of experience building web applications. Proficient in Python, Django, React, and relational databases. Strong background in backend development with growing frontend expertise.'},
    
    {'type': 'heading', 'text': 'TECHNICAL SKILLS'},
    {'type': 'text', 'text': '<b>Programming Languages:</b> Python, JavaScript, TypeScript, SQL, HTML, CSS'},
    {'type': 'text', 'text': '<b>Frontend:</b> React, Redux, Bootstrap, jQuery, Webpack'},
    {'type': 'text', 'text': '<b>Backend:</b> Django, Flask, Node.js, REST API'},
    {'type': 'text', 'text': '<b>Databases:</b> PostgreSQL, MySQL, MongoDB'},
    {'type': 'text', 'text': '<b>Tools:</b> Git, GitHub, Docker, Jenkins, Agile/Scrum'},
    {'type': 'text', 'text': '<b>Testing:</b> Pytest, Jest, Unit Testing'},
    
    {'type': 'heading', 'text': 'PROFESSIONAL EXPERIENCE'},
    {'type': 'text', 'text': '<b>Full-Stack Developer | Digital Agency | 2021 - Present</b>'},
    {'type': 'text', 'text': '• Developed web applications using Django and React for various clients'},
    {'type': 'text', 'text': '• Built RESTful APIs for mobile and web applications'},
    {'type': 'text', 'text': '• Worked with PostgreSQL and MySQL databases'},
    {'type': 'text', 'text': '• Implemented responsive UI designs using React and Bootstrap'},
    {'type': 'text', 'text': '• Collaborated with team members using Git and GitHub'},
    {'type': 'text', 'text': '• Participated in Agile sprint planning and daily standup meetings'},
    {'type': 'text', 'text': '• Wrote unit tests to ensure code quality'},
    {'type': 'spacer', 'text': ''},
    
    {'type': 'text', 'text': '<b>Backend Developer | SoftwareCo | 2019 - 2021</b>'},
    {'type': 'text', 'text': '• Developed backend services using Python and Django'},
    {'type': 'text', 'text': '• Designed and optimized database schemas in PostgreSQL'},
    {'type': 'text', 'text': '• Created API endpoints for frontend consumption'},
    {'type': 'text', 'text': '• Worked with Redis for caching'},
    {'type': 'text', 'text': '• Debugged and resolved production issues'},
    
    {'type': 'heading', 'text': 'EDUCATION'},
    {'type': 'text', 'text': '<b>Bachelor of Science in Information Technology</b> | State University | 2018'},
    
    {'type': 'heading', 'text': 'PROJECTS'},
    {'type': 'text', 'text': '• Task Management App: Django backend with React frontend and PostgreSQL'},
    {'type': 'text', 'text': '• Blog Platform: Full-stack application with user authentication'},
    {'type': 'text', 'text': '• Weather Dashboard: React app consuming external APIs'},
]

# Resume 3: Average Match (50-60% expected)
resume3_content = [
    {'type': 'title', 'text': 'MIKE AVERAGE'},
    {'type': 'subtitle', 'text': 'Software Developer'},
    {'type': 'subtitle', 'text': 'Email: mike.average@email.com | Phone: (555) 345-6789'},
    {'type': 'spacer', 'text': ''},
    
    {'type': 'heading', 'text': 'SUMMARY'},
    {'type': 'text', 'text': 'Software Developer with 3 years of experience in web development. Familiar with Python and JavaScript. Looking to expand my skills in modern web technologies.'},
    
    {'type': 'heading', 'text': 'TECHNICAL SKILLS'},
    {'type': 'text', 'text': '<b>Languages:</b> Python, JavaScript, HTML, CSS, SQL'},
    {'type': 'text', 'text': '<b>Frameworks:</b> Django, React (basic), jQuery'},
    {'type': 'text', 'text': '<b>Databases:</b> MySQL, PostgreSQL'},
    {'type': 'text', 'text': '<b>Tools:</b> Git, Visual Studio Code, Jira'},
    {'type': 'text', 'text': '<b>Methods:</b> Agile'},
    
    {'type': 'heading', 'text': 'WORK EXPERIENCE'},
    {'type': 'text', 'text': '<b>Software Developer | Tech Services LLC | 2022 - Present</b>'},
    {'type': 'text', 'text': '• Work on web application maintenance using Django'},
    {'type': 'text', 'text': '• Fix bugs and implement small features'},
    {'type': 'text', 'text': '• Update database records in MySQL'},
    {'type': 'text', 'text': '• Attend team meetings and provide status updates'},
    {'type': 'text', 'text': '• Use Git for version control'},
    {'type': 'spacer', 'text': ''},
    
    {'type': 'text', 'text': '<b>Web Developer | SmallBiz Solutions | 2020 - 2022</b>'},
    {'type': 'text', 'text': '• Built websites using HTML, CSS, JavaScript, and jQuery'},
    {'type': 'text', 'text': '• Used WordPress for content management'},
    {'type': 'text', 'text': '• Made minor backend changes in PHP'},
    {'type': 'text', 'text': '• Communicated with clients about requirements'},
    
    {'type': 'heading', 'text': 'EDUCATION'},
    {'type': 'text', 'text': '<b>Associate Degree in Computer Programming</b> | Community College | 2019'},
    
    {'type': 'heading', 'text': 'PROJECTS'},
    {'type': 'text', 'text': '• Personal Portfolio Website: HTML, CSS, JavaScript'},
    {'type': 'text', 'text': '• Simple Todo App: Basic Django application'},
]

# Resume 4: Below Average Match (30-40% expected)
resume4_content = [
    {'type': 'title', 'text': 'LISA BELOWAVG'},
    {'type': 'subtitle', 'text': 'Junior Web Developer'},
    {'type': 'subtitle', 'text': 'Email: lisa.below@email.com | Phone: (555) 456-7890'},
    {'type': 'spacer', 'text': ''},
    
    {'type': 'heading', 'text': 'SUMMARY'},
    {'type': 'text', 'text': 'Entry-level web developer with 1 year of experience. Eager to learn and grow in web development. Basic knowledge of HTML, CSS, and JavaScript.'},
    
    {'type': 'heading', 'text': 'TECHNICAL SKILLS'},
    {'type': 'text', 'text': '<b>Languages:</b> HTML, CSS, JavaScript, Python (beginner)'},
    {'type': 'text', 'text': '<b>Tools:</b> Visual Studio Code, Git (basic)'},
    {'type': 'text', 'text': '<b>Frameworks:</b> Bootstrap, jQuery'},
    
    {'type': 'heading', 'text': 'WORK EXPERIENCE'},
    {'type': 'text', 'text': '<b>Web Developer Intern | StartupXYZ | 2023 - Present</b>'},
    {'type': 'text', 'text': '• Create simple web pages using HTML and CSS'},
    {'type': 'text', 'text': '• Update website content as requested'},
    {'type': 'text', 'text': '• Learn JavaScript fundamentals through online courses'},
    {'type': 'text', 'text': '• Assist senior developers with testing'},
    {'type': 'spacer', 'text': ''},
    
    {'type': 'text', 'text': '<b>Freelance | Self-Employed | 2022 - 2023</b>'},
    {'type': 'text', 'text': '• Built basic websites for small businesses'},
    {'type': 'text', 'text': '• Used WordPress templates'},
    {'type': 'text', 'text': '• Made minor CSS customizations'},
    
    {'type': 'heading', 'text': 'EDUCATION'},
    {'type': 'text', 'text': '<b>Certificate in Web Development</b> | Online Bootcamp | 2022'},
    
    {'type': 'heading', 'text': 'PROJECTS'},
    {'type': 'text', 'text': '• Personal Blog: WordPress site'},
    {'type': 'text', 'text': '• Landing Page: HTML, CSS, Bootstrap'},
]

# Resume 5: Poor Match (10-20% expected)
resume5_content = [
    {'type': 'title', 'text': 'ROBERT MISMATCH'},
    {'type': 'subtitle', 'text': 'Graphic Designer & Content Creator'},
    {'type': 'subtitle', 'text': 'Email: robert.mismatch@email.com | Phone: (555) 567-8901'},
    {'type': 'spacer', 'text': ''},
    
    {'type': 'heading', 'text': 'SUMMARY'},
    {'type': 'text', 'text': 'Creative graphic designer with 6 years of experience in visual design, branding, and content creation. Passionate about creating engaging visual experiences for digital and print media.'},
    
    {'type': 'heading', 'text': 'TECHNICAL SKILLS'},
    {'type': 'text', 'text': '<b>Design Tools:</b> Adobe Photoshop, Illustrator, InDesign, Figma, Sketch'},
    {'type': 'text', 'text': '<b>Video Editing:</b> Adobe Premiere Pro, After Effects'},
    {'type': 'text', 'text': '<b>Web:</b> HTML, CSS (basic)'},
    {'type': 'text', 'text': '<b>Other:</b> Microsoft Office, Google Workspace'},
    
    {'type': 'heading', 'text': 'PROFESSIONAL EXPERIENCE'},
    {'type': 'text', 'text': '<b>Senior Graphic Designer | Creative Agency | 2021 - Present</b>'},
    {'type': 'text', 'text': '• Design marketing materials, logos, and brand identities for clients'},
    {'type': 'text', 'text': '• Create social media graphics and digital advertisements'},
    {'type': 'text', 'text': '• Collaborate with marketing team on campaign visuals'},
    {'type': 'text', 'text': '• Manage multiple projects and meet tight deadlines'},
    {'type': 'spacer', 'text': ''},
    
    {'type': 'text', 'text': '<b>Graphic Designer | Media Company | 2018 - 2021</b>'},
    {'type': 'text', 'text': '• Designed print materials including brochures, flyers, and posters'},
    {'type': 'text', 'text': '• Created website mockups and UI designs'},
    {'type': 'text', 'text': '• Edited photos and videos for marketing campaigns'},
    {'type': 'text', 'text': '• Worked with clients to understand design requirements'},
    
    {'type': 'heading', 'text': 'EDUCATION'},
    {'type': 'text', 'text': '<b>Bachelor of Fine Arts in Graphic Design</b> | Art Institute | 2018'},
    
    {'type': 'heading', 'text': 'PORTFOLIO'},
    {'type': 'text', 'text': 'www.robertmismatch-portfolio.com'},
    
    {'type': 'heading', 'text': 'SKILLS'},
    {'type': 'text', 'text': '• Strong visual communication skills'},
    {'type': 'text', 'text': '• Attention to detail'},
    {'type': 'text', 'text': '• Creative problem solving'},
    {'type': 'text', 'text': '• Client relationship management'},
]

# Create all PDFs
if __name__ == '__main__':
    import os
    
    # Create test_resumes directory if it doesn't exist
    os.makedirs('test_resumes', exist_ok=True)
    
    create_resume_pdf('test_resumes/1_resume_excellent_90pct.pdf', resume1_content)
    create_resume_pdf('test_resumes/2_resume_good_70pct.pdf', resume2_content)
    create_resume_pdf('test_resumes/3_resume_average_50pct.pdf', resume3_content)
    create_resume_pdf('test_resumes/4_resume_below_avg_30pct.pdf', resume4_content)
    create_resume_pdf('test_resumes/5_resume_poor_10pct.pdf', resume5_content)
    
    print("\nAll 5 resume PDFs created successfully!")
    print("Files are in the 'test_resumes' folder")
