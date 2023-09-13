const config = {
    "btnIncluir": "clico no botão Incluir",
    "Digitar": "digito ",
    "btnConfirmar": "clico no botão Confirmar",
    "FormDialogoMensagem().ClickBotao": "na mensagem [*] clico no botão [*]",
    "Marcar": "clico no checkbox ",
    "VerificarTexto": "espero que o campo [*] esteja preenchido com ",
    "Click": "clico no botão ",
};

function extrairTexto(texto) {
    const prefixos = ["edt", "cb", "btnEdt"];
    const regexPrefixos = new RegExp(`^(${prefixos.join("|")})`, 'i');

    let textoAntesParenteses = texto.substring(0, texto.indexOf("("));
    let textoDeste = textoAntesParenteses.substring(0, textoAntesParenteses.lastIndexOf("."));
    let textoDireita = textoDeste.substring(textoDeste.lastIndexOf(".") + 1);
    return textoDireita.replace(regexPrefixos, '');
}


document.addEventListener("DOMContentLoaded", function () {
    const inputTextarea = document.getElementById("inputTextarea");
    const outputTextarea = document.getElementById("outputTextarea");
    const convertButton = document.getElementById("convertButton");
    const regexForParentheses = /\(([^)]+)\)/;
    

    const regexAspas = /["']/g

    convertButton.addEventListener("click", function () {
        const inputText = inputTextarea.value;
        const lines = inputText.split("\n");
        let outputText = "";
        let formattedLine = "";
        let palavra = "";
        let variavel = "";
        let textoComVariavel = ""
        let componente = ""

        for (const line of lines) {
            if (line.trim() !== "") {
                const originalLine = line.trim()

                if (!originalLine.includes("//")) {
                    formattedLine =  `E($"", () => { ${line.trim()} });`;
                    for (const key in config) {
                        if (originalLine.includes(key)) {
                            if (originalLine.includes("Digitar") || originalLine.includes("VerificarTexto")) {
                                originalValue = regexForParentheses.exec(originalLine)[1]
                                palavra = extrairTexto(originalLine)
                                variavel = palavra[0].toLowerCase() + palavra.slice(1)
                                textoComVariavel = originalLine.replace(regexForParentheses, `(${variavel})`);
                            }

                            if (formattedLine.includes("VerificarTexto") && originalLine.includes('"')) {
                                formattedLine = `E($"${config[key]}['${originalValue.replace(regexAspas, '')}']", (string ${variavel}) => { ${textoComVariavel} });`
                                break;
                            } else if (formattedLine.includes("VerificarTexto")) {
                                formattedLine = `E($"${config[key]}['${originalValue.replace(regexAspas, '')}'] no campo ${palavra}", (string ${variavel}) => { ${textoComVariavel} });`
                                break;
                            }

                            if (originalLine.includes("Digitar") || formattedLine.includes("VerificarTexto") && originalLine.includes('"') && !originalLine.includes('DateTime')) {
                                formattedLine = `E($"${config[key]}['${originalValue.replace(regexAspas, '')}'] no campo ${palavra}", (string ${variavel}) => { ${textoComVariavel} });`
                            } else if (originalLine.includes("Digitar") || formattedLine.includes("VerificarTexto")) {
                                formattedLine = `E($"${config[key]}['{${originalValue.replace(regexAspas, '')}}'] no campo ${palavra}", (string ${variavel}) => { ${textoComVariavel} });`
                            } else {
                                formattedLine = `E($"${config[key]}", () => { ${originalLine} });`;
                            }
                            break; // Saia do loop assim que encontrar a correspondência
                        }
                    }
                } else {
                    formattedLine = originalLine
                }
            } else {
                formattedLine = ""
            }
            
            outputText += formattedLine + "\n";
        }

        outputTextarea.value = outputText;
    });
});
