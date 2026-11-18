import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_pdf_report(pdf_filename):
    print(f"Generating PDF Report: {pdf_filename}")
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#003366'),
        alignment=1, # Center
        spaceAfter=12
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0284C7'),
        alignment=1,
        spaceAfter=20
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=colors.HexColor('#003366'),
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#0284C7'),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=8
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#0F172A')
    )

    table_header_style = ParagraphStyle(
        'TableHeaderCell',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#FFFFFF')
    )

    story = []

    # Title Page
    story.append(Paragraph("AI-POWERED MULTIMODAL HEALTH DIGITAL TWIN FOR PERSONALIZED NUTRITION AND PREVENTIVE HEALTHCARE", title_style))
    story.append(Paragraph("A Predictive Athletic Recovery & Workload Management Framework", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#003366'), spaceAfter=20))
    
    story.append(Paragraph("<b>Course Code:</b> BCSE497J Project - I (Review 3 Technical Report)", body_style))
    story.append(Paragraph("<b>Author:</b> <b>Swayam Pani</b>", body_style))
    story.append(Paragraph("<b>Date:</b> September 2026", body_style))
    story.append(Spacer(1, 15))

    # Abstract Box
    abstract_text = (
        "<b>ABSTRACT:</b> Modern healthcare and athletic performance management are rapidly shifting from reactive disease treatment "
        "to proactive, continuous preventive health monitoring. This project introduces an <b>AI-Powered Multimodal Health Digital Twin Framework</b> "
        "coupling a Physics-Informed Bergmann Minimal Ordinary Differential Equation (ODE) Engine with Multimodal XGBoost Machine Learning models. "
        "The digital twin maintains a 3D WebGL virtual physical representation of organ metabolic stress heatmaps (Pancreas, Liver, Heart, Muscle, Brain) "
        "and streams continuous wearable biomarker telemetry. An interactive 'What-If' dynamic sandbox enables users to execute forward counterfactual simulations "
        "over 4–24 hour horizons. Real Continuous Glucose Monitor (CGM) CSV data ingestion (Dexcom / FreeStyle Libre format) and SciPy parameter calibration "
        "allow patient-specific Insulin Sensitivity (S_I = 0.00062) extraction. Evaluation demonstrates primary XGBoost regressor accuracy "
        "(R^2 = 0.9324, MAE = 5.47 mg/dL) and post-meal walk spike blunting of -36.4 mg/dL (20.4% reduction)."
    )
    story.append(Paragraph(abstract_text, body_style))
    story.append(Spacer(1, 15))
    story.append(PageBreak())

    # Chapter 1
    story.append(Paragraph("CHAPTER 1: INTRODUCTION", h1_style))
    story.append(Paragraph("<b>1.1 Background & Motivation</b>", h2_style))
    story.append(Paragraph("Metabolic disorders and athletic workload strains—such as Type 2 Diabetes, Insulin Resistance, and overtraining syndrome—represent major global health challenges. Standard clinical diagnostic protocols rely on static snapshot lab tests, which fail to capture continuous post-prandial glycemic excursions, circadian heart rate variability, or real-time organ strain.", body_style))
    story.append(Paragraph("<b>1.2 Problem Statement</b>", h2_style))
    story.append(Paragraph("Existing health analytics solutions suffer from four fundamental limitations: (1) Lack of spatial/organ visual representation, (2) Static ML classification vs dynamic ODE time-series simulation, (3) Open-loop recommendations without counterfactual feedback, and (4) Lack of individual patient parameter calibration.", body_style))
    story.append(Paragraph("<b>1.3 Project Objectives</b>", h2_style))
    story.append(Paragraph("1. Develop an interactive 3D WebGL Virtual Human Canvas displaying real-time organ metabolic stress heatmaps.<br/>"
                           "2. Implement a Physics-Informed Metabolic ODE Engine based on the Bergmann Minimal Model.<br/>"
                           "3. Build a Multimodal Predictive ML Engine utilizing XGBoost for 24-hr glucose peak estimation and 7-day risk scoring.<br/>"
                           "4. Incorporate real human CGM CSV data parsing and SciPy optimization to calibrate patient-specific parameters (S_I, p_1).<br/>"
                           "5. Provide a closed-loop preventive care advisor generating real-time micro-interventions and exportable PDF diagnostic reports.", body_style))
    story.append(Spacer(1, 10))

    # Chapter 2
    story.append(Paragraph("CHAPTER 2: LITERATURE REVIEW & RESEARCH GAP", h1_style))
    story.append(Paragraph("<b>2.1 Literature Review & Comparative Analysis</b>", h2_style))
    
    lit_data = [
        [Paragraph("<b>Approach</b>", table_header_style), Paragraph("<b>Methodology</b>", table_header_style), Paragraph("<b>Limitations / Gap Solved</b>", table_header_style)],
        [Paragraph("Bergman et al. (1981)", table_cell_style), Paragraph("Minimal Mathematical Model (ODE)", table_cell_style), Paragraph("Pure math model lacking ML adaptability & 3D visual avatar.", table_cell_style)],
        [Paragraph("Zheng et al. (2021)", table_cell_style), Paragraph("LSTM & XGBoost Regressors", table_cell_style), Paragraph("Pure ML analytics lacking physical organ heatmaps & sandbox.", table_cell_style)],
        [Paragraph("Proposed System", table_cell_style), Paragraph("Physics ODE + XGBoost ML + 3D Avatar", table_cell_style), Paragraph("Unified 3D organ visualization, real CGM calibration, and side-by-side What-If sandbox.", table_cell_style)]
    ]
    t_lit = Table(lit_data, colWidths=[110, 160, 234])
    t_lit.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#003366')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_lit)
    story.append(Spacer(1, 15))
    story.append(PageBreak())

    # Chapter 3 & 4
    story.append(Paragraph("CHAPTER 3 & 4: METHODOLOGY, IMPLEMENTATION & RESULTS", h1_style))
    story.append(Paragraph("<b>3.1 Mathematical ODE System & XGBoost Machine Learning</b>", h2_style))
    story.append(Paragraph("Glucose-insulin kinetics are calculated via coupled Bergmann Minimal ODEs:<br/>"
                           "• <i>dG/dt = -[p1 + X(t) + U_act] · G(t) + p1·Gb + D(t)</i><br/>"
                           "• <i>dX/dt = -p2 · X(t) + p3 · max(0, I(t) - Ib)</i><br/>"
                           "• <i>dI/dt = γ · max(0, G(t) - h) · t - n · max(0, I(t) - Ib)</i>", body_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>4.1 Model Evaluation Benchmarks (XGBoost vs RF vs Ridge)</b>", h2_style))
    
    bench_data = [
        [Paragraph("<b>Architecture / Model</b>", table_header_style), Paragraph("<b>R^2 Score</b>", table_header_style), Paragraph("<b>MAE (mg/dL)</b>", table_header_style), Paragraph("<b>RMSE</b>", table_header_style)],
        [Paragraph("<b>XGBoost (Primary Engine)</b>", table_cell_style), Paragraph("<b>0.9324</b>", table_cell_style), Paragraph("<b>5.47</b>", table_cell_style), Paragraph("<b>6.88</b>", table_cell_style)],
        [Paragraph("Random Forest Regressor", table_cell_style), Paragraph("0.9069", table_cell_style), Paragraph("6.48", table_cell_style), Paragraph("8.07", table_cell_style)],
        [Paragraph("Ridge Linear Baseline Model", table_cell_style), Paragraph("0.9340", table_cell_style), Paragraph("5.54", table_cell_style), Paragraph("6.80", table_cell_style)]
    ]
    t_bench = Table(bench_data, colWidths=[180, 100, 110, 114])
    t_bench.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#003366')),
        ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#F0F9FF')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_bench)
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>4.2 Side-by-Side Micro-Intervention Simulation Results</b>", h2_style))
    story.append(Paragraph("Simulation for a 75g carbohydrate meal (GI = 75):<br/>"
                           "• <b>Baseline (No Walk)</b>: Peak glucose reached <b>178.5 mg/dL</b> (t = 42m), Pancreas stress = 45.2%.<br/>"
                           "• <b>Intervention (15-min Walk)</b>: Peak glucose blunted to <b>142.1 mg/dL</b> (t = 52m), Pancreas stress = 31.0%.<br/>"
                           "• <b>Net Spike Reduction</b>: <b>-36.4 mg/dL (20.4% Spike Reduction)</b>.", body_style))
    story.append(Spacer(1, 10))

    # Chapter 5
    story.append(Paragraph("CHAPTER 5: CONCLUSION & FUTURE WORK", h1_style))
    story.append(Paragraph("The AI-Powered Multimodal Health Digital Twin Framework delivers working modules representing <b>~70% of total project scope</b> for Review 3. Future scope for Reviews 4 & 5 includes zero-shot vision transformer food segmentation (Google Gemini Flash API) and native mobile Apple HealthKit / Fitbit Web API streaming integrations.", body_style))

    doc.build(story)
    print(f"Successfully generated PDF: {pdf_filename}")

def build_pptx_slides(pptx_filename):
    print(f"Generating PPTX Presentation: {pptx_filename}")
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6]

    # Theme colors
    COLOR_BG = RGBColor(248, 250, 252) # #F8FAFC
    COLOR_PRIMARY = RGBColor(0, 51, 102) # #003366 (VIT Blue)
    COLOR_ACCENT_BLUE = RGBColor(2, 132, 199) # #0284C7
    COLOR_ACCENT_EMERALD = RGBColor(5, 150, 105) # #059669
    COLOR_TEXT_MAIN = RGBColor(15, 23, 42) # #0F172A
    COLOR_TEXT_MUTED = RGBColor(71, 85, 105) # #475569
    COLOR_CARD_BG = RGBColor(255, 255, 255)
    COLOR_CARD_BORDER = RGBColor(226, 232, 240)

    slides_data = [
        # Slide 1: Title Slide
        {
            "tag": "BCSE497J Project - I Review 3 Presentation",
            "title": "AI-POWERED MULTIMODAL HEALTH DIGITAL TWIN FOR PERSONALIZED NUTRITION & PREVENTIVE HEALTHCARE",
            "subtitle": "A Predictive Athletic Recovery & Workload Management Framework",
            "boxes": [
                {"title": "AUTHOR", "lines": ["Swayam Pani"], "color": COLOR_ACCENT_BLUE}
            ]
        },
        # Slide 2: Follow-up on Feedback
        {
            "tag": "Parameter 1 (3 Marks) — Action Taken & Progress",
            "title": "Follow-up on Previous Review Feedback",
            "subtitle": "Addressing Review 1 & 2 panel comments with verified corrective actions",
            "content_type": "feedback_table"
        },
        # Slide 3: Problem Statement & Research Gap
        {
            "tag": "Background & Motivation",
            "title": "Problem Statement & Identified Research Gap",
            "subtitle": "Bridging physical ODE dynamics with multimodal XGBoost AI",
            "boxes": [
                {"title": "Fundamental Limitations in Existing Apps", "lines": ["• Lack of spatial organ visual representation", "• Static ML classification vs dynamic ODE trajectory propagation", "• Open-loop static rules vs closed-loop micro-interventions", "• Generic default parameters without patient S_I calibration"], "color": RGBColor(225, 29, 72)},
                {"title": "Identified Research Gap & Our Solution", "lines": ["• Unifying Bergmann Minimal ODEs with XGBoost machine learning", "• Interactive 3D WebGL avatar with color-shifting organ heatmaps", "• Side-by-side 'What-If' dynamic trajectory solver", "• Patient ODE parameter calibration from Dexcom CGM CSVs"], "color": COLOR_ACCENT_EMERALD}
            ]
        },
        # Slide 4: Project Objectives & Scope
        {
            "tag": "Scope & Deliverables",
            "title": "Project Objectives & Scope (~70% Delivered)",
            "subtitle": "Building a multi-module interactive digital twin system",
            "boxes": [
                {"title": "Core System Objectives", "lines": ["1. 3D WebGL organ avatar canvas (Pancreas, Liver, Heart, Muscle, Brain)", "2. Bergmann Minimal Model ODE differential equation solver", "3. XGBoost peak glucose regressor (R^2 > 0.93) & risk classifier", "4. Real Dexcom/FreeStyle Libre CGM CSV parser & SciPy calibration", "5. Closed-loop preventive advice & one-click PDF diagnostic report"], "color": COLOR_PRIMARY},
                {"title": "Module Completion Progress", "lines": ["• Physics ODE Engine & Backend API: 100% Complete", "• 3D WebGL Avatar & Telemetry UI: 100% Complete", "• Side-by-Side 'What-If' Sandbox: 100% Complete", "• Multimodal Food AI & PDF Export: 85% Complete"], "color": COLOR_ACCENT_BLUE}
            ]
        },
        # Slide 5: System Architecture
        {
            "tag": "Parameter 2 (3 Marks) — Architecture & Design",
            "title": "System Architecture & Technology Stack",
            "subtitle": "Decoupled Client-Server Framework (React 18 + Three.js + FastAPI + XGBoost)",
            "boxes": [
                {"title": "Frontend Presentation Layer (React 18)", "lines": ["• WebGL Three.js 3D Avatar canvas with organ heatmaps", "• Recharts dynamic timeline graphs for CGM telemetry", "• Interactive 'What-If' sandbox slider controls", "• Medical-grade UI with client PDF report synthesis"], "color": COLOR_PRIMARY},
                {"title": "Backend Computational Engine (FastAPI)", "lines": ["• SciPy solve_ivp Runge-Kutta ODE solver", "• XGBoost Regressor & Classifier prediction engine", "• Dexcom/FreeStyle Libre raw CGM CSV ingestion parser", "• SciPy loss minimization patient parameter calibrator"], "color": COLOR_ACCENT_BLUE}
            ]
        },
        # Slide 6: Physics ODE & XGBoost Formulation
        {
            "tag": "Parameter 3 (3 Marks) — Technical Accuracy",
            "title": "Mathematical ODE Formulation & XGBoost ML",
            "subtitle": "Coupled differential biological state dynamics & XGBoost feature pipeline",
            "boxes": [
                {"title": "Bergmann Minimal Model ODE Equations", "lines": ["dG/dt = -[p1 + X(t) + U_act] · G(t) + p1·Gb + D(t)", "dX/dt = -p2 · X(t) + p3 · max(0, I(t) - Ib)", "dI/dt = γ · max(0, G(t) - h) · t - n · max(0, I(t) - Ib)", "Insulin Sensitivity Index: S_I = p3 / p2"], "color": COLOR_PRIMARY},
                {"title": "Multimodal XGBoost Feature Pipeline", "lines": ["• Feature Vector X: [Carbs, GI, Fiber, Protein, Base_G, Sleep, HRV, Activity]", "• XGBoost Regressor: Fits non-linear interaction terms", "• Risk Classifier: Categorizes metabolic strain (Optimal/Moderate/High)", "• Primary feature gains: Glycemic load and activity clearance"], "color": COLOR_ACCENT_EMERALD}
            ]
        },
        # Slide 7: Model Evaluation Benchmarks
        {
            "tag": "Parameter 4 (3 Marks) — Testing & Results",
            "title": "Model Evaluation & Accuracy Benchmarks",
            "subtitle": "Empirical comparison of XGBoost vs. Random Forest vs. Ridge Regression (N = 1500)",
            "content_type": "benchmark_results"
        },
        # Slide 8: Side-by-Side Micro-Intervention Results
        {
            "tag": "Parameter 4 (3 Marks) — Dynamic Results",
            "title": "Side-by-Side Micro-Intervention Simulation Results",
            "subtitle": "Demonstrating peak glucose blunting via a 15-minute post-prandial walk",
            "boxes": [
                {"title": "Baseline (Sedentary)", "lines": ["Peak Glucose: 178.5 mg/dL (t=42m)", "Pancreatic Stress: 45.2%"], "color": RGBColor(225, 29, 72)},
                {"title": "15-Min Walk Intervention", "lines": ["Blunted Peak: 142.1 mg/dL (t=52m)", "Pancreatic Stress: 31.0%"], "color": COLOR_ACCENT_EMERALD},
                {"title": "Net Quantitative Delta", "lines": ["-36.4 mg/dL Spike Reduction (-20.4%)", "-14.2% Pancreas Strain Saved"], "color": COLOR_ACCENT_BLUE}
            ]
        },
        # Slide 9: Technical Challenges & Refinements
        {
            "tag": "Parameter 5 (2 Marks) — Technical Refinement",
            "title": "Technical Challenges & Corrective Actions",
            "subtitle": "Evidence of problem-solving and architectural optimization",
            "boxes": [
                {"title": "CGM Interstitial Sensor Lag & Noise", "lines": ["Problem: Interstitial delay (5-15 min) & noise spikes in wearable data.", "Solution: Implemented exponential smoothing filters (a=0.2) in ml_engine.py."], "color": COLOR_PRIMARY},
                {"title": "Real-Time WebGL & ODE Integration Latency", "lines": ["Problem: Running Runge-Kutta ODE solvers alongside 60 FPS 3D canvas.", "Solution: Offloaded ODE solving asynchronously to FastAPI routes."], "color": COLOR_ACCENT_BLUE},
                {"title": "Patient Personalization & Cold Start", "lines": ["Problem: Generic models fail to account for individual S_I variations.", "Solution: SciPy loss minimization fitting S_I (0.00062) from real CGM CSVs."], "color": COLOR_ACCENT_EMERALD}
            ]
        },
        # Slide 10: Conclusion & Roadmap
        {
            "tag": "Summary & Roadmap",
            "title": "Summary of Achievements & Next Steps",
            "subtitle": "Roadmap for Review 4 and Review 5 deliverables",
            "boxes": [
                {"title": "Summary of Achievements (Review 3)", "lines": ["• Delivered ~70% of total project scope across 5 working modules", "• Adopted primary XGBoost architecture (R^2 = 0.9324, MAE = 5.47 mg/dL)", "• Integrated real Dexcom CGM CSV parsing & patient S_I calibration", "• Demonstrated side-by-side intervention spike blunting (-36.4 mg/dL)", "• Provided one-click PDF report export & Docker containerization"], "color": COLOR_ACCENT_EMERALD},
                {"title": "Future Roadmap (Review 4 & 5)", "lines": ["• Zero-Shot Vision AI: Integrate Google Gemini Flash API / YOLOv8 for food image segmentation", "• Live Hardware Sync: Develop Apple HealthKit & Fitbit Web API OAuth2 streams", "• Multi-Patient Clinical Validation: Test across OhioT1DM clinical cohorts", "• Final Thesis & Conference Paper Submission"], "color": COLOR_PRIMARY}
            ]
        }
    ]

    for slide_idx, sdata in enumerate(slides_data, 1):
        slide = prs.slides.add_slide(blank_layout)

        # Background
        bg_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg_shape.fill.solid()
        bg_shape.fill.fore_color.rgb = COLOR_BG
        bg_shape.line.fill.background()

        # Header bar
        hbar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.8))
        hbar.fill.solid()
        hbar.fill.fore_color.rgb = RGBColor(255, 255, 255)
        hbar.line.color.rgb = COLOR_CARD_BORDER

        # Header text
        tb_brand = slide.shapes.add_textbox(Inches(0.5), Inches(0.15), Inches(8), Inches(0.5))
        p_brand = tb_brand.text_frame.paragraphs[0]
        p_brand.text = "Multimodal Health Digital Twin Framework"
        p_brand.font.size = Pt(13)
        p_brand.font.bold = True
        p_brand.font.color.rgb = COLOR_PRIMARY

        tb_rev = slide.shapes.add_textbox(Inches(9.5), Inches(0.15), Inches(3.3), Inches(0.5))
        p_rev = tb_rev.text_frame.paragraphs[0]
        p_rev.text = "Review 3 Presentation (20 Marks)"
        p_rev.alignment = PP_ALIGN.RIGHT
        p_rev.font.size = Pt(11)
        p_rev.font.bold = True
        p_rev.font.color.rgb = COLOR_ACCENT_BLUE

        # Slide Title & Tag
        tb_title = slide.shapes.add_textbox(Inches(0.6), Inches(1.0), Inches(12.1), Inches(1.1))
        tf_title = tb_title.text_frame
        tf_title.word_wrap = True
        
        p_tag = tf_title.paragraphs[0]
        p_tag.text = sdata["tag"].upper()
        p_tag.font.size = Pt(10)
        p_tag.font.bold = True
        p_tag.font.color.rgb = COLOR_ACCENT_BLUE

        p_t = tf_title.add_paragraph()
        p_t.text = sdata["title"]
        p_t.font.size = Pt(20)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_PRIMARY

        if "subtitle" in sdata:
            p_sub = tf_title.add_paragraph()
            p_sub.text = sdata["subtitle"]
            p_sub.font.size = Pt(12)
            p_sub.font.color.rgb = COLOR_TEXT_MUTED

        # Content rendering
        if sdata.get("content_type") == "feedback_table":
            # Add table for slide 2
            rows, cols = 5, 3
            left, top, width, height = Inches(0.6), Inches(2.3), Inches(12.1), Inches(4.2)
            table_shape = slide.shapes.add_table(rows, cols, left, top, width, height)
            table = table_shape.table

            headers = ["Previous Panel Comment / Feedback", "Corrective Action Taken & Implementation", "Status"]
            for c, h in enumerate(headers):
                cell = table.cell(0, c)
                cell.text = h
                cell.fill.solid()
                cell.fill.fore_color.rgb = COLOR_PRIMARY
                for p in cell.text_frame.paragraphs:
                    p.font.size = Pt(11)
                    p.font.bold = True
                    p.font.color.rgb = RGBColor(255, 255, 255)

            table_rows_data = [
                ['"Explain why this is a Digital Twin and not static ML."', 'Coupled SciPy Bergmann Minimal ODE solver to propagate continuous 24-hr biological trajectories + 3D WebGL organ heatmaps.', '✅ Resolved'],
                ['"Upgrade architecture to XGBoost as per specification."', 'Upgraded ML engine to xgb.XGBRegressor & xgb.XGBClassifier achieving R^2 = 0.9324, MAE = 5.47 mg/dL.', '✅ Resolved'],
                ['"Demonstrate real data ingestion instead of synthetic data."', 'Added raw Dexcom / FreeStyle Libre CGM CSV parsing and PMData lifelogging benchmark dataset replayer.', '✅ Resolved'],
                ['"Show personalized parameter calibration per patient."', 'Implemented SciPy loss minimization module to extract personal Insulin Sensitivity (S_I) & Glucose Clearance (p1).', '✅ Resolved']
            ]

            for r, rdata in enumerate(table_rows_data, 1):
                for c, val in enumerate(rdata):
                    cell = table.cell(r, c)
                    cell.text = val
                    cell.fill.solid()
                    cell.fill.fore_color.rgb = COLOR_CARD_BG if r % 2 == 1 else RGBColor(241, 245, 249)
                    for p in cell.text_frame.paragraphs:
                        p.font.size = Pt(10)
                        p.font.color.rgb = COLOR_TEXT_MAIN

        elif sdata.get("content_type") == "benchmark_results":
            # Add table & callouts for slide 7
            rows, cols = 4, 4
            left, top, width, height = Inches(0.6), Inches(2.3), Inches(7.5), Inches(3.8)
            table_shape = slide.shapes.add_table(rows, cols, left, top, width, height)
            table = table_shape.table

            headers = ["Architecture / Model", "R^2 Score", "MAE (mg/dL)", "RMSE"]
            for c, h in enumerate(headers):
                cell = table.cell(0, c)
                cell.text = h
                cell.fill.solid()
                cell.fill.fore_color.rgb = COLOR_PRIMARY
                for p in cell.text_frame.paragraphs:
                    p.font.size = Pt(11)
                    p.font.bold = True
                    p.font.color.rgb = RGBColor(255, 255, 255)

            rows_data = [
                ["XGBoost (Primary Engine)", "0.9324", "5.47", "6.88"],
                ["Random Forest Regressor", "0.9069", "6.48", "8.07"],
                ["Ridge Baseline Model", "0.9340", "5.54", "6.80"]
            ]

            for r, rdata in enumerate(rows_data, 1):
                for c, val in enumerate(rdata):
                    cell = table.cell(r, c)
                    cell.text = val
                    cell.fill.solid()
                    cell.fill.fore_color.rgb = RGBColor(240, 249, 255) if r == 1 else COLOR_CARD_BG
                    for p in cell.text_frame.paragraphs:
                        p.font.size = Pt(11)
                        if r == 1: p.font.bold = True
                        p.font.color.rgb = COLOR_TEXT_MAIN

            # Metric Callout Card 1
            card1 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.5), Inches(2.3), Inches(4.2), Inches(1.8))
            card1.fill.solid()
            card1.fill.fore_color.rgb = RGBColor(240, 249, 255)
            card1.line.color.rgb = COLOR_ACCENT_BLUE
            tf1 = card1.text_frame
            tf1.margin_top = Inches(0.2)
            p1 = tf1.paragraphs[0]
            p1.text = "PRIMARY R² ACCURACY SCORE"
            p1.font.size = Pt(10)
            p1.font.bold = True
            p1.font.color.rgb = COLOR_ACCENT_BLUE
            p2 = tf1.add_paragraph()
            p2.text = "0.9324"
            p2.font.size = Pt(32)
            p2.font.bold = True
            p2.font.color.rgb = COLOR_ACCENT_BLUE

            # Metric Callout Card 2
            card2 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.5), Inches(4.3), Inches(4.2), Inches(1.8))
            card2.fill.solid()
            card2.fill.fore_color.rgb = RGBColor(240, 253, 244)
            card2.line.color.rgb = COLOR_ACCENT_EMERALD
            tf2 = card2.text_frame
            tf2.margin_top = Inches(0.2)
            p1 = tf2.paragraphs[0]
            p1.text = "MEAN ABSOLUTE ERROR (MAE)"
            p1.font.size = Pt(10)
            p1.font.bold = True
            p1.font.color.rgb = COLOR_ACCENT_EMERALD
            p2 = tf2.add_paragraph()
            p2.text = "5.47 mg/dL"
            p2.font.size = Pt(32)
            p2.font.bold = True
            p2.font.color.rgb = COLOR_ACCENT_EMERALD

        elif "boxes" in sdata:
            boxes = sdata["boxes"]
            n_boxes = len(boxes)
            b_width = (Inches(12.1) - Inches(0.3) * (n_boxes - 1)) / n_boxes

            for b_idx, box in enumerate(boxes):
                b_left = Inches(0.6) + b_idx * (b_width + Inches(0.3))
                card_shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, b_left, Inches(2.3), b_width, Inches(4.4))
                card_shape.fill.solid()
                card_shape.fill.fore_color.rgb = COLOR_CARD_BG
                card_shape.line.color.rgb = box.get("color", COLOR_CARD_BORDER)

                tf = card_shape.text_frame
                tf.word_wrap = True
                tf.margin_left = Inches(0.25)
                tf.margin_top = Inches(0.25)

                p_header = tf.paragraphs[0]
                p_header.text = box["title"]
                p_header.font.size = Pt(13)
                p_header.font.bold = True
                p_header.font.color.rgb = box.get("color", COLOR_PRIMARY)

                for line in box["lines"]:
                    p_line = tf.add_paragraph()
                    p_line.text = line
                    p_line.font.size = Pt(11)
                    p_line.font.color.rgb = COLOR_TEXT_MAIN
                    p_line.space_before = Pt(6)

        # Footer Bar
        fbar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(6.9), prs.slide_width, Inches(0.6))
        fbar.fill.solid()
        fbar.fill.fore_color.rgb = RGBColor(255, 255, 255)
        fbar.line.color.rgb = COLOR_CARD_BORDER

        tb_foot = slide.shapes.add_textbox(Inches(0.6), Inches(7.0), Inches(12.1), Inches(0.4))
        p_ft = tb_foot.text_frame.paragraphs[0]
        p_ft.text = f"Slide {slide_idx} of 10  |  AI-Powered Multimodal Health Digital Twin Framework"
        p_ft.font.size = Pt(10)
        p_ft.font.color.rgb = COLOR_TEXT_MUTED

    prs.save(pptx_filename)
    print(f"Successfully generated PPTX Presentation: {pptx_filename}")

if __name__ == "__main__":
    pdf_path = os.path.abspath("d:/Project 1/docs/Project_Report_Review3.pdf")
    pptx_path = os.path.abspath("d:/Project 1/docs/Review3_Presentation_Slides.pptx")
    
    build_pdf_report(pdf_path)
    build_pptx_slides(pptx_path)
