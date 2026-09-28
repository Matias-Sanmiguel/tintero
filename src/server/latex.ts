import "server-only";

import { execFile } from "child_process";
import { access, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { promisify } from "util";
import { budgetTotal, fecha, pesos, todayISO } from "./format";
import type { Budget, Member, Project } from "./types";

const execFileAsync = promisify(execFile);

export function texEscape(value: string) {
  return value
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/[&%$#_{}]/g, (char) => `\\${char}`)
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function paragraphs(value: string) {
  return texEscape(value)
    .split(/\n{2,}/)
    .map((part) => part.replace(/\n/g, " "))
    .join("\n\n");
}

function money(value: number) {
  return texEscape(pesos(value));
}

export function budgetTex(input: {
  budget: Budget;
  project: Project;
  owner: Member | undefined;
}) {
  const { budget, project, owner } = input;
  const rows = budget.items
    .map((item) => {
      const ref = item.supplierUrl
        ? `\\url{${item.supplierUrl.replace(/[{}\\]/g, "")}}`
        : "---";
      return `${texEscape(item.description)} & ${item.quantity} & ${money(item.unitPrice)} & ${money(item.quantity * item.unitPrice)} & ${ref} \\\\`;
    })
    .join("\n");
  const due = budget.dueDate
    ? `Fecha límite de presentación: ${texEscape(fecha(budget.dueDate))}.`
    : "";

  return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[margin=2.2cm]{geometry}
\\usepackage{booktabs}
\\usepackage{tabularx}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\definecolor{imasblue}{HTML}{2134FC}
\\definecolor{imaslime}{HTML}{B4FF3B}
\\hypersetup{colorlinks=true,urlcolor=imasblue,linkcolor=imasblue}
\\pagestyle{empty}
\\begin{document}
{\\color{imasblue}\\textbf{\\LARGE imas}}{\\color{imaslime}\\textbf{\\LARGE +}}\\\\[2pt]
{\\small tech club --- Universidad Argentina de la Empresa}\\\\
\\vspace{1.4em}
{\\LARGE\\textbf{Presupuesto}}\\\\[0.4em]
${texEscape(budget.title)}
\\par\\vspace{1em}
\\noindent
\\begin{tabular}{@{}ll@{}}
Fecha & ${texEscape(fecha(todayISO()))} \\\\
Para & ${texEscape(budget.recipient)} \\\\
Asunto & ${texEscape(budget.subject)} \\\\
Proyecto & ${texEscape(project.name)} \\\\
Responsable & ${texEscape(owner?.name ?? "IMAS+")} \\\\
Estado & ${texEscape(budget.status)} \\\\
\\end{tabular}
\\par\\vspace{1em}
${paragraphs(budget.rationale)}
\\par\\vspace{0.4em}
${due}
\\par\\vspace{1em}
\\noindent
\\begin{tabularx}{\\textwidth}{@{}Xrrrl@{}}
\\toprule
Descripción & Cant. & Unitario & Subtotal & Referencia \\\\
\\midrule
${rows || "\\multicolumn{5}{l}{Sin ítems} \\\\"}
\\midrule
\\multicolumn{3}{r}{\\textbf{Total}} & \\textbf{${money(budgetTotal(budget.items))}} & \\\\
\\bottomrule
\\end{tabularx}
\\par\\vspace{2.2em}
\\noindent
IMAS+ tech club --- UADE\\\\
Documento generado desde la mesa del club.
\\end{document}
`;
}

export async function compileTex(tex: string) {
  const dir = await mkdtemp(path.join(tmpdir(), "tintero-"));
  const texPath = path.join(dir, "presupuesto.tex");
  await writeFile(texPath, tex, "utf8");
  try {
    const candidates = [
      path.join(process.cwd(), "src/server/engine/tectonic"),
      path.join(process.cwd(), "bin/tectonic"),
    ];
    let tectonic: string | null = null;
    for (const candidate of candidates) {
      try {
        await access(candidate);
        tectonic = candidate;
        break;
      } catch {
        tectonic = null;
      }
    }
    const hasTectonic = tectonic != null;
    if (hasTectonic) {
      await execFileAsync(tectonic!, ["--untrusted", "-o", dir, texPath], {
        cwd: dir,
        timeout: 180000,
        env: {
          ...process.env,
          HOME: dir,
          TECTONIC_CACHE_DIR: path.join(tmpdir(), "tectonic-cache"),
        },
      });
    } else {
      await execFileAsync(
        "pdflatex",
        ["-interaction=nonstopmode", "-halt-on-error", "presupuesto.tex"],
        { cwd: dir, timeout: 30000 },
      );
    }
    const pdf = await readFile(path.join(dir, "presupuesto.pdf"));
    return { pdf, log: "" };
  } catch (error) {
    let log = error instanceof Error ? error.message : "No se pudo compilar";
    try {
      log = await readFile(path.join(dir, "presupuesto.log"), "utf8");
    } catch {
      // keep the exec error
    }
    const tail = log.split("\n").slice(-40).join("\n");
    return { pdf: null, log: tail };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

export function fileSlug(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "presupuesto";
}
