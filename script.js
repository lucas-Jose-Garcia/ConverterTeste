const config = {
    "FormDialogoMensagem().ClickBotao": "na mensagem",
    "Marcar": "clico ",
    "VerificarTexto": "espero que",
    "Click": "clico",
    "Digitar": "digito",
    "AtivarPorCaption": "acesso a aba"
};

const nomeComponentes = {
    "btn": "no botão",
    "edt": "no campo",
    "cb": "no campo",
    "ck": "no checkbox",
    "pc": "",
    "btnEdt": "no campo"
}

const dicionario = {
    "Descricao": "Descrição",
    "Razao": "Razão",
    "Codigo": "Código",
    "Veiculo": "Veículo",
    "Destinatario": "Destinatário",
    "Numero": "Número",
    "Liquido": "Líquido",
    "Informacoes": "Informações",
    "Saida": "Saída",
    "Classificacao": "Classificação",
    "Comissao": "Comissão",
    "Distancia": "Distância",
    "Calculo": "Cálculo",
    "Conteiner": "Contêiner",
    "Aviao": "Avião",
    "Vinculo": "Vínculo",
    "Observacoes": "Observações",
    "Observacao": "Observação",
    "Icms": "ICMS",
    "Diaria": "Diária",
    "Pais": "País",
    "Endereco": "Endereço",
    "Referencia": "Referência",
    "Secundario": "Secundário",
    "Contribuicao": "Contribuição",
    "Informacoes": "Informações",
    "Rntrc": "RNTRC",
    "Inscricao": "Inscrição",
    "Inss": "INSS",
    "Cep": "CEP",
    "Cobranca": "Cobrança",
    "Praca": "Praça",
    "Condicao": "Condição",
    "Agencia": "Agência",
    "Modulos": "Módulos",
    "Minimo": "Mínimo",
    "Cpf": "CPF",
    "Rg": "RG",
    "Emissao": "Emissão",
    "Orgao": "Orgão",
    "Admissao": "Admissão",
    "Cnh": "CNH",
    "Mae": "Mãe",
    "Pedagio": "Pedágio",
    "Horaria": "Horária",
    "Pis": "PIS",
    "Cofins": "COFINS",
    "Situacao": "Situação",
    "Tributaria": "Tributária",
    "Aliquota": "Alíquota",
}

const prefixos = ["edt", "cb", "btnEdt", "btn", "ck", "pc"];

function extrairProps(texto) {
    const textoDepoisParenteses = texto.substring(texto.indexOf("(")+1, texto.length);
    let originalValue = textoDepoisParenteses.substring(0, textoDepoisParenteses.lastIndexOf(")"));
    
    //tratar quando tiver ""
    const type = originalValue[0] == '"' ? 'texto' : 'variavel'
    if (type == 'texto') originalValue = originalValue.substring(1, originalValue.length - 1);

    return {type, originalValue}
}

function extrairNomeCampo(texto) {
    const regexPrefixos = new RegExp(`^(${prefixos.join("|")})`, 'i');

    const textoAntesParenteses = texto.substring(0, texto.indexOf("("));
    const textoDeste = textoAntesParenteses.substring(0, textoAntesParenteses.lastIndexOf("."));
    const textoDireita = textoDeste.substring(textoDeste.lastIndexOf(".") + 1);
    const nomeCampo = textoDireita.replace(regexPrefixos, '')
    const nomeCampoFormatado = formatarNomeCampo(adicionarEspacos(nomeCampo))

    //extrair componente
    let tratamento = ""
    prefixos.forEach((prefixo) => {
        if (textoDeste.includes(prefixo)) {
            tratamento = nomeComponentes[prefixo]
        }
    }) 

    return {nomeCampo, tratamento, nomeCampoFormatado}
}

function formatarPrimeiraLetraParaMaiuscula(texto) {
    let formato = ""
    if (texto !== "") {
        formato = texto[0].toUpperCase() + texto.slice(1)
    }

    return formato
}

function formatarPrimeiraLetraParaMinuscula(texto) {
    let formato = ""
    if (texto !== "") {
        formato = texto[0].toLowerCase() + texto.slice(1)
    }

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

function extrairInformacoesPreRequisito(linha) {
    const dados = linha.split('=')
    const parametro = dados[0].trim()
    const parametroFormatado = formatarNomeCampo(adicionarEspacos(parametro))
    const valor = dados[1].trim()
    return {parametro, valor: valor[0] == '"' ? valor.substring(1, valor.length-1) : valor, parametroFormatado}
}

function adicionarEspacos(str) {
    const format = str.replace(/([A-Z])/g, ' \$1').trim();
    return format
}

function formatarNomeCampo(campo) {
    let result = campo
    for (const key in dicionario) {
        if (result.includes(key)) result = result.replace(key, dicionario[key])
    }
    return result
}


document.addEventListener("DOMContentLoaded", function () {
    const inputTextarea = document.getElementById("inputTextarea");
    const outputTextarea = document.getElementById("outputTextarea");
    const convertButton = document.getElementById("convertButton");

    const inputTextareaPre = document.getElementById("inputTextareaPre");
    const outputTextareaPre = document.getElementById("outputTextareaPre"); 
    const convertButtonPreRequisito = document.getElementById("convertButtonPreRequisito");


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
                    const {type, originalValue} = extrairProps(originalLine)
                    const {nomeCampo, tratamento, nomeCampoFormatado} = extrairNomeCampo(originalLine)

                    if (originalValue !== '') {
                        gherkin += gherkin !== '' ? ' ' : '' 
                        gherkin += type == 'texto' ? `['${originalValue}']` : `['{${originalValue}}']`

                        //Definir o valor da variável
                        variavel = formatarPrimeiraLetraParaMinuscula(nomeCampo)
                    }
                    
                    //adiciona o nome do campo ao gherkin
                    gherkin += gherkin[gherkin.length - 1] !== ' ' && tratamento !== '' || nomeCampo !== ''  ? ' ' : ''
                    gherkin += `${tratamento}${tratamento !== '' ? ' ': ''}${nomeCampoFormatado}`

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
        navigator.clipboard.writeText(outputText);

    });

    convertButtonPreRequisito.addEventListener("click", function () {
        const value = inputTextareaPre.value.trim()
        const infos = value.split("\n")
        const variavel = infos[0].substring(0, infos[0].indexOf("=") - 1)
        let outputText = "";

        if (value !== '') {
            for (index = 2; index < infos.length - 1; index++) {
                let linha = infos[index].trim()
                linha = linha[linha.length-1] == ',' ? linha.substring(0, linha.length-1) : linha

                const {parametro, parametroFormatado, valor} = extrairInformacoesPreRequisito(linha)
                const strVariavel = formatarPrimeiraLetraParaMinuscula(parametro)

                outputText += `E($"com a ${parametroFormatado} ['${valor}']", (string ${strVariavel}) => { ${variavel}.${parametro} = ${strVariavel}; });\n` 
            }
        }

        outputText += `E($"cadastro o/a ${variavel}", () => { ${variavel}.Adicionar(); });\n`
        outputTextareaPre.value = outputText;
        navigator.clipboard.writeText(outputText);
    });

});


function validaValor(input) {
    if (input.value.length > 2) {
        input.value = input.value.slice(0, 2);
    }
    input.value = Math.min(Math.max(input.value, 1), 99);
}