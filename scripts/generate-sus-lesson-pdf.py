"""Gera um PDF autoral de demonstração. Publicação depende de revisão editorial."""
from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

root = Path(__file__).resolve().parents[1]
output = root / "public" / "editorial-assets" / "sus-principios-diretrizes-estrutura.pdf"
output.parent.mkdir(parents=True, exist_ok=True)
teal, mint, sky, ink = HexColor("#0F766E"), HexColor("#D1FAE5"), HexColor("#E0F2FE"), HexColor("#1F2937")
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="BrandTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=24, leading=29, textColor=teal, spaceAfter=14))
styles.add(ParagraphStyle(name="BrandH2", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=15, leading=19, textColor=teal, spaceBefore=12, spaceAfter=8))
styles.add(ParagraphStyle(name="BodyBrand", parent=styles["BodyText"], fontName="Helvetica", fontSize=11, leading=16, textColor=ink, spaceAfter=9))
styles.add(ParagraphStyle(name="SmallBrand", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.5, leading=11, textColor=ink, spaceAfter=5))

def footer(canvas, doc):
    canvas.saveState(); canvas.setStrokeColor(teal); canvas.line(2*cm, 1.5*cm, A4[0]-2*cm, 1.5*cm)
    canvas.setFillColor(ink); canvas.setFont("Helvetica", 8)
    canvas.drawString(2*cm, 1.08*cm, "OdontoTrack | Material complementar | Versão editorial 0.1")
    canvas.drawRightString(A4[0]-2*cm, 1.08*cm, f"Página {doc.page}"); canvas.restoreState()

def map_diagram():
    table = Table([["UNIVERSALIDADE", "INTEGRALIDADE", "ORGANIZAÇÃO"], ["Acesso em todos os níveis", "Ações preventivas e curativas", "Direção e coordenação do SUS"]], colWidths=[5.3*cm]*3, rowHeights=[1.0*cm, 1.9*cm])
    table.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), teal), ("TEXTCOLOR", (0,0), (-1,0), white), ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"), ("FONTSIZE", (0,0), (-1,-1), 10), ("BACKGROUND", (0,1), (0,1), mint), ("BACKGROUND", (1,1), (1,1), sky), ("BACKGROUND", (2,1), (2,1), HexColor("#ECFDF5")), ("GRID", (0,0), (-1,-1), 0.5, teal), ("VALIGN", (0,0), (-1,-1), "MIDDLE"), ("ALIGN", (0,0), (-1,-1), "CENTER"), ("LEFTPADDING", (0,0), (-1,-1), 7), ("RIGHTPADDING", (0,0), (-1,-1), 7)]))
    return table

story = [
    Paragraph("ODONTOTRACK | ODONTOLOGIA", styles["SmallBrand"]), Paragraph("Princípios, diretrizes e estrutura do SUS", styles["BrandTitle"]),
    Paragraph("Objetivo: relacionar universalidade, integralidade e organização do SUS ao conteúdo programático do Concurso Público 01/2025 de Mauá.", styles["BodyBrand"]),
    Paragraph("Tempo estimado: 35 minutos. Material complementar, não substitui o edital nem a legislação.", styles["SmallBrand"]), Spacer(1, 10),
    Paragraph("O que você precisa dominar", styles["BrandH2"]), Paragraph("O Anexo II do edital inclui SUS e atenção básica. A Lei nº 8.080/1990 é usada nesta aula para explicar princípios e organização do sistema. Leia o texto legal junto com este resumo.", styles["BodyBrand"]),
    Paragraph("Mapa de revisão", styles["BrandH2"]), map_diagram(), Spacer(1, 7), Paragraph("Figura 1. Ilustração autoral OdontoTrack. Síntese didática fundamentada na Lei nº 8.080/1990, art. 7º. Referência do conteúdo: Presidência da República, Lei nº 8.080/1990.", styles["SmallBrand"]),
    Paragraph("Pontos de atenção para prova", styles["BrandH2"]), Paragraph("Universalidade se refere ao acesso. Integralidade reúne ações e serviços preventivos e curativos. Ao resolver questões, confira se a alternativa altera o sentido do texto legal ou confunde o edital com a legislação.", styles["BodyBrand"]),
    Paragraph("Questão de revisão", styles["BrandH2"]), Paragraph("Segundo a Lei nº 8.080/1990, qual princípio assegura o acesso aos serviços de saúde em todos os níveis de assistência?", styles["BodyBrand"]), Paragraph("Resposta comentada: universalidade. O art. 7º traz a universalidade de acesso aos serviços de saúde em todos os níveis de assistência.", styles["BodyBrand"]), PageBreak(),
    Paragraph("Fontes consultadas", styles["BrandTitle"]), Paragraph("1. Prefeitura do Município de Mauá. Edital de Abertura do Concurso Público 01/2025, Anexo II, página 31. Disponível em: https://dom.maua.sp.gov.br/public/docs/6ecd834695e6ea7958f1f7c1aa804bde.pdf. Acesso em 31 ago. 2026.", styles["BodyBrand"]), Paragraph("2. BRASIL. Lei nº 8.080, de 19 de setembro de 1990. Disponível em: https://www.planalto.gov.br/ccivil_03/leis/l8080.htm. Acesso em 31 ago. 2026.", styles["BodyBrand"]), Paragraph("Nota editorial: ilustração autoral OdontoTrack criada para este material e fundamentada na fonte 2. Texto elaborado com apoio de automação editorial e sujeito à revisão humana antes da publicação.", styles["SmallBrand"]),
]
SimpleDocTemplate(str(output), pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2.1*cm, title="Princípios, diretrizes e estrutura do SUS").build(story, onFirstPage=footer, onLaterPages=footer)
print(output)
