import React, { useState } from "react";
import { IoAlertCircle, IoBug, IoCheckmarkCircle, IoCopy, IoWarning } from "react-icons/io5"; 
import "./Analyzer.css";

const Analyzer = () => {
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({
    lexical: [],
    syntactic: [],
    semantic: [],
    empty: false,
  });
  const [validated, setValidated] = useState(false); // Nuevo estado para rastrear si se ha validado

  const includeRegex = /^#include\s*<[^<>]+>$/;
  const typeRegex =
    /^(int|float|char|double)\s+\w+(\s*=\s*[\d.]+)?\s*(,\s*\w+(\s*=\s*[\d.]+)?)*\s*;$/;
  //const functionRegex = /^\w+\s+\w+\s*\(.*\)\s*{$/;
  const mainFunctionRegex = /^int\s+main\s*\(\s*\)\s*{$/;
  const forLoopRegex = /^for\s*\(.*;.*;.*\)\s*{$/;
  const ifElseGroupRegex =
    /^(if\s*\(.*\)\s*{)|(else\s+if\s*\(.*\)\s*{)|(else\s*{)$/;
  const printfRegex = /^printf\s*\(\s*".*"\s*(,\s*\w+)*\s*\)\s*;$/;
  const scanfRegex = /^scanf\s*\(\s*".*"\s*,\s*&?\w+\s*\)\s*;$/;
  const returnRegex = /^return\s+\d+\s*;$/;
  const assignmentRegex = /^\w+\s*=\s*.*;$/;
  const continueRegex = /^continue\s*;$/;
  const compoundAssignmentRegex = /^\w+\s*\+=\s*\w+\s*;$/;
  const variableDeclarationRegex =
    /^(int|float|char|double)\s+\w+(\s*=\s*[\d.]+)?\s*(,\s*\w+(\s*=\s*[\d.]+)?)*\s*;$/;

  const validateCode = () => {
    setValidated(true); // Marcar como validado
    if (code.trim() === "") {
      setErrors({
        lexical: [],
        syntactic: [],
        semantic: [],
        empty: true,
      });
      return;
    }

    const lines = code.split("\n");
    const lexicalErrors = [];
    const syntacticErrors = [];
    const semanticErrors = [];

    lines.forEach((line, index) => {
      line = line.trim();
      if (line === "") return;

      if (
        !includeRegex.test(line) &&
        !typeRegex.test(line) &&
        //!functionRegex.test(line) &&
        !mainFunctionRegex.test(line) &&
        !forLoopRegex.test(line) &&
        !ifElseGroupRegex.test(line) &&
        !printfRegex.test(line) &&
        !scanfRegex.test(line) &&
        !returnRegex.test(line) &&
        !assignmentRegex.test(line) &&
        !continueRegex.test(line) &&
        !compoundAssignmentRegex.test(line) &&
        !variableDeclarationRegex.test(line) &&
        line !== "{" &&
        line !== "}"
      ) {
        // Classify errors
        if (line.startsWith("int main") && !mainFunctionRegex.test(line)) {
          syntacticErrors.push(
            `Error sintáctico en la línea ${index + 1}: ${line}`
          );
        } else if (/[^a-zA-Z0-9_#<>\s{};]/.test(line) || (line.startsWith("return") && !returnRegex.test(line))) {
          lexicalErrors.push(`Error léxico en la línea ${index + 1}: ${line}`);
        } else if (!/;$/.test(line) && line !== "{" && line !== "}") {
          syntacticErrors.push(
            `Error sintáctico en la línea ${index + 1}: ${line}`
          );
        } else {
          semanticErrors.push(
            `Error semántico en la línea ${index + 1}: ${line}`
          );
        }
      }

      // Check for extra tokens at end of #include directive
      if (line.startsWith("#include") && !/^#include\s*<[^<>]+>$/.test(line)) {
        syntacticErrors.push(
          `Error sintáctico en la línea ${
            index + 1
          }: tokens adicionales al final de la directiva #include`
        );
      }
    });

    // Check for unmatched braces
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      syntacticErrors.push(
        `Error sintáctico: número desigual de llaves de apertura y cierre { }.`
      );
    }

    // Check for unmatched parentheses
    const openParentheses = (code.match(/\(/g) || []).length;
    const closeParentheses = (code.match(/\)/g) || []).length;
    if (openParentheses !== closeParentheses) {
      syntacticErrors.push(
        `Error sintáctico: número desigual de paréntesis de apertura y cierre ( ).`
      );
    }

    setErrors({
      lexical: lexicalErrors,
      syntactic: syntacticErrors,
      semantic: semanticErrors,
      empty: false,
    });
  };

  const exampleCode = `#include <stdio.h>
#include <math.h>

int main() {
    float sueldo_diario, sueldo_semanal, sueldo_total = 0;
    int no_empleado, edad, faltas;
    char categoria;
    int c;

    for (c = 1; c <= 50; c++) {
        printf("Empleado %d:\\n", c);
        printf("Escribe tu categoría (1 o 2): ");
        scanf(" %c", &categoria);

        float comision;
        if (categoria == '1') {
            comision = 0.2;
        } else if (categoria == '2') {
            comision = 0.1;
        } else {
            printf("Categoría inválida, se omitirá este empleado.\\n");
            continue;
        }

        printf("Escribe tu sueldo diario: ");
        scanf("%f", &sueldo_diario);
        printf("Escribe tus faltas: ");
        scanf("%d", &faltas);

        sueldo_semanal = (sueldo_diario * 5) + (sueldo_diario * 5 * comision) - (faltas * sueldo_diario);

        if (sueldo_semanal < 0) {
            sueldo_semanal = 0;
        }

        sueldo_total += sueldo_semanal;

        printf("Empleado %d: Su sueldo semanal es: $%.2f\\n", c, sueldo_semanal);
        printf("\\n");
    }

    printf("El monto total de sueldos es: $%.2f\\n", sueldo_total);

    return 0;
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exampleCode).then(() => {
      alert("Código copiado al portapapeles");
    });
  };

  return (
    <div className="container">
      <div className="header">
        <h2>Código Corregido en C</h2>
        <button className="button2" onClick={copyToClipboard}>
          <IoCopy /> Copiar Código
        </button>
      </div>
      <div className="textarea-container">
        <textarea
          rows="20"
          cols="80"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Pega el Código Aquí..."
        />
      </div>
      <button onClick={validateCode}>
        <IoCheckmarkCircle /> Validar Código
      </button>
      {validated && errors.empty && (
        <div>
          <h3>El área de texto está vacía. Por favor, copie el código y peguelo.</h3>
        </div>
      )}
      {validated && errors.lexical.length > 0 && (
        <div className="errors">
          <h3><IoWarning /> Errores Léxicos:</h3>
          <ul>
            {errors.lexical.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {validated && errors.syntactic.length > 0 && (
        <div className="errors">
          <h3><IoAlertCircle /> Errores Sintácticos:</h3>
          <ul>
            {errors.syntactic.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {validated && errors.semantic.length > 0 && (
        <div className="errors">
          <h3><IoBug /> Errores Semánticos:</h3>
          <ul>
            {errors.semantic.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {validated && errors.lexical.length === 0 &&
        errors.syntactic.length === 0 &&
        errors.semantic.length === 0 &&
        !errors.empty && (
          <div className="no-errors">
            <h3>No se encontraron errores <IoCheckmarkCircle /></h3>
          </div>
        )}
    </div>
  );
};

export default Analyzer;