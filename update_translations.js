const fs = require('fs');
const path = require('path');

const basePath = path.join('c:', 'Users', 'mujta', 'Desktop', 'calora', 'messages');

const translations = {
  en: {
    pdfShell: {
      uploadPrompt: "Upload a PDF to {action}",
      selectFiles: "Select {type} Files",
      browseFiles: "Browse {type} Files",
      maxSize: "Max file size: {size}MB",
      selectedFile: "Selected File:",
      selectedFiles: "Selected Files ({count}):",
      processing: "Processing...",
      processingComplete: "Processing Complete!",
      original: "Original: {size}",
      result: "Result: {size}",
      download: "Download {format}",
      processAnother: "Process Another",
      tryAgain: "Try Again",
      compressPdf: "Compress PDF",
      mergePdf: "Merge PDF",
      originalSize: "Original size: {size}"
    },
    bmiTool: {
      metric: "Metric (kg, cm)",
      imperial: "Imperial (lbs, ft-in)",
      measurements: "Interactive Body Measurements",
      weight: "Weight",
      height: "Height",
      heightFeet: "Height (Feet)",
      heightInches: "Height (Inches)",
      weightDescMetric: "Drag slider or use - / + steppers for precision weight.",
      heightDescMetric: "Drag slider or use - / + steppers for precision height.",
      weightDescImperial: "Drag slider or use - / + steppers for precision weight in pounds.",
      liveFormula: "Live Formula Breakdown:",
      gaugeTitle: "Visual BMI Category Gauge",
      underweight: "Underweight",
      normalWeight: "Normal weight",
      overweight: "Overweight",
      obese: "Obese",
      healthyRange: "Healthy Weight Range",
      yourBmi: "Your BMI is"
    },
    percentageTool: {
      xPctOfY: "What is X% of Y?",
      xIsWhatPctOfY: "X is what % of Y?",
      pctIncrease: "Percentage Increase (X → Y)",
      pctDecrease: "Percentage Decrease (X → Y)",
      pctDifference: "Percentage Difference",
      reversePct: "Reverse % (X is Y% of what?)",
      progressRing: "Progress Ring & Breakdown",
      liveFormula: "Live Calculation Formula:",
      calculatedResult: "Calculated Result"
    },
    wordCounterTool: {
      title: "Text Statistics Engine",
      countWords: "Count Words",
      words: "Words",
      characters: "Characters",
      noSpaces: "No Spaces",
      sentences: "Sentences",
      paragraphs: "Paragraphs",
      readingTime: "Reading Time",
      copyText: "Copy Text",
      clearText: "Clear Text"
    },
    jsonTool: {
      title: "JSON Processing Engine",
      formatJson: "Format JSON",
      minifyJson: "Minify JSON",
      indent: "Indent Spacing:",
      twoSpaces: "2 Spaces",
      fourSpaces: "4 Spaces",
      copyOutput: "Copy Output",
      clear: "Clear"
    }
  },
  es: {
    pdfShell: {
      uploadPrompt: "Sube un PDF para {action}",
      selectFiles: "Seleccionar archivos {type}",
      browseFiles: "Buscar archivos {type}",
      maxSize: "Tamaño máximo de archivo: {size}MB",
      selectedFile: "Archivo seleccionado:",
      selectedFiles: "Archivos seleccionados ({count}):",
      processing: "Procesando...",
      processingComplete: "¡Procesamiento completo!",
      original: "Original: {size}",
      result: "Resultado: {size}",
      download: "Descargar {format}",
      processAnother: "Procesar otro",
      tryAgain: "Intentar de nuevo",
      compressPdf: "Comprimir PDF",
      mergePdf: "Unir PDF",
      originalSize: "Tamaño original: {size}"
    },
    bmiTool: {
      metric: "Métrico (kg, cm)",
      imperial: "Imperial (lbs, ft-in)",
      measurements: "Medidas corporales interactivas",
      weight: "Peso",
      height: "Altura",
      heightFeet: "Altura (Pies)",
      heightInches: "Altura (Pulgadas)",
      weightDescMetric: "Arrastre el control deslizante o use los botones - / + para el peso exacto.",
      heightDescMetric: "Arrastre el control deslizante o use los botones - / + para la altura exacta.",
      weightDescImperial: "Arrastre el control deslizante o use los botones - / + para el peso exacto en libras.",
      liveFormula: "Desglose de la fórmula en vivo:",
      gaugeTitle: "Indicador visual de categoría de BMI",
      underweight: "Bajo peso",
      normalWeight: "Peso normal",
      overweight: "Sobrepeso",
      obese: "Obeso",
      healthyRange: "Rango de peso saludable",
      yourBmi: "Su BMI es"
    },
    percentageTool: {
      xPctOfY: "¿Cuánto es el X% de Y?",
      xIsWhatPctOfY: "¿X es qué % de Y?",
      pctIncrease: "Aumento porcentual (X → Y)",
      pctDecrease: "Disminución porcentual (X → Y)",
      pctDifference: "Diferencia porcentual",
      reversePct: "% inverso (¿X es el Y% de qué?)",
      progressRing: "Anillo de progreso y desglose",
      liveFormula: "Fórmula de cálculo en vivo:",
      calculatedResult: "Resultado calculado"
    },
    wordCounterTool: {
      title: "Motor de estadísticas de texto",
      countWords: "Contar palabras",
      words: "Palabras",
      characters: "Caracteres",
      noSpaces: "Sin espacios",
      sentences: "Oraciones",
      paragraphs: "Párrafos",
      readingTime: "Tiempo de lectura",
      copyText: "Copiar texto",
      clearText: "Borrar texto"
    },
    jsonTool: {
      title: "Motor de procesamiento JSON",
      formatJson: "Formatear JSON",
      minifyJson: "Minificar JSON",
      indent: "Espaciado de sangría:",
      twoSpaces: "2 espacios",
      fourSpaces: "4 espacios",
      copyOutput: "Copiar salida",
      clear: "Borrar"
    }
  },
  fr: {
    pdfShell: {
      uploadPrompt: "Téléchargez un PDF pour {action}",
      selectFiles: "Sélectionner des fichiers {type}",
      browseFiles: "Parcourir les fichiers {type}",
      maxSize: "Taille max. du fichier : {size}Mo",
      selectedFile: "Fichier sélectionné :",
      selectedFiles: "Fichiers sélectionnés ({count}) :",
      processing: "Traitement en cours...",
      processingComplete: "Traitement terminé !",
      original: "Original : {size}",
      result: "Résultat : {size}",
      download: "Télécharger {format}",
      processAnother: "Traiter un autre",
      tryAgain: "Réessayer",
      compressPdf: "Compresser PDF",
      mergePdf: "Fusionner PDF",
      originalSize: "Taille originale : {size}"
    },
    bmiTool: {
      metric: "Métrique (kg, cm)",
      imperial: "Impérial (lbs, ft-in)",
      measurements: "Mesures corporelles interactives",
      weight: "Poids",
      height: "Taille",
      heightFeet: "Taille (Pieds)",
      heightInches: "Taille (Pouces)",
      weightDescMetric: "Faites glisser le curseur ou utilisez les boutons - / + pour un poids précis.",
      heightDescMetric: "Faites glisser le curseur ou utilisez les boutons - / + pour une taille précise.",
      weightDescImperial: "Faites glisser le curseur ou utilisez les boutons - / + pour un poids précis en livres.",
      liveFormula: "Détail de la formule en direct :",
      gaugeTitle: "Indicateur visuel de catégorie d'IMC",
      underweight: "Insuffisance pondérale",
      normalWeight: "Poids normal",
      overweight: "Surpoids",
      obese: "Obèse",
      healthyRange: "Plage de poids de forme",
      yourBmi: "Votre IMC est"
    },
    percentageTool: {
      xPctOfY: "Quel est X % de Y ?",
      xIsWhatPctOfY: "X est quel % de Y ?",
      pctIncrease: "Augmentation en pourcentage (X → Y)",
      pctDecrease: "Diminution en pourcentage (X → Y)",
      pctDifference: "Différence en pourcentage",
      reversePct: "% Inversé (X est Y % de quoi ?)",
      progressRing: "Anneau de progression et détail",
      liveFormula: "Formule de calcul en direct :",
      calculatedResult: "Résultat calculé"
    },
    wordCounterTool: {
      title: "Moteur de statistiques de texte",
      countWords: "Compter les mots",
      words: "Mots",
      characters: "Caractères",
      noSpaces: "Sans espaces",
      sentences: "Phrases",
      paragraphs: "Paragraphes",
      readingTime: "Temps de lecture",
      copyText: "Copier le texte",
      clearText: "Effacer le texte"
    },
    jsonTool: {
      title: "Moteur de traitement JSON",
      formatJson: "Formater JSON",
      minifyJson: "Minifier JSON",
      indent: "Espacement d'indentation :",
      twoSpaces: "2 espaces",
      fourSpaces: "4 espaces",
      copyOutput: "Copier la sortie",
      clear: "Effacer"
    }
  },
  de: {
    pdfShell: {
      uploadPrompt: "Laden Sie ein PDF hoch zum {action}",
      selectFiles: "{type} Dateien auswählen",
      browseFiles: "{type} Dateien durchsuchen",
      maxSize: "Max. Dateigröße: {size}MB",
      selectedFile: "Ausgewählte Datei:",
      selectedFiles: "Ausgewählte Dateien ({count}):",
      processing: "Wird verarbeitet...",
      processingComplete: "Verarbeitung abgeschlossen!",
      original: "Original: {size}",
      result: "Ergebnis: {size}",
      download: "{format} herunterladen",
      processAnother: "Ein weiteres verarbeiten",
      tryAgain: "Erneut versuchen",
      compressPdf: "PDF komprimieren",
      mergePdf: "PDF zusammenführen",
      originalSize: "Originalgröße: {size}"
    },
    bmiTool: {
      metric: "Metrisch (kg, cm)",
      imperial: "Imperial (lbs, ft-in)",
      measurements: "Interaktive Körpermaße",
      weight: "Gewicht",
      height: "Größe",
      heightFeet: "Größe (Fuß)",
      heightInches: "Größe (Zoll)",
      weightDescMetric: "Schieberegler ziehen oder - / + Tasten für genaues Gewicht verwenden.",
      heightDescMetric: "Schieberegler ziehen oder - / + Tasten für genaue Größe verwenden.",
      weightDescImperial: "Schieberegler ziehen oder - / + Tasten für genaues Gewicht in Pfund verwenden.",
      liveFormula: "Live-Formelaufschlüsselung:",
      gaugeTitle: "Visuelle BMI-Kategorieanzeige",
      underweight: "Untergewicht",
      normalWeight: "Normalgewicht",
      overweight: "Übergewicht",
      obese: "Adipös",
      healthyRange: "Gesunder Gewichtsbereich",
      yourBmi: "Ihr BMI ist"
    },
    percentageTool: {
      xPctOfY: "Was sind X% von Y?",
      xIsWhatPctOfY: "X ist wie viel % von Y?",
      pctIncrease: "Prozentualer Anstieg (X → Y)",
      pctDecrease: "Prozentualer Rückgang (X → Y)",
      pctDifference: "Prozentualer Unterschied",
      reversePct: "Umgekehrte % (X ist Y% von was?)",
      progressRing: "Fortschrittsring & Aufschlüsselung",
      liveFormula: "Live-Berechnungsformel:",
      calculatedResult: "Berechnetes Ergebnis"
    },
    wordCounterTool: {
      title: "Textstatistik-Engine",
      countWords: "Wörter zählen",
      words: "Wörter",
      characters: "Zeichen",
      noSpaces: "Ohne Leerzeichen",
      sentences: "Sätze",
      paragraphs: "Absätze",
      readingTime: "Lesezeit",
      copyText: "Text kopieren",
      clearText: "Text löschen"
    },
    jsonTool: {
      title: "JSON-Verarbeitungs-Engine",
      formatJson: "JSON formatieren",
      minifyJson: "JSON minifizieren",
      indent: "Einrückungsabstand:",
      twoSpaces: "2 Leerzeichen",
      fourSpaces: "4 Leerzeichen",
      copyOutput: "Ausgabe kopieren",
      clear: "Löschen"
    }
  },
  it: {
    pdfShell: {
      uploadPrompt: "Carica un PDF per {action}",
      selectFiles: "Seleziona file {type}",
      browseFiles: "Sfoglia file {type}",
      maxSize: "Dimensione max file: {size}MB",
      selectedFile: "File selezionato:",
      selectedFiles: "File selezionati ({count}):",
      processing: "Elaborazione...",
      processingComplete: "Elaborazione completata!",
      original: "Originale: {size}",
      result: "Risultato: {size}",
      download: "Scarica {format}",
      processAnother: "Elabora un altro",
      tryAgain: "Riprova",
      compressPdf: "Comprimi PDF",
      mergePdf: "Unisci PDF",
      originalSize: "Dimensione originale: {size}"
    },
    bmiTool: {
      metric: "Metrico (kg, cm)",
      imperial: "Imperiale (lbs, ft-in)",
      measurements: "Misure corporee interattive",
      weight: "Peso",
      height: "Altezza",
      heightFeet: "Altezza (Piedi)",
      heightInches: "Altezza (Pollici)",
      weightDescMetric: "Trascina il cursore o usa i pulsanti - / + per un peso preciso.",
      heightDescMetric: "Trascina il cursore o usa i pulsanti - / + per un'altezza precisa.",
      weightDescImperial: "Trascina il cursore o usa i pulsanti - / + per un peso preciso in libbre.",
      liveFormula: "Dettaglio della formula in tempo reale:",
      gaugeTitle: "Indicatore visivo di categoria BMI",
      underweight: "Sottopeso",
      normalWeight: "Normopeso",
      overweight: "Sovrappeso",
      obese: "Obeso",
      healthyRange: "Intervallo di peso forma",
      yourBmi: "Il tuo BMI è"
    },
    percentageTool: {
      xPctOfY: "Qual è l'X% di Y?",
      xIsWhatPctOfY: "X è quale % di Y?",
      pctIncrease: "Aumento percentuale (X → Y)",
      pctDecrease: "Diminuzione percentuale (X → Y)",
      pctDifference: "Differenza percentuale",
      reversePct: "% Inversa (X è l'Y% di cosa?)",
      progressRing: "Anello di avanzamento e dettaglio",
      liveFormula: "Formula di calcolo in tempo reale:",
      calculatedResult: "Risultato calcolato"
    },
    wordCounterTool: {
      title: "Motore di statistiche di testo",
      countWords: "Conta parole",
      words: "Parole",
      characters: "Caratteri",
      noSpaces: "Senza spazi",
      sentences: "Frasi",
      paragraphs: "Paragrafi",
      readingTime: "Tempo di lettura",
      copyText: "Copia testo",
      clearText: "Cancella testo"
    },
    jsonTool: {
      title: "Motore di elaborazione JSON",
      formatJson: "Formatta JSON",
      minifyJson: "Minimizza JSON",
      indent: "Spaziatura rientro:",
      twoSpaces: "2 spazi",
      fourSpaces: "4 spazi",
      copyOutput: "Copia output",
      clear: "Cancella"
    }
  }
};

const files = ['en', 'es', 'fr', 'de', 'it'];

files.forEach(lang => {
  const filePath = path.join(basePath, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Add the namespaces
    Object.assign(data, translations[lang]);
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`Updated ${lang}.json`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});
