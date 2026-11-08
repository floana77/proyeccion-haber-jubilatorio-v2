#!/usr/bin/env python3
"""Valida un PRD en markdown contra las reglas de la skill crear-prd.

Uso:
    python3 lint_prd.py <archivo.md> [--strict]

Revisa solo lo mecánico (formato, IDs, trazabilidad, números, palabras vagas).
Que un criterio sea de verdad medible o que los objetivos no se contradigan
lo tiene que juzgar una persona.

Código de salida: 1 si hay errores (con --strict, también si hay advertencias).
"""
import argparse
import re
import sys
import unicodedata

REQUIRED = [
    ("contexto y problema", "Contexto y Problema"),
    ("objetivos", "Objetivos"),
    ("requerimientos funcionales", "Requerimientos Funcionales"),
    ("requerimientos no funcionales", "Requerimientos No Funcionales"),
    ("criterios de aceptacion", "Criterios de Aceptación"),
    ("fuera de alcance", "Fuera de Alcance"),
    ("riesgos y dependencias", "Riesgos y Dependencias"),
]
REQ_KEYS = [k for k, _ in REQUIRED]
PRETTY = dict(REQUIRED)

VAGUE = re.compile(
    r"\b(correctamente|adecuad[oa]s?|apropiad[oa]s?|r[aá]pid[oa]s?|r[aá]pidamente|"
    r"f[aá]cil(mente)?|intuitiv[oa]s?|amigable|claridad|suficientes?|razonables?|"
    r"[oó]ptim[oa]s?|simples?|lo antes posible|etc)\b",
    re.IGNORECASE,
)
ITEM_START = re.compile(r"^\s*[-*]\s+")
ID_DEF = re.compile(r"^\s*[-*]\s+\**\s*(RNF|RF|AC|OBJ)-(\d+[a-z]?)\b", re.IGNORECASE)
REF = re.compile(r"\b(RNF|RF)-(\d+)\b", re.IGNORECASE)
PLACEHOLDER = re.compile(r"\[COMPLETAR[^\]]*\]", re.IGNORECASE)
QUOTED = re.compile(r'"[^"\n]*"|“[^”\n]*”')
DATE = re.compile(r"\b\d{1,2}/\d{1,2}/\d{4}\b")
MONTH_YEAR = re.compile(
    r"\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|"
    r"setiembre|octubre|noviembre|diciembre)\s+(de\s+)?\d{4}\b",
    re.IGNORECASE,
)
TIME_UNIT = re.compile(r"\b\d+([.,]\d+)?\s*(ms|s|seg|segundos)\b", re.IGNORECASE)
PERCENTILE = re.compile(r"\bp\d{2}(\.\d+)?\b|percentil", re.IGNORECASE)


def norm(text):
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c)).lower()
    text = re.sub(r"[*_`]", "", text)
    text = re.sub(r"^\d+[.)]\s*", "", text.strip())
    return text.strip(" :.-")


def read_sections(lines):
    """Devuelve (título, secciones) donde secciones es lista de dicts con
    key, raw, start (línea 1-based del encabezado) y lines [(nro, texto)]."""
    title = None
    sections = []
    current = None
    in_fence = False
    for i, line in enumerate(lines, start=1):
        if line.strip().startswith("```"):
            in_fence = not in_fence
        if not in_fence:
            if title is None and re.match(r"^#\s+\S", line):
                title = (i, line.strip())
                continue
            m = re.match(r"^##\s+(.*\S)\s*$", line)
            if m:
                current = {"key": norm(m.group(1)), "raw": m.group(1), "start": i, "lines": []}
                sections.append(current)
                continue
        if current is not None:
            current["lines"].append((i, line))
    return title, sections


def items_of(section):
    """Agrupa las líneas de una sección en ítems de lista (con continuaciones)."""
    items = []
    for nro, line in section["lines"]:
        if ITEM_START.match(line):
            items.append([nro, line.strip()])
        elif line.strip() and items and not line.lstrip().startswith(("#", "|", "<!--")):
            items[-1][1] += " " + line.strip()
    return [(n, t) for n, t in items]


def strip_noise(text):
    text = PLACEHOLDER.sub("", text)
    return QUOTED.sub("", text)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("archivo")
    ap.add_argument("--strict", action="store_true", help="las advertencias también hacen fallar")
    args = ap.parse_args()

    try:
        with open(args.archivo, encoding="utf-8") as f:
            text = f.read()
    except OSError as e:
        print(f"No pude leer {args.archivo}: {e}", file=sys.stderr)
        return 2

    lines = text.splitlines()
    findings = []  # (nivel, línea, mensaje)

    def add(level, nro, msg):
        findings.append((level, nro, msg))

    title, sections = read_sections(lines)

    # Título
    if title is None:
        add("ERROR", 1, "Falta el título `# PRD-001: <nombre> — <una línea>`.")
    elif not re.match(r"^#\s+PRD-\d{3,}:\s+.+\s+—\s+.+$", title[1]):
        add("ERROR", title[0], "El título no sigue `# PRD-NNN: <nombre> — <una línea de qué es>` (con raya larga —).")

    # Secciones
    by_key = {}
    for s in sections:
        by_key.setdefault(s["key"], s)
    for key, pretty in REQUIRED:
        if key not in by_key:
            add("ERROR", 1, f"Falta la sección obligatoria «{pretty}».")
    present = [k for k in REQ_KEYS if k in by_key]
    starts = [by_key[k]["start"] for k in present]
    if starts != sorted(starts):
        add("WARN", 1, "Las secciones obligatorias no están en el orden del template.")
    last_required = by_key["riesgos y dependencias"]["start"] if "riesgos y dependencias" in by_key else None
    for s in sections:
        if s["key"] not in REQ_KEYS and last_required is not None and s["start"] < last_required:
            add("WARN", s["start"], f"La sección extra «{s['raw']}» está antes de las obligatorias; las opcionales van al final.")

    def section_items(key):
        return items_of(by_key[key]) if key in by_key else []

    # Objetivos
    objs = {}
    for nro, t in section_items("objetivos"):
        m = ID_DEF.match(t)
        if m and m.group(1).upper() == "OBJ":
            objs[m.group(2)] = nro
    if "objetivos" in by_key and not objs:
        add("WARN", by_key["objetivos"]["start"], "Los objetivos no tienen ID (OBJ-01, OBJ-02…).")

    # RF / RNF / AC
    def collect(key, prefix):
        found = {}
        for nro, t in section_items(key):
            m = ID_DEF.match(t)
            if m and m.group(1).upper() == prefix:
                id_ = f"{prefix}-{m.group(2)}"
                if id_ in found:
                    add("ERROR", nro, f"ID duplicado {id_} (también en la línea {found[id_][0]}).")
                else:
                    found[id_] = (nro, t)
        return found

    rfs = collect("requerimientos funcionales", "RF")
    rnfs = collect("requerimientos no funcionales", "RNF")
    acs = collect("criterios de aceptacion", "AC")

    if "requerimientos funcionales" in by_key and not rfs:
        add("ERROR", by_key["requerimientos funcionales"]["start"], "No hay RF con ID (`- RF-01: El sistema debe…`).")
    if "requerimientos no funcionales" in by_key and not rnfs:
        add("ERROR", by_key["requerimientos no funcionales"]["start"], "No hay RNF con ID (`- RNF-01: …`).")
    if "criterios de aceptacion" in by_key and not acs:
        add("ERROR", by_key["criterios de aceptacion"]["start"],
            "No hay AC con ID (`- AC-01 (RF-01): Dado…, cuando…, entonces…`). Las tablas de casos de prueba no cuentan.")

    for id_, (nro, t) in rfs.items():
        body = strip_noise(re.sub(r"^\s*[-*]\s+\**\s*RF-\d+[a-z]?\**\s*:?\**\s*", "", t))
        if not re.match(r"^\s*El sistema debe\b", body, re.IGNORECASE):
            add("WARN", nro, f"{id_}: conviene empezar con «El sistema debe <verbo>».")
        if VAGUE.search(body):
            add("WARN", nro, f"{id_}: palabra vaga «{VAGUE.search(body).group(0)}»; ¿es verificable?")

    # Trazabilidad AC -> RF/RNF
    covered = set()
    for id_, (nro, t) in acs.items():
        m = re.match(r"^\s*[-*]\s+\**\s*AC-\d+[a-z]?\**\s*\(([^)]*)\)", t, re.IGNORECASE)
        refs = [f"{a.upper()}-{b}" for a, b in REF.findall(m.group(1))] if m else []
        if not refs:
            add("ERROR", nro, f"{id_}: no indica qué RF o RNF verifica, con el formato `AC-01 (RF-01):`.")
        for r in refs:
            covered.add(r)
            if r not in rfs and r not in rnfs:
                add("ERROR", nro, f"{id_}: referencia a {r}, que no existe.")
        low = t.lower()
        if not (re.search(r"\bdad[oa]s?\b", low) and re.search(r"\bcuando\b", low) and re.search(r"\bentonces\b", low)):
            add("ERROR", nro, f"{id_}: no tiene la forma Dado… cuando… entonces….")
        vague = VAGUE.search(strip_noise(t))
        if vague:
            add("WARN", nro, f"{id_}: palabra vaga «{vague.group(0)}»; el criterio debe ser binario y medible.")
        if "100%" in t:
            add("WARN", nro, f"{id_}: menciona 100%; ¿es alcanzable y demostrable?")

    for id_, (nro, _) in rfs.items():
        if id_ not in covered:
            add("ERROR", nro, f"{id_} no tiene ningún AC que lo verifique.")
    for id_, (nro, _) in rnfs.items():
        if id_ not in covered:
            add("ERROR", nro, f"{id_} no tiene ningún AC que lo verifique.")

    # RNF con número
    for id_, (nro, t) in rnfs.items():
        body = re.sub(r"^\s*[-*]\s+\**\s*RNF-\d+[a-z]?\**\s*:?\**\s*", "", t)
        has_placeholder = bool(PLACEHOLDER.search(body))
        clean = PLACEHOLDER.sub("", body)
        if not re.search(r"\d", clean):
            if has_placeholder:
                add("WARN", nro, f"{id_}: número pendiente ([COMPLETAR]).")
            else:
                add("ERROR", nro, f"{id_}: no tiene ningún número; toda cualidad necesita un valor medible.")
        if TIME_UNIT.search(clean) and not PERCENTILE.search(clean):
            add("WARN", nro, f"{id_}: tiene un tiempo pero no un percentil (p95, p99…).")
        if "100%" in clean:
            add("WARN", nro, f"{id_}: menciona 100%; ¿es alcanzable y demostrable?")
        vague = VAGUE.search(strip_noise(clean))
        if vague:
            add("WARN", nro, f"{id_}: palabra vaga «{vague.group(0)}» junto a la cifra; revisá que sea medible.")

    for nro, t in section_items("objetivos"):
        if "100%" in t and TIME_UNIT.search(t):
            add("WARN", nro, "Objetivo con «100%» sobre un tiempo; conviene un percentil (p95).")

    # Fuera de alcance
    if "fuera de alcance" in by_key and not section_items("fuera de alcance"):
        add("ERROR", by_key["fuera de alcance"]["start"], "«Fuera de Alcance» no lista nada; debe ser explícito.")

    # Riesgos y dependencias
    if "riesgos y dependencias" in by_key:
        risks = [(n, t) for n, t in section_items("riesgos y dependencias") if re.match(r"^\s*[-*]\s+\**\s*Riesgo\b", t, re.IGNORECASE)]
        deps = [(n, t) for n, t in section_items("riesgos y dependencias") if re.match(r"^\s*[-*]\s+\**\s*Dependencia\b", t, re.IGNORECASE)]
        if not risks:
            add("WARN", by_key["riesgos y dependencias"]["start"], "No hay ningún «Riesgo: … → mitigación: …».")
        if not deps:
            add("WARN", by_key["riesgos y dependencias"]["start"], "No hay ninguna «Dependencia: …».")
        for n, t in risks:
            if not re.search(r"mitigaci[oó]n", t, re.IGNORECASE):
                add("WARN", n, "Riesgo sin «→ mitigación: …».")

    # Informativos
    pend = [(i, l) for i, l in enumerate(lines, start=1) if PLACEHOLDER.search(l)]
    proposed = sum(1 for l in lines if re.search(r"a validar", l, re.IGNORECASE))
    dates = []
    for i, l in enumerate(lines, start=1):
        for m in list(DATE.finditer(l)) + list(MONTH_YEAR.finditer(l)):
            dates.append((i, m.group(0)))

    order = {"ERROR": 0, "WARN": 1}
    for level, nro, msg in sorted(findings, key=lambda f: (order[f[0]], f[1])):
        print(f"[{level}] línea {nro}: {msg}")

    if pend:
        print(f"\n[INFO] {len(pend)} línea(s) con [COMPLETAR] pendientes:")
        for i, l in pend:
            snippet = PLACEHOLDER.search(l).group(0)
            print(f"  línea {i}: {snippet}")
    if proposed:
        print(f"\n[INFO] {proposed} línea(s) con valores marcados «a validar».")
    if dates:
        print("\n[INFO] Fechas mencionadas (verificá a mano que sean coherentes entre sí):")
        for i, d in dates:
            print(f"  línea {i}: {d}")

    errors = sum(1 for f in findings if f[0] == "ERROR")
    warns = sum(1 for f in findings if f[0] == "WARN")
    print(f"\nResumen: {errors} error(es), {warns} advertencia(s), {len(pend)} pendiente(s) [COMPLETAR].")
    print(f"Cobertura: {len(rfs)} RF, {len(rnfs)} RNF, {len(acs)} AC, {len(objs)} OBJ.")
    if errors or (args.strict and warns):
        return 1
    print("Sin errores." if not warns else "Sin errores (hay advertencias para revisar).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
