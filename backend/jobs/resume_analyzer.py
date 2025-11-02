"""
Resume Analysis Utility for Job Applications

This module provides functionality to analyze resumes against job postings
by extracting text from various file formats and using structured JSON-based matching.
"""

import os
import re
import json
import logging
from typing import Dict, List, Tuple, Set
from django.conf import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s:%(name)s:%(message)s',
    handlers=[
        logging.FileHandler('resume_analysis.log', encoding='utf-8'),
    ]
)


class ResumeAnalyzer:
    """
    Analyzes resumes against job requirements using structured JSON-based matching
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Technology keywords database with variations/synonyms
        self.tech_keywords = {
            'python': ['python', 'py'],
            'javascript': ['javascript', 'js', 'ecmascript'],
            'typescript': ['typescript', 'ts'],
            'react': ['react', 'reactjs', 'react.js'],
            'vue': ['vue', 'vuejs', 'vue.js'],
            'angular': ['angular', 'angularjs'],
            'node.js': ['node.js', 'nodejs', 'node'],
            'django': ['django'],
            'flask': ['flask'],
            'express': ['express', 'expressjs', 'express.js'],
            'fastapi': ['fastapi'],
            'spring': ['spring', 'spring boot', 'springboot'],
            'mysql': ['mysql'],
            'postgresql': ['postgresql', 'postgres', 'psql'],
            'mongodb': ['mongodb', 'mongo'],
            'redis': ['redis'],
            'sqlite': ['sqlite'],
            'aws': ['aws', 'amazon web services'],
            'azure': ['azure', 'microsoft azure'],
            'gcp': ['gcp', 'google cloud'],
            'docker': ['docker'],
            'kubernetes': ['kubernetes', 'k8s'],
            'git': ['git', 'github', 'gitlab'],
            'ci/cd': ['ci/cd', 'cicd', 'jenkins', 'github actions'],
            'agile': ['agile'],
            'scrum': ['scrum'],
            'rest': ['rest', 'restful', 'rest api'],
            'graphql': ['graphql'],
            'html': ['html', 'html5'],
            'css': ['css', 'css3'],
        }
        
        # Education keywords
        self.education_keywords = {
            'bachelor': ['bachelor', "bachelor's", 'bs', 'b.s.', 'ba', 'b.a.'],
            'master': ['master', "master's", 'ms', 'm.s.', 'ma', 'm.a.', 'mba'],
            'phd': ['phd', 'ph.d.', 'doctorate'],
            'computer science': ['computer science', 'cs', 'computer engineering'],
            'software engineering': ['software engineering'],
            'information technology': ['information technology', 'it'],
        }
        
        # Soft skills keywords
        self.soft_skills = {
            'communication': ['communication', 'communicate'],
            'problem-solving': ['problem-solving', 'problem solving', 'analytical'],
            'leadership': ['leadership', 'lead', 'led', 'mentor', 'mentoring'],
            'teamwork': ['teamwork', 'team', 'collaborate', 'collaboration'],
            'adaptability': ['adaptable', 'adaptability', 'flexible'],
        }
    
    def parse_resume_to_json(self, resume_text: str) -> Dict:
        """
        Parse resume text into structured JSON format
        
        Args:
            resume_text (str): Raw text extracted from resume
            
        Returns:
            Dict: Structured resume data
        """
        resume_lower = resume_text.lower()
        
        # Extract technical skills
        found_tech_skills = {}
        for skill_name, variations in self.tech_keywords.items():
            for variation in variations:
                if variation in resume_lower:
                    found_tech_skills[skill_name] = True
                    break
        
        # Extract education
        found_education = {}
        for edu_name, variations in self.education_keywords.items():
            for variation in variations:
                if variation in resume_lower:
                    found_education[edu_name] = True
                    break
        
        # Extract soft skills
        found_soft_skills = {}
        for skill_name, variations in self.soft_skills.items():
            for variation in variations:
                if variation in resume_lower:
                    found_soft_skills[skill_name] = True
                    break
        
        # Extract years of experience (simple pattern matching)
        experience_years = 0
        experience_patterns = [
            r'(\d+)\+?\s*years?\s+(?:of\s+)?experience',
            r'experience.*?(\d+)\+?\s*years?',
        ]
        for pattern in experience_patterns:
            matches = re.findall(pattern, resume_lower)
            if matches:
                try:
                    experience_years = max([int(m) for m in matches])
                    break
                except:
                    pass
        
        return {
            'technical_skills': list(found_tech_skills.keys()),
            'education': list(found_education.keys()),
            'soft_skills': list(found_soft_skills.keys()),
            'experience_years': experience_years,
            'raw_text_length': len(resume_text)
        }
    
    def parse_job_to_json(self, job_description: str, job_requirements: str = "", job_model=None) -> Dict:
        """
        Parse job posting into structured JSON format.
        If job_model is provided with custom fields, use those directly.
        Otherwise, extract from text (legacy behavior).
        
        Args:
            job_description (str): Job description text
            job_requirements (str): Job requirements text
            job_model (Job): Optional Job model instance with required_* fields
            
        Returns:
            Dict: Structured job requirements
        """
        # If job model provided with custom requirements, use them directly
        if job_model and hasattr(job_model, 'required_skills'):
            # Check if the job has custom requirements defined
            has_custom_requirements = (
                job_model.required_skills or 
                job_model.required_education or 
                job_model.required_soft_skills or
                job_model.min_experience_years > 0
            )
            
            if has_custom_requirements:
                # Normalize to lowercase for matching
                return {
                    'required_technical_skills': [skill.lower() for skill in (job_model.required_skills or [])],
                    'required_education': [edu.lower() for edu in (job_model.required_education or [])],
                    'required_soft_skills': [skill.lower() for skill in (job_model.required_soft_skills or [])],
                    'required_experience_years': job_model.min_experience_years or 0
                }
        
        # Fallback to text extraction (for backwards compatibility or when fields not set)
        full_text = f"{job_description} {job_requirements}".lower()
        
        # Extract required technical skills
        required_tech_skills = {}
        for skill_name, variations in self.tech_keywords.items():
            for variation in variations:
                if variation in full_text:
                    required_tech_skills[skill_name] = True
                    break
        
        # Extract required education
        required_education = {}
        for edu_name, variations in self.education_keywords.items():
            for variation in variations:
                if variation in full_text:
                    required_education[edu_name] = True
                    break
        
        # Extract required soft skills
        required_soft_skills = {}
        for skill_name, variations in self.soft_skills.items():
            for variation in variations:
                if variation in full_text:
                    required_soft_skills[skill_name] = True
                    break
        
        # Extract required years of experience
        required_years = 0
        experience_patterns = [
            r'(\d+)\+?\s*years?\s+(?:of\s+)?experience',
            r'minimum.*?(\d+)\+?\s*years?',
        ]
        for pattern in experience_patterns:
            matches = re.findall(pattern, full_text)
            if matches:
                try:
                    required_years = max([int(m) for m in matches])
                    break
                except:
                    pass
        
        return {
            'required_technical_skills': list(required_tech_skills.keys()),
            'required_education': list(required_education.keys()),
            'required_soft_skills': list(required_soft_skills.keys()),
            'required_experience_years': required_years
        }
    
    def calculate_structured_match(self, resume_json: Dict, job_json: Dict) -> Dict:
        """
        Calculate match score using structured JSON data with weighted categories
        
        Scoring weights:
        - Technical Skills: 50%
        - Education: 20%
        - Soft Skills: 15%
        - Experience: 15%
        
        Args:
            resume_json (Dict): Structured resume data
            job_json (Dict): Structured job requirements
            
        Returns:
            Dict: Detailed match analysis
        """
        # Convert lists to sets for easier comparison
        resume_tech = set(resume_json['technical_skills'])
        required_tech = set(job_json['required_technical_skills'])
        
        resume_edu = set(resume_json['education'])
        required_edu = set(job_json['required_education'])
        
        resume_soft = set(resume_json['soft_skills'])
        required_soft = set(job_json['required_soft_skills'])
        
        # Technical Skills Score (50%)
        if required_tech:
            tech_matched = resume_tech & required_tech
            tech_score = (len(tech_matched) / len(required_tech)) * 100
        else:
            tech_score = 100  # No requirements = automatic pass
        
        # Education Score (20%)
        if required_edu:
            edu_matched = resume_edu & required_edu
            edu_score = (len(edu_matched) / len(required_edu)) * 100
        else:
            edu_score = 100
        
        # Soft Skills Score (15%)
        if required_soft:
            soft_matched = resume_soft & required_soft
            soft_score = (len(soft_matched) / len(required_soft)) * 100
        else:
            soft_score = 100
        
        # Experience Score (15%)
        required_years = job_json['required_experience_years']
        resume_years = resume_json['experience_years']
        if required_years > 0:
            if resume_years >= required_years:
                exp_score = 100
            else:
                exp_score = (resume_years / required_years) * 100
        else:
            exp_score = 100
        
        # Calculate weighted total score
        total_score = (
            tech_score * 0.50 +
            edu_score * 0.20 +
            soft_score * 0.15 +
            exp_score * 0.15
        )
        
        return {
            'overall_score': round(total_score, 2),
            'category_scores': {
                'technical_skills': round(tech_score, 2),
                'education': round(edu_score, 2),
                'soft_skills': round(soft_score, 2),
                'experience': round(exp_score, 2)
            },
            'matched': {
                'technical_skills': list(resume_tech & required_tech),
                'education': list(resume_edu & required_edu),
                'soft_skills': list(resume_soft & required_soft),
            },
            'missing': {
                'technical_skills': list(required_tech - resume_tech),
                'education': list(required_edu - resume_edu),
                'soft_skills': list(required_soft - resume_soft),
            },
            'experience': {
                'required_years': required_years,
                'resume_years': resume_years,
                'meets_requirement': resume_years >= required_years if required_years > 0 else True
            }
        }
    
    def extract_text_from_file(self, file_path: str) -> str:
        """
        Extract text from various file formats (PDF, DOC, DOCX, TXT)
        
        Args:
            file_path (str): Path to the resume file
            
        Returns:
            str: Extracted text content
        """
        try:
            file_extension = os.path.splitext(file_path)[1].lower()
            
            if file_extension == '.pdf':
                return self._extract_from_pdf(file_path)
            elif file_extension in ['.doc', '.docx']:
                return self._extract_from_docx(file_path)
            elif file_extension == '.txt':
                return self._extract_from_txt(file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")
                
        except Exception as e:
            print(f"Error extracting text from {file_path}: {str(e)}")
            return ""
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF files using pdfplumber (more reliable than PyPDF2)"""
        try:
            import pdfplumber
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    try:
                        page_text = page.extract_text()
                        if page_text:  # Only process if text was extracted
                            text += page_text + "\n"
                    except Exception:
                        # Skip page if there's an error extracting text
                        continue
            return text
        except ImportError:
            # Fallback to PyPDF2 if pdfplumber is not available
            try:
                import PyPDF2
                text = ""
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page in pdf_reader.pages:
                        try:
                            page_text = page.extract_text()
                            if page_text:
                                text += page_text + "\n"
                        except Exception:
                            continue
                return text
            except ImportError:
                # Fallback: simple text extraction without libraries
                return self._simple_text_extraction(file_path)
        except Exception:
            # Silently fail and return empty string
            return ""
    
    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX files using python-docx"""
        try:
            from docx import Document
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except ImportError:
            # Fallback: simple text extraction without python-docx
            return self._simple_text_extraction(file_path)
        except Exception as e:
            print(f"Error reading DOCX: {str(e)}")
            return ""
    
    def _extract_from_txt(self, file_path: str) -> str:
        """Extract text from TXT files"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            print(f"Error reading TXT: {str(e)}")
            return ""
    
    def _simple_text_extraction(self, file_path: str) -> str:
        """
        Simple fallback text extraction for when specialized libraries aren't available
        """
        try:
            with open(file_path, 'rb') as file:
                content = file.read()
                # Try to decode as text
                try:
                    return content.decode('utf-8')
                except UnicodeDecodeError:
                    try:
                        return content.decode('latin-1')
                    except UnicodeDecodeError:
                        # Extract only ASCII characters
                        return ''.join(chr(b) for b in content if 32 <= b <= 126)
        except Exception as e:
            print(f"Error in simple text extraction: {str(e)}")
            return ""
    
    def extract_keywords_from_job(self, job_description: str, job_requirements: str = "") -> List[str]:
        """
        Extract relevant keywords from job description and requirements with enhanced parsing
        
        Args:
            job_description (str): Job description text
            job_requirements (str): Job requirements text
            
        Returns:
            List[str]: List of extracted keywords prioritized by importance
        """
        # Combine job description and requirements
        full_text = f"{job_description} {job_requirements}"
        
        # Comprehensive technical keywords database
        tech_keywords = {
            # Programming Languages
            'programming': ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 
                          'go', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html', 
                          'css', 'sass', 'less', 'perl', 'shell', 'bash', 'powershell', 'c', 'objective-c'],
            
            # Frontend Technologies
            'frontend': ['react', 'angular', 'vue', 'svelte', 'ember', 'backbone', 'jquery', 
                        'bootstrap', 'tailwind', 'material-ui', 'redux', 'vuex', 'mobx', 'webpack', 
                        'vite', 'parcel', 'gulp', 'grunt', 'npm', 'yarn', 'pnpm'],
            
            # Backend Technologies  
            'backend': ['django', 'flask', 'fastapi', 'spring', 'spring boot', 'node.js', 'express', 
                       'nestjs', 'laravel', 'rails', 'asp.net', '.net', 'core', 'graphql', 'rest', 
                       'api', 'microservices', 'serverless', 'lambda'],
            
            # Databases
            'databases': ['mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 
                         'cassandra', 'elasticsearch', 'dynamodb', 'firestore', 'couchdb', 
                         'neo4j', 'influxdb', 'mariadb', 'sql server'],
            
            # Cloud & DevOps
            'cloud': ['aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'jenkins', 
                     'gitlab', 'github actions', 'terraform', 'ansible', 'puppet', 'chef', 
                     'vagrant', 'ci/cd', 'devops', 'linux', 'ubuntu', 'centos', 'debian'],
            
            # Data & Analytics
            'data': ['tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'matplotlib', 
                    'seaborn', 'jupyter', 'spark', 'hadoop', 'kafka', 'airflow', 'tableau', 
                    'power bi', 'looker', 'data science', 'machine learning', 'ai', 'ml', 'nlp'],
            
            # Mobile Development
            'mobile': ['android', 'ios', 'react native', 'flutter', 'xamarin', 'ionic', 
                      'cordova', 'phonegap', 'native'],
            
            # Testing & Quality
            'testing': ['junit', 'pytest', 'jest', 'mocha', 'cypress', 'selenium', 'postman', 
                       'insomnia', 'unit testing', 'integration testing', 'e2e testing', 'tdd', 'bdd'],
            
            # Soft Skills & Methodologies
            'skills': ['agile', 'scrum', 'kanban', 'waterfall', 'leadership', 'communication', 
                      'teamwork', 'problem-solving', 'analytical', 'project management', 
                      'collaboration', 'mentoring', 'debugging', 'troubleshooting']
        }
        
        # Flatten all tech keywords for easier searching
        all_tech_keywords = []
        for category_keywords in tech_keywords.values():
            all_tech_keywords.extend(category_keywords)
        
        # Extract keywords - focus ONLY on what's explicitly mentioned
        extracted_keywords = []
        text_lower = full_text.lower()
        
        # Strategy 1: Find exact matches of known technical terms (HIGHEST PRIORITY)
        for keyword in all_tech_keywords:
            # Use word boundaries to ensure exact matches
            pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
            if re.search(pattern, text_lower):
                extracted_keywords.append(keyword)
        
        # Strategy 2: Extract explicit requirements from structured lists
        # Look for "Required:", "Must have:", "Should have:", etc.
        requirement_patterns = [
            r'(?:required|must\s+have|required\s+skills?):\s*([^\n]+)',
            r'(?:preferred|nice\s+to\s+have|bonus):\s*([^\n]+)',
            r'(?:qualifications|requirements):\s*([^\n]+)',
        ]
        
        for pattern in requirement_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            for match in matches:
                # Extract tech terms from requirement lines
                for tech_keyword in all_tech_keywords:
                    if tech_keyword.lower() in match.lower():
                        extracted_keywords.append(tech_keyword)
        
        # Strategy 3: Extract from bullet points (but only tech terms)
        bullet_patterns = [
            r'[•▪▫-]\s*(.+?)(?=\n|$)',
            r'(?:^|\n)\s*\d+\.\s*(.+?)(?=\n|$)',
        ]
        
        for pattern in bullet_patterns:
            matches = re.findall(pattern, full_text, re.MULTILINE)
            for match in matches:
                # Only extract if it contains known tech keywords
                for tech_keyword in all_tech_keywords:
                    if re.search(r'\b' + re.escape(tech_keyword.lower()) + r'\b', match.lower()):
                        extracted_keywords.append(tech_keyword)
        
        # Strategy 4: Extract degree requirements (only specific degrees mentioned)
        education_patterns = [
            r'\b(bachelor|master|phd|doctorate|bs|ms|ba|ma)[\s\']?s?\s+(?:degree\s+)?(?:in\s+)?(computer science|software engineering|information technology|engineering|cs)\b',
        ]
        
        for pattern in education_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    for part in match:
                        if part and len(part) > 2 and part not in self.stop_words:
                            extracted_keywords.append(part)
        
        # Clean and deduplicate keywords
        cleaned_keywords = []
        seen = set()
        
        for keyword in extracted_keywords:
            # Clean the keyword
            clean_keyword = keyword.strip().lower()
            if (clean_keyword and 
                len(clean_keyword) > 1 and 
                clean_keyword not in self.stop_words and 
                clean_keyword not in seen and
                not clean_keyword.isdigit()):
                cleaned_keywords.append(keyword)  # Keep original case
                seen.add(clean_keyword)
        
        # Sort by importance (tech keywords first)
        prioritized_keywords = []
        
        # Add tech keywords first (they are what matters most)
        for keyword in cleaned_keywords:
            if keyword.lower() in [k.lower() for k in all_tech_keywords]:
                prioritized_keywords.append(keyword)
        
        # Add education/certification keywords
        for keyword in cleaned_keywords:
            if keyword.lower() not in [k.lower() for k in all_tech_keywords]:
                prioritized_keywords.append(keyword)
        
        return prioritized_keywords[:30]  # Return top 30 most relevant keywords
    
    def _extract_from_structured_sections(self, text: str) -> List[str]:
        """Extract keywords from structured sections like bullet points"""
        keywords = []
        
        # Look for bullet points and requirements lists
        bullet_patterns = [
            r'[•▪▫-]\s*(.+?)(?=\n|$)',  # Bullet points
            r'(?:^|\n)\s*\d+\.\s*(.+?)(?=\n|$)',  # Numbered lists
            r'(?:Required|Must have|Should have|Preferred):\s*(.+?)(?=\n|$)',  # Requirements sections
        ]
        
        for pattern in bullet_patterns:
            matches = re.findall(pattern, text, re.MULTILINE | re.IGNORECASE)
            for match in matches:
                # Extract meaningful terms from each bullet point
                words = re.findall(r'\b[a-zA-Z][a-zA-Z0-9+#.]*\b', match)
                # Filter out stop words and short words immediately
                keywords.extend([w for w in words if len(w) > 2 and w.lower() not in self.stop_words])
        
        return keywords
    
    def _extract_education_requirements(self, text: str) -> List[str]:
        """Extract education and certification requirements"""
        keywords = []
        
        # Education patterns
        education_patterns = [
            r'\b(?:bachelor|master|phd|doctorate|degree)\s*(?:in\s*)?([a-zA-Z\s]+)',
            r'\b(computer science|software engineering|information technology|it|cs|engineering)\b',
            r'\b(?:certified|certification)\s*(?:in\s*)?([a-zA-Z\s]+)',
        ]
        
        for pattern in education_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    keywords.extend([m.strip() for m in match if m.strip()])
                else:
                    keywords.append(match.strip())
        
        return keywords
    
    def _extract_experience_requirements(self, text: str) -> List[str]:
        """Extract experience requirements"""
        keywords = []
        
        # Experience patterns
        experience_patterns = [
            r'(\d+)\s*(?:\+)?\s*years?\s*(?:of\s*)?(?:experience\s*)?(?:in\s*|with\s*)([a-zA-Z\s.+#]+)',
            r'(?:experience\s*(?:in|with)\s*)([a-zA-Z\s.+#]+)',
            r'(?:proficient\s*(?:in|with)\s*)([a-zA-Z\s.+#]+)',
            r'(?:knowledge\s*(?:of|in)\s*)([a-zA-Z\s.+#]+)',
        ]
        
        for pattern in experience_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    # Extract technology/skill names from experience requirements
                    for part in match:
                        if part and not part.isdigit():
                            tech_words = re.findall(r'\b[a-zA-Z][a-zA-Z0-9+#.]*\b', part)
                            # Filter out stop words
                            keywords.extend([w for w in tech_words if len(w) > 2 and w.lower() not in self.stop_words])
                else:
                    tech_words = re.findall(r'\b[a-zA-Z][a-zA-Z0-9+#.]*\b', match)
                    # Filter out stop words
                    keywords.extend([w for w in tech_words if len(w) > 2 and w.lower() not in self.stop_words])
        
        return keywords
    
    def _extract_domain_keywords(self, text: str) -> List[str]:
        """Extract domain-specific and contextual keywords"""
        keywords = []
        
        # Look for commonly mentioned industry terms
        domain_patterns = [
            r'\b(?:full.?stack|front.?end|back.?end|full.stack|frontend|backend)\b',
            r'\b(?:senior|junior|lead|principal|staff|architect)\b',
            r'\b(?:developer|engineer|programmer|analyst|specialist|manager)\b',
            r'\b(?:web\s*development|mobile\s*development|software\s*development)\b',
            r'\b(?:e.?commerce|fintech|healthcare|finance|banking|retail)\b',
        ]
        
        for pattern in domain_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            keywords.extend(matches)
        
        return keywords
    
    def calculate_match_score(self, resume_text: str, keywords: List[str]) -> Dict:
        """
        Calculate how well a resume matches the job keywords
        
        Args:
            resume_text (str): Extracted resume text
            keywords (List[str]): List of keywords from job posting
            
        Returns:
            Dict: Match results including score, matched keywords, and missing keywords
        """
        import logging
        logging.basicConfig(filename='resume_analysis.log', level=logging.DEBUG)
        
        if not resume_text or not keywords:
            logging.warning(f"Empty input: resume_text={len(resume_text) if resume_text else 0}, keywords={len(keywords)}")
            return {
                'score': 0,
                'matched_keywords': [],
                'missing_keywords': keywords,
                'total_keywords': len(keywords),
                'match_percentage': 0
            }
        
        resume_text_lower = resume_text.lower()
        matched_keywords = []
        missing_keywords = []
        
        logging.info(f"First 500 chars of resume (lowercase): {resume_text_lower[:500]}")
        logging.info(f"Keywords to match: {keywords}")
        
        for keyword in keywords:
            keyword_lower = keyword.lower()
            if keyword_lower in resume_text_lower:
                matched_keywords.append(keyword)
                logging.debug(f"  MATCHED: {keyword}")
            else:
                missing_keywords.append(keyword)
                logging.debug(f"  MISSING: {keyword}")
        
        # Calculate score (0-100)
        if len(keywords) > 0:
            match_percentage = (len(matched_keywords) / len(keywords)) * 100
        else:
            match_percentage = 0
        
        logging.info(f"Matched {len(matched_keywords)}/{len(keywords)} keywords")
        
        return {
            'score': round(match_percentage, 2),
            'matched_keywords': matched_keywords,
            'missing_keywords': missing_keywords,
            'total_keywords': len(keywords),
            'match_percentage': round(match_percentage, 2)
        }
    
    def analyze_application(self, job_application) -> Dict:
        """
        Analyze a job application's resume against the job requirements using JSON-based structured matching
        
        Args:
            job_application: JobApplication model instance
            
        Returns:
            Dict: Complete analysis results with category breakdowns
        """
        if not job_application.resume:
            return {
                'error': 'No resume file found',
                'score': 0,
                'analysis': None
            }
        
        try:
            # Get the full path to the resume file
            resume_path = job_application.resume.path
            
            self.logger.info(f"=== Starting JSON-based analysis for: {resume_path} ===")
            
            # Extract text from resume
            resume_text = self.extract_text_from_file(resume_path)
            self.logger.info(f"Extracted text length: {len(resume_text)} characters")
            
            if not resume_text.strip():
                self.logger.error("Resume text is empty after extraction")
                return {
                    'error': 'Could not extract text from resume',
                    'score': 0,
                    'analysis': None
                }
            
            # Parse resume into structured JSON
            resume_json = self.parse_resume_to_json(resume_text)
            self.logger.info(f"Resume JSON: {json.dumps(resume_json, indent=2)}")
            
            # Parse job requirements into structured JSON
            # Pass job_model to use custom requirements if available
            job_json = self.parse_job_to_json(
                job_application.job.description,
                job_application.job.requirements or "",
                job_model=job_application.job
            )
            self.logger.info(f"Job JSON: {json.dumps(job_json, indent=2)}")
            
            # Calculate structured match score
            match_results = self.calculate_structured_match(resume_json, job_json)
            self.logger.info(f"Overall Match Score: {match_results['overall_score']}%")
            self.logger.info(f"Category Scores: {json.dumps(match_results['category_scores'], indent=2)}")
            
            # Generate summary
            summary = self.generate_structured_summary(match_results)
            
            return {
                'error': None,
                'score': match_results['overall_score'],
                'analysis': {
                    'resume_structure': resume_json,
                    'job_requirements': job_json,
                    'overall_score': match_results['overall_score'],
                    'category_scores': match_results['category_scores'],
                    'matched': match_results['matched'],
                    'missing': match_results['missing'],
                    'experience': match_results['experience'],
                    'summary': summary
                }
            }
            
        except Exception as e:
            self.logger.error(f"Analysis error: {str(e)}", exc_info=True)
            return {
                'error': f'Analysis failed: {str(e)}',
                'score': 0,
                'analysis': None
            }
    
    def generate_structured_summary(self, match_results: Dict) -> str:
        """
        Generate a concise human-readable summary from structured match results
        
        Args:
            match_results: Dictionary containing structured match analysis
            
        Returns:
            str: Concise human-readable summary with key insights
        """
        score = match_results['overall_score']
        tech_score = match_results['category_scores']['technical_skills']
        edu_score = match_results['category_scores']['education']
        soft_score = match_results['category_scores']['soft_skills']
        exp_score = match_results['category_scores']['experience']
        
        # Overall assessment
        if score >= 90:
            rating = "EXCEPTIONAL"
            action = "HIGHLY RECOMMENDED"
        elif score >= 80:
            rating = "EXCELLENT"
            action = "STRONGLY RECOMMENDED"
        elif score >= 70:
            rating = "GOOD"
            action = "RECOMMENDED"
        elif score >= 60:
            rating = "FAIR"
            action = "CONSIDER WITH CAUTION"
        elif score >= 50:
            rating = "MARGINAL"
            action = "BORDERLINE"
        else:
            rating = "POOR"
            action = "NOT RECOMMENDED"
        
        # Build concise summary
        summary = f"MATCH SCORE: {score}% - {rating} ({action})\n\n"
        
        # Category breakdown (single line)
        summary += f"Technical: {tech_score}% | Education: {edu_score}% | Soft Skills: {soft_score}% | Experience: {exp_score}%\n\n"
        
        # Key matched skills (top 8)
        matched_tech = match_results['matched']['technical_skills']
        matched_edu = match_results['matched']['education']
        matched_soft = match_results['matched']['soft_skills']
        
        all_matched = []
        if matched_tech:
            all_matched.extend(matched_tech[:6])
        if matched_edu:
            all_matched.extend(matched_edu[:2])
        if matched_soft:
            all_matched.extend(matched_soft[:2])
        
        if all_matched:
            summary += f"[+] MATCHED: {', '.join(all_matched[:8])}"
            if len(all_matched) > 8:
                summary += f" (+{len(all_matched) - 8} more)"
            summary += "\n"
        
        # Critical missing skills (top 6)
        missing_tech = match_results['missing']['technical_skills']
        missing_edu = match_results['missing']['education']
        missing_soft = match_results['missing']['soft_skills']
        
        all_missing = []
        if missing_tech:
            all_missing.extend(missing_tech[:4])
        if missing_edu:
            all_missing.extend(missing_edu[:1])
        if missing_soft:
            all_missing.extend(missing_soft[:1])
        
        if all_missing:
            summary += f"[-] MISSING: {', '.join(all_missing[:6])}"
            if len(all_missing) > 6:
                summary += f" (+{len(all_missing) - 6} more)"
            summary += "\n"
        
        # Experience note
        exp = match_results['experience']
        if exp['required_years'] > 0:
            if exp['meets_requirement']:
                summary += f"\n[!] Experience: {exp['resume_years']}+ years (meets {exp['required_years']}+ requirement)\n"
            else:
                summary += f"\n[!] Experience: {exp['resume_years']} years (needs {exp['required_years']}+ years)\n"
        
        # Bottom line recommendation (concise)
        summary += f"\nRECOMMENDATION: "
        if score >= 80:
            summary += "Schedule interview - well qualified for role"
        elif score >= 70:
            summary += "Solid candidate with minor gaps - assess learning ability"
        elif score >= 60:
            summary += "Has potential but notable gaps - probe depth carefully"
        elif score >= 50:
            summary += "Borderline fit - would need significant development"
        else:
            summary += "Does not meet minimum requirements"
        
        return summary
    
    def generate_analysis_summary(self, match_results: Dict, total_keywords: int) -> str:
        """
        Generate a human-readable summary of the analysis results
        
        Args:
            match_results: Dictionary containing match analysis results
            total_keywords: Total number of keywords extracted from job posting
            
        Returns:
            str: Human-readable summary
        """
        score = match_results['score']
        matched_count = len(match_results['matched_keywords'])
        missing_count = len(match_results['missing_keywords'])
        
        if score >= 80:
            overall = "excellent"
        elif score >= 60:
            overall = "good"
        elif score >= 40:
            overall = "fair"
        else:
            overall = "poor"
        
        summary = f"This resume shows an {overall} match for the position with a {score}% compatibility score. "
        
        if matched_count > 0:
            summary += f"The candidate demonstrates relevant experience in {matched_count} key areas including "
            if len(match_results['matched_keywords']) <= 3:
                summary += f"{', '.join(match_results['matched_keywords'])}. "
            else:
                summary += f"{', '.join(match_results['matched_keywords'][:3])} and {len(match_results['matched_keywords']) - 3} other skills. "
        
        if missing_count > 0:
            if missing_count <= 3:
                missing_skills = ', '.join(match_results['missing_keywords'])
                summary += f"However, the resume lacks mention of {missing_skills}, which may require further evaluation during the interview process."
            else:
                summary += f"The resume lacks {missing_count} key requirements which may need to be addressed during the interview process."
        else:
            summary += "The candidate appears to meet all stated requirements for this position."
        
        return summary
    
    def analyze_resume_file(self, resume_file, job) -> Dict:
        """
        Analyze an uploaded resume file against a job posting without creating an application.
        This is for bulk analysis scenarios.
        
        Args:
            resume_file: UploadedFile object from Django
            job: Job model instance
            
        Returns:
            Dict: Complete analysis results with category breakdowns
        """
        try:
            import tempfile
            import os
            
            # Create a temporary file to save the uploaded file
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(resume_file.name)[1]) as tmp_file:
                for chunk in resume_file.chunks():
                    tmp_file.write(chunk)
                tmp_path = tmp_file.name
            
            try:
                self.logger.info(f"=== Starting bulk analysis for: {resume_file.name} ===")
                
                # Extract text from resume
                resume_text = self.extract_text_from_file(tmp_path)
                self.logger.info(f"Extracted text length: {len(resume_text)} characters")
                
                if not resume_text.strip():
                    self.logger.error("Resume text is empty after extraction")
                    return {
                        'error': 'Could not extract text from resume',
                        'score': 0,
                        'analysis': None
                    }
                
                # Parse resume into structured JSON
                resume_json = self.parse_resume_to_json(resume_text)
                self.logger.info(f"Resume JSON: {json.dumps(resume_json, indent=2)}")
                
                # Parse job requirements into structured JSON
                # Pass job_model to use custom requirements if available
                job_json = self.parse_job_to_json(
                    job.description,
                    job.requirements or "",
                    job_model=job
                )
                self.logger.info(f"Job JSON: {json.dumps(job_json, indent=2)}")
                
                # Calculate structured match score
                match_results = self.calculate_structured_match(resume_json, job_json)
                self.logger.info(f"Overall Match Score: {match_results['overall_score']}%")
                
                # Generate summary
                summary = self.generate_structured_summary(match_results)
                
                return {
                    'error': None,
                    'score': match_results['overall_score'],
                    'analysis': {
                        'resume_structure': resume_json,
                        'job_requirements': job_json,
                        'overall_score': match_results['overall_score'],
                        'category_scores': match_results['category_scores'],
                        'matched_keywords': match_results['matched'],
                        'missing_keywords': match_results['missing'],
                        'experience': match_results['experience'],
                        'summary': summary
                    }
                }
                
            finally:
                # Clean up temporary file
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
                    
        except Exception as e:
            self.logger.exception(f"Error analyzing resume file {resume_file.name}")
            return {
                'error': str(e),
                'score': 0,
                'analysis': None
            }
    
    def analyze_multiple_applications(self, job_applications) -> List[Dict]:
        """
        Analyze multiple job applications and return sorted results
        
        Args:
            job_applications: QuerySet of JobApplication instances
            
        Returns:
            List[Dict]: List of analysis results sorted by score (descending)
        """
        results = []
        
        for application in job_applications:
            analysis = self.analyze_application(application)
            results.append({
                'application_id': application.id,
                'applicant_name': application.applicant.username,
                'applicant_email': application.applicant.email,
                'applied_at': application.applied_at,
                'analysis': analysis
            })
        
        # Sort by score (highest first)
        results.sort(key=lambda x: x['analysis']['score'], reverse=True)
        
        return results


# Global instance
resume_analyzer = ResumeAnalyzer()