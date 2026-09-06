"""Gera os sete PDFs restantes da trilha de Mauá com fontes e diagramas autorais."""
from pathlib import Path
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "editorial-assets"
OUTPUT.mkdir(parents=True, exist_ok=True)
EDITAL = ("Prefeitura do Município de Mauá. Edital de Abertura do Concurso Público 01/2025, Anexo II, página 31.", "https://dom.maua.sp.gov.br/public/docs/6ecd834695e6ea7958f1f7c1aa804bde.pdf")
SOURCES = {
    "atencao-basica": ("Ministério da Saúde. Caderno de Atenção Básica nº 17, Saúde Bucal.", "https://bvsms.saude.gov.br/bvs/publicacoes/saude_bucal.pdf"),
    "diagnostico": ("Ministério da Saúde. Ficha de Atendimento Odontológico Individual, e-SUS APS.", "https://sisaps.saude.gov.br/sistemas/esusaps/docs/manual/CDS/CDS_04/"),
    "prevencao": ("Ministério da Saúde. Guia de recomendações para o uso de fluoretos no Brasil, 2ª edição.", "https://bvsms.saude.gov.br/bvs/publicacoes/guia_recomendacoes_uso_fluoretos_Brasil_2ed.pdf"),
    "dentistica": ("Ministério da Saúde. Diretrizes Clínicas para a APS.", "https://www.gov.br/saude/pt-br/composicao/saps/brasil-sorridente/diretrizes-clinicas-para-a-aps"),
    "farmacologia": ("Ministério da Saúde. Diretrizes Clínicas para a APS.", "https://www.gov.br/saude/pt-br/composicao/saps/brasil-sorridente/diretrizes-clinicas-para-a-aps"),
    "especialidades": ("Ministério da Saúde. Diretrizes Clínicas para a APS.", "https://www.gov.br/saude/pt-br/composicao/saps/brasil-sorridente/diretrizes-clinicas-para-a-aps"),
    "urgencia": ("Ministério da Saúde. Saúde bucal na Atenção Primária à Saúde.", "https://www.gov.br/saude/pt-br/composicao/saps/brasil-sorridente/saude-bucal-na-aps"),
}
LESSONS = [
    ("atencao-basica", "Atenção básica e saúde bucal", "Aplicar a organização da atenção básica e da saúde bucal ao contexto municipal.", ["Território e acesso", "Equipe e cuidado", "Rede e continuidade"]),
    ("diagnostico", "Exame clínico, anamnese e diagnóstico", "Organizar o estudo das etapas de avaliação, registro e plano preventivo-terapêutico.", ["Anamnese", "Exame clínico", "Registro e plano"]),
    ("prevencao", "Prevenção, flúor e higiene dental", "Revisar os temas de prevenção e uso de fluoretos previstos no edital.", ["Risco e proteção", "Fluoretos", "Orientação em saúde"]),
    ("dentistica", "Dentística, materiais e oclusão", "Estruturar a revisão de dentística, materiais restauradores e oclusão.", ["Diagnóstico", "Planejamento", "Revisão crítica"]),
    ("farmacologia", "Farmacologia odontológica", "Organizar uma leitura segura de farmacologia odontológica para prova.", ["Indicação", "Segurança", "Revisão de diretriz"]),
    ("especialidades", "Periodontia, odontopediatria e endodontia", "Separar os pontos de estudo das especialidades listadas no edital.", ["Periodontia", "Odontopediatria", "Endodontia"]),
    ("urgencia", "Cirurgia, urgência e biossegurança", "Preparar a revisão de urgências, cirurgia e biossegurança.", ["Avaliação", "Conduta", "Segurança"]),
]

TEAL, MINT, SKY, INK = HexColor("#0F766E"), HexColor("#D1FAE5"), HexColor("#E0F2FE"), HexColor("#1F2937")
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="BrandTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=22, leading=27, textColor=TEAL, spaceAfter=13))
styles.add(ParagraphStyle(name="BrandH2", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=15, leading=19, textColor=TEAL, spaceBefore=12, spaceAfter=8))
styles.add(ParagraphStyle(name="BodyBrand", parent=styles["BodyText"], fontName="Helvetica", fontSize=11, leading=16, textColor=INK, spaceAfter=9))
styles.add(ParagraphStyle(name="SmallBrand", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.5, leading=11, textColor=INK, spaceAfter=5))

def footer(canvas, doc):
    canvas.saveState(); canvas.setStrokeColor(TEAL); canvas.line(2*cm, 1.5*cm, A4[0]-2*cm, 1.5*cm)
    canvas.setFillColor(INK); canvas.setFont("Helvetica", 8)
    canvas.drawString(2*cm, 1.08*cm, "OdontoTrack | Material complementar | Versão editorial 0.1")
    canvas.drawRightString(A4[0]-2*cm, 1.08*cm, f"Página {doc.page}"); canvas.restoreState()

def diagram(items):
    table = Table([items, ["Leia a fonte indicada", "Relacione com o edital", "Resolva questões autorais"]], colWidths=[5.3*cm]*3, rowHeights=[1.0*cm, 1.75*cm])
    table.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), TEAL), ("TEXTCOLOR", (0,0), (-1,0), white), ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"), ("FONTSIZE", (0,0), (-1,-1), 10), ("BACKGROUND", (0,1), (0,1), MINT), ("BACKGROUND", (1,1), (1,1), SKY), ("BACKGROUND", (2,1), (2,1), HexColor("#ECFDF5")), ("GRID", (0,0), (-1,-1), .5, TEAL), ("ALIGN", (0,0), (-1,-1), "CENTER"), ("VALIGN", (0,0), (-1,-1), "MIDDLE"), ("LEFTPADDING", (0,0), (-1,-1), 7), ("RIGHTPADDING", (0,0), (-1,-1), 7)]))
    return table

def make_pdf(key, title, objective, items):
    secondary = SOURCES[key]
    output = OUTPUT / f"{key}.pdf"
    focus = ", ".join(items).lower()
    story = [
        Paragraph("ODONTOTRACK | ODONTOLOGIA", styles["SmallBrand"]), Paragraph(title, styles["BrandTitle"]),
        Paragraph(f"Objetivo: {objective}", styles["BodyBrand"]), Paragraph("Tempo estimado: 30 minutos. Material complementar, não substitui o edital nem a fonte técnica.", styles["SmallBrand"]), Spacer(1, 10),
        Paragraph("O que você precisa dominar", styles["BrandH2"]), Paragraph(f"O Anexo II do edital inclui este tema. Use esta aula para organizar a revisão de {focus}. A fonte técnica indicada serve para aprofundar o estudo sem alterar o escopo definido pelo edital.", styles["BodyBrand"]),
        Paragraph("Mapa de revisão", styles["BrandH2"]), diagram(items), Spacer(1, 7),
        Paragraph(f"Figura 1. Ilustração autoral OdontoTrack. Roteiro didático de estudo fundamentado no edital e na fonte técnica listada ao final. Referência visual: {secondary[0]}", styles["SmallBrand"]),
        Paragraph("Roteiro de estudo", styles["BrandH2"]), Paragraph("Comece pela leitura do item correspondente no edital. Em seguida, localize os conceitos na fonte técnica, anote termos que se repetem e monte perguntas de comparação. Não transforme este roteiro em protocolo de atendimento. Para questões clínicas, a resposta deve ser conferida na referência revisada.", styles["BodyBrand"]),
        Paragraph("Questão de revisão", styles["BrandH2"]), Paragraph(f"Qual é a função desta aula na trilha? A) Substituir o edital. B) Organizar a revisão de {focus} com base no tema previsto e em fontes identificadas. C) Prescrever condutas individualizadas. D) Confirmar datas do concurso.", styles["BodyBrand"]), Paragraph("Resposta comentada: alternativa B. A aula organiza o estudo. O edital continua sendo a evidência do conteúdo cobrado e as fontes técnicas sustentam o aprofundamento.", styles["BodyBrand"]), PageBreak(),
        Paragraph("Fontes consultadas", styles["BrandTitle"]), Paragraph(f"1. {EDITAL[0]} Disponível em: {EDITAL[1]}. Acesso em 6 set. 2026.", styles["BodyBrand"]), Paragraph(f"2. {secondary[0]} Disponível em: {secondary[1]}. Acesso em 6 set. 2026.", styles["BodyBrand"]), Paragraph("Referência da imagem: Ilustração autoral OdontoTrack, criada para este material e fundamentada nas fontes 1 e 2. Texto elaborado com apoio de automação editorial e sujeito à revisão humana antes da publicação.", styles["SmallBrand"]),
    ]
    SimpleDocTemplate(str(output), pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2.1*cm, title=title).build(story, onFirstPage=footer, onLaterPages=footer)
    return output

if __name__ == "__main__":
    for lesson in LESSONS: print(make_pdf(*lesson))
