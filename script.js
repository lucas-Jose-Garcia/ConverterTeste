const config = {
    "FormDialogoMensagem().ClickBotao": "na mensagem",
    "Marcar": "clico ",
    "VerificarTexto": "espero que ",
    "Click": "clico",
    "Digitar": "digito",
};

const nomeComponentes = {
    "btn": "no botão",
    "edt": "no campo",
    "cb": "no combobox",
    "ck": "no checkbox",
    "pc": "na aba",
    "btnEdt": "no campo"
}

const prefixos = ["edt", "cb", "btnEdt", "btn", "ck", "pc"];

function extrairPropsDaLinha(texto) {
    const textoDepoisParenteses = texto.substring(texto.indexOf("(")+1, texto.length);
    let textoDeste = textoDepoisParenteses.substring(0, textoDepoisParenteses.lastIndexOf(")"));
    
    //tratar quando tiver ""
    const type = textoDeste[0] == '"' ? 'texto' : 'variavel'
    if (type == 'texto') textoDeste = textoDeste.substring(1, texto.length - 1);

    return [type, textoDeste]
}

function extrairNomeCampo(texto) {
    const regexPrefixos = new RegExp(`^(${prefixos.join("|")})`, 'i');

    const textoAntesParenteses = texto.substring(0, texto.indexOf("("));
    const textoDeste = textoAntesParenteses.substring(0, textoAntesParenteses.lastIndexOf("."));
    const textoDireita = textoDeste.substring(textoDeste.lastIndexOf(".") + 1);

    //extrair componente
    let tratamento = ""
    prefixos.forEach((prefixo) => {
        if (textoDeste.includes(prefixo)) {
            tratamento = nomeComponentes[prefixo]
        }
    }) 

    return [textoDireita.replace(regexPrefixos, ''), tratamento]
}

function formatarPrimeiraLetraParaMinuscula(texto) {
    const formato = texto[0].toLowerCase() + texto.slice(1)
    return formato
}

function adicionarVariavelNoAction(original, variavel) {
    let resut = ""
    if (variavel !== '') {
        const textoAntesParenteses = original.substring(0, original.indexOf("(")+1);
        resut = textoAntesParenteses + variavel + ");"
    } else {
        resut = original
    }

    return resut
}


document.addEventListener("DOMContentLoaded", function () {
    const inputTextarea = document.getElementById("inputTextarea");
    const outputTextarea = document.getElementById("outputTextarea");
    const convertButton = document.getElementById("convertButton");

    convertButton.addEventListener("click", function () {
        const inputText = inputTextarea.value;
        const lines = inputText.split("\n");
        let outputText = "";
        let formattedLine = "";

        for (const line of lines) {
            let gherkin = ""
            let variavel = ""
            let action = ""
            const originalLine = line.trim()

            if (line.trim() !== "") {
                if (!originalLine.includes("//") && !originalLine.includes("region")) {

                    //verifica se existe algum texto padrão para a linha atual
                    for (const key in config) {
                        if (originalLine.includes(key)) {
                            gherkin += config[key]
                            break;
                        }
                    }

                    //adiciona o conteúdo do parênteses no gherkin
                    const props = extrairPropsDaLinha(originalLine)
                    const type = props[0]
                    const originalValue = props[1]
                    const campo = extrairNomeCampo(originalLine)
                    const nomeCampo = campo[0]
                    const tratamento = campo[1]

                    if (originalValue !== '') {
                        gherkin += gherkin !== '' ? ' ' : '' 
                        gherkin += type == 'texto' ? `['${originalValue}']` : `['{${originalValue}}']`

                        //Definir o valor da variável
                        variavel = formatarPrimeiraLetraParaMinuscula(nomeCampo)
                    }
                    
                    //adiciona o nome do campo ao gherkin
                    gherkin += gherkin[gherkin.length] !== ' ' && tratamento !== '' || nomeCampo !== ''  ? ' ' : ''
                    gherkin += `${tratamento}${tratamento !== '' ? ' ': ''}${nomeCampo}`

                    //Definir a ação 
                    action = adicionarVariavelNoAction(originalLine, variavel)


                    //Concatena os valores
                    formattedLine = `E($"${gherkin}", (${variavel !== '' ? 'string ' : ''}${variavel}) => { ${action} });`
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
