import React, { useState } from "react";
import "./Analyzer.css";

const Analyzer = () => {
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({
    lexical: [],
    syntactic: [],
    semantic: [],
  });

  const includeRegex = /^#include\s*<.*>$/;
  const typeRegex = /^(int|float|char|double)\s+\w+(\s*=\s*[\d.]+)?\s*(,\s*\w+(\s*=\s*[\d.]+)?)*\s*;$/;
  //const functionRegex = /^\w+\s+\w+\s*\(.*\)\s*{$/;
  const mainFunctionRegex = /^int\s+main\s*\(\s*\)\s*{$/;
  const forLoopRegex = /^for\s*\(.*;.*;.*\)\s*{$/;
  const ifElseGroupRegex = /^(if\s*\(.*\)\s*{)|(else\s+if\s*\(.*\)\s*{)|(else\s*{)$/;
  const printfRegex = /^printf\s*\(\s*".*"\s*(,\s*\w+)*\s*\)\s*;$/;
  const scanfRegex = /^scanf\s*\(\s*".*"\s*,\s*&?\w+\s*\)\s*;$/;
  const returnRegex = /^return\s+\d+\s*;$/;
  const assignmentRegex = /^\w+\s*=\s*.*;$/;
  const continueRegex = /^continue\s*;$/;
  const compoundAssignmentRegex = /^\w+\s*\+=\s*\w+\s*;$/;
  const variableDeclarationRegex = /^(int|float|char|double)\s+\w+(\s*=\s*[\d.]+)?\s*(,\s*\w+(\s*=\s*[\d.]+)?)*\s*;$/;

  const validateCode = () => {
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
          syntacticErrors.push(`Error sintáctico en la línea ${index + 1}: ${line}`);
        } else if (/[^a-zA-Z0-9_#<>\s{};]/.test(line)) {
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
    });

    // Check for unmatched braces
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      syntacticErrors.push(`Error sintáctico: número desigual de llaves de apertura y cierre.`);
    }

    // Check for unmatched parentheses
    const openParentheses = (code.match(/\(/g) || []).length;
    const closeParentheses = (code.match(/\)/g) || []).length;
    if (openParentheses !== closeParentheses) {
      syntacticErrors.push(`Error sintáctico: número desigual de paréntesis de apertura y cierre.`);
    }

    setErrors({
      lexical: lexicalErrors,
      syntactic: syntacticErrors,
      semantic: semanticErrors,
    });
  };

  return (
    <div>
      <textarea
        rows="20"
        cols="80"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Ingrese su código aquí..."
      />
      <button onClick={validateCode}>Validar Código</button>
      {errors.lexical.length > 0 && (
        <div>
          <h3>Errores Léxicos:</h3>
          <ul>
            {errors.lexical.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {errors.syntactic.length > 0 && (
        <div>
          <h3>Errores Sintácticos:</h3>
          <ul>
            {errors.syntactic.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {errors.semantic.length > 0 && (
        <div>
          <h3>Errores Semánticos:</h3>
          <ul>
            {errors.semantic.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {errors.lexical.length === 0 &&
        errors.syntactic.length === 0 &&
        errors.semantic.length === 0 && (
          <div>
            <h3>No se encontraron errores 😃</h3>
          </div>
        )}
    </div>
  );
};

export default Analyzer;